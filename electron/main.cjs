const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    }
  });

  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`[Renderer] ${message}`);
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handler to fetch data using Node.js to bypass CORS
ipcMain.handle('fetch-downtime-data', async (event, url, token, params) => {
  return new Promise((resolve, reject) => {
    try {
      const urlObj = new URL(url);
      if (params) {
        Object.keys(params).forEach(key => urlObj.searchParams.append(key, params[key]));
      }
      
      const options = {
        method: 'GET',
        headers: {
          'Authorization': token
        }
      };

      const client = urlObj.protocol === 'https:' ? https : http;
      const req = client.request(urlObj, options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve({ data: JSON.parse(data) });
            } catch (e) {
              resolve({ data: data });
            }
          } else {
            resolve({ error: true, status: res.statusCode, message: res.statusMessage });
          }
        });
      });

      req.on('error', (e) => resolve({ error: true, message: e.message }));
      req.end();
    } catch (e) {
      resolve({ error: true, message: e.message });
    }
  });
});

ipcMain.handle('perform-auto-login', async (event, empId, password) => {
  return new Promise((resolve, reject) => {
    try {
      const loginWindow = new BrowserWindow({
        width: 800,
        height: 600,
        show: false,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true
        }
      });
      
      let resolved = false;
      const safeResolve = (data) => {
        if (!resolved) {
          resolved = true;
          resolve(data);
        }
      };

      // Load EPMS login page
      loginWindow.loadURL('http://10.190.0.184:8080/eam/report_management/eqp_report/eqp_utilization_rate');
      
      loginWindow.webContents.on('did-finish-load', () => {
        const url = loginWindow.webContents.getURL();
        if (url.includes('/login') || url.includes('/core/api/auth/login')) {
          const injectScript = `
            try {
              const u = document.querySelector('input[name="username"]') || document.querySelector('input[name="loginName"]') || document.querySelector('input[name="empId"]');
              const p = document.querySelector('input[name="password"]');
              if (u && p) {
                u.value = '${empId}';
                p.value = '${password}';
                // Trigger react/vue input events
                u.dispatchEvent(new Event('input', { bubbles: true }));
                p.dispatchEvent(new Event('input', { bubbles: true }));
                const btn = document.querySelector('button[type="submit"]') || document.querySelector('.login-btn');
                if (btn) btn.click();
              }
            } catch (e) {}
          `;
          loginWindow.webContents.executeJavaScript(injectScript).catch(() => {});
        }
      });

      let attempts = 0;
      const pollInterval = setInterval(async () => {
        if (resolved) {
          clearInterval(pollInterval);
          return;
        }
        attempts++;
        if (attempts >= 60) {
          clearInterval(pollInterval);
          if (!loginWindow.isDestroyed()) loginWindow.close();
          safeResolve({ error: true, message: 'Timeout waiting for login.' });
          return;
        }
        
        if (loginWindow.isDestroyed()) {
          clearInterval(pollInterval);
          return;
        }
        
        try {
          const checkTokenScript = `
            (function() {
              let t = localStorage.getItem('auth._token.local') || sessionStorage.getItem('auth._token.local');
              if (!t) {
                const match = document.cookie.match(/(?:^|;\\s*)auth\\._token\\.local=([^;]*)/);
                if (match) {
                  t = decodeURIComponent(match[1]);
                }
              }
              return t;
            })();
          `;
          const token = await loginWindow.webContents.executeJavaScript(checkTokenScript).catch(() => null);
          
          if (token && token.startsWith('Bearer')) {
            const url = loginWindow.webContents.getURL();
            if (!url.includes('/login')) {
              clearInterval(pollInterval);
              safeResolve({ error: false, token: token });
              if (!loginWindow.isDestroyed()) loginWindow.close();
            }
          }
        } catch (e) {}
      }, 500);

    } catch (err) {
      resolve({ error: true, message: err.message });
    }
  });
});
