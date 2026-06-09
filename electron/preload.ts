import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  getVersion: () => ipcRenderer.invoke('get-version'),
  installUpdate: () => ipcRenderer.send('install-update'),
  onUpdateStatus: (cb: (status: { status: string }) => void) => {
    ipcRenderer.on('update-status', (_event, data) => cb(data));
  },
});
