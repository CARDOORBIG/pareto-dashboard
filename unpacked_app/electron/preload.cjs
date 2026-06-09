const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  fetchDowntimeData: (url, token, params) => ipcRenderer.invoke('fetch-downtime-data', url, token, params),
  performAutoLogin: (username, password) => ipcRenderer.invoke('perform-auto-login', username, password)
});
