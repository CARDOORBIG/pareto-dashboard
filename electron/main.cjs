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
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#0f172a',
      symbolColor: '#f8fafc',
      height: 32
    },
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
      // Build query string
      const queryParams = new URLSearchParams(params).toString();
      const fullUrl = `${url}?${queryParams}`;
      
      const client = fullUrl.startsWith('https') ? https : http;
      
      const options = {
        headers: {
          'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      const req = client.get(fullUrl, options, (res) => {
        if (res.statusCode === 401 || res.statusCode === 403) {
          resolve({ error: true, status: res.statusCode, message: 'Token expired or invalid' });
          return;
        }
        
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            resolve({ error: false, data: json });
          } catch (e) {
            resolve({ error: true, message: 'Invalid JSON response from server' });
          }
        });
      });
      
      req.on('error', (e) => {
        resolve({ error: true, message: e.message });
      });
      
      req.end();
    } catch (err) {
      resolve({ error: true, message: err.message });
    }
  });
});

// IPC handler to perform automated login via hidden window
ipcMain.handle('perform-auto-login', async (event, username, password) => {
  return new Promise((resolve, reject) => {
    try {
      let isResolved = false;
      let hasNavigatedToReport = false;
      let loginWindow = null;

      const safeResolve = (data) => {
        if (!isResolved) {
          isResolved = true;
          if (loginWindow && !loginWindow.isDestroyed()) {
            try {
              loginWindow.webContents.session.webRequest.onBeforeSendHeaders(null);
            } catch (e) {
              console.error('[AutoLogin] Error clearing webRequest filter:', e.message);
            }
          }
          resolve(data);
        }
      };

      loginWindow = new BrowserWindow({
        width: 800,
        height: 600,
        show: false, // Hidden window
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true
        }
      });

      loginWindow.on('closed', () => {
        safeResolve({ error: true, message: 'Login process was interrupted.' });
      });

      // Intercept outgoing headers to grab authorization bearer token
      loginWindow.webContents.session.webRequest.onBeforeSendHeaders(
        { urls: ['*://*/*'] },
        (details, callback) => {
          try {
            const url = details.url;
            const authKey = Object.keys(details.requestHeaders).find(k => k.toLowerCase() === 'authorization');
            if (authKey) {
              const authValue = details.requestHeaders[authKey];
              if (authValue && authValue.startsWith('Bearer ')) {
                console.log(`[AutoLogin] Successfully intercepted Bearer token from request: ${url}`);
                clearInterval(pollInterval);
                safeResolve({ error: false, token: authValue });
                setTimeout(() => {
                  if (loginWindow && !loginWindow.isDestroyed()) {
                    loginWindow.close();
                  }
                }, 50);
              }
            }
          } catch (e) {
            console.error('[AutoLogin] Error in onBeforeSendHeaders:', e.message);
          }
          callback({ cancel: false });
        }
      );

      loginWindow.loadURL('http://10.190.0.184:8080/login');

      // Attempt to fill credentials once the page loads
      loginWindow.webContents.on('did-finish-load', async () => {
        if (isResolved) return;
        
        const currentUrl = loginWindow.webContents.getURL();
        
        // If we are on the login page, fill credentials
        if (currentUrl.includes('/login')) {
          try {
            const fillScript = `
              (function() {
                const usernameInput = document.querySelector('input[type="text"]') || document.querySelector('input[name="username"]') || document.querySelector('input[placeholder*="Username"]');
                const passwordInput = document.querySelector('input[type="password"]');
                const loginBtn = document.querySelector('button.ant-btn-primary') || document.querySelector('button[type="button"]');

                if (usernameInput && passwordInput && loginBtn && !usernameInput.value) {
                  usernameInput.value = '${username}';
                  usernameInput.dispatchEvent(new Event('input', { bubbles: true }));
                  
                  passwordInput.value = '${password}';
                  passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
                  
                  setTimeout(() => {
                    loginBtn.click();
                  }, 500);
                  return true;
                }
                return false;
              })();
            `;
            await loginWindow.webContents.executeJavaScript(fillScript).catch(() => {});
          } catch (e) {
            // Ignore errors during DOM injection
          }
        }
      });

      // Navigate to report page after successful login
      loginWindow.webContents.on('did-navigate', (event, url) => {
        if (!url.includes('/login') && !hasNavigatedToReport) {
          hasNavigatedToReport = true;
          setTimeout(() => {
            if (!loginWindow.isDestroyed()) {
              loginWindow.loadURL('http://10.190.0.184:8080/eam/report_management/eqp_report/eqp_utilization_rate');
            }
          }, 500);
        }
      });

      loginWindow.webContents.on('did-navigate-in-page', (event, url) => {
        if (!url.includes('/login') && !hasNavigatedToReport) {
          hasNavigatedToReport = true;
          setTimeout(() => {
            if (!loginWindow.isDestroyed()) {
              loginWindow.loadURL('http://10.190.0.184:8080/eam/report_management/eqp_report/eqp_utilization_rate');
            }
          }, 500);
        }
      });

      // Poll for the token from the main process as a fallback
      let attempts = 0;
      const maxAttempts = 60; // 30 seconds
      const pollInterval = setInterval(async () => {
        if (isResolved) {
          clearInterval(pollInterval);
          return;
        }
        
        attempts++;
        if (attempts >= maxAttempts) {
          clearInterval(pollInterval);
          if (loginWindow && !loginWindow.isDestroyed()) loginWindow.close();
          safeResolve({ error: true, message: 'Timeout waiting for login.' });
          return;
        }

        if (loginWindow && loginWindow.isDestroyed()) {
          clearInterval(pollInterval);
          return;
        }

        try {
          // Check localStorage safely
          const checkTokenScript = `
            (function() {
              let t = localStorage.getItem('auth._token.local') || sessionStorage.getItem('auth._token.local');
              if (!t) {
                const match = document.cookie.match(/(?:^|;\s*)auth\._token\.local=([^;]*)/);
                if (match) {
                   t = decodeURIComponent(match[1]);
                }
              }
              return t;
            })();
          `;
          const token = await loginWindow.webContents.executeJavaScript(checkTokenScript).catch(() => null);

          if (token && token.startsWith('Bearer')) {
            // We only resolve if we have successfully navigated to the report page OR if the token is valid right away
            if (hasNavigatedToReport || !loginWindow.webContents.getURL().includes('/login')) {
              clearInterval(pollInterval);
              safeResolve({ error: false, token: token });
              if (loginWindow && !loginWindow.isDestroyed()) loginWindow.close();
            }
          }
        } catch (e) {
          // Page might be navigating, ignore
        }
      }, 500);

    } catch (err) {
      resolve({ error: true, message: err.message });
    }
  });
});
