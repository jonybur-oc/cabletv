import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  navigateWebview: (url: string) => ipcRenderer.send('navigate-webview', url),
  isElectron: true,
});
