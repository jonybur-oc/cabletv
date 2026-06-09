"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    isElectron: true,
    getVersion: () => electron_1.ipcRenderer.invoke('get-version'),
    installUpdate: () => electron_1.ipcRenderer.send('install-update'),
    onUpdateStatus: (cb) => {
        electron_1.ipcRenderer.on('update-status', (_event, data) => cb(data));
    },
});
