"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const electron_updater_1 = require("electron-updater");
const path_1 = __importDefault(require("path"));
const isDev = process.env.NODE_ENV === 'development';
let mainWindow = null;
// ── Auto-updater config ───────────────────────────────────────────────────────
electron_updater_1.autoUpdater.autoDownload = true; // download in background
electron_updater_1.autoUpdater.autoInstallOnAppQuit = true; // install when user quits
electron_updater_1.autoUpdater.on('update-available', () => {
    mainWindow?.webContents.send('update-status', { status: 'downloading' });
});
electron_updater_1.autoUpdater.on('update-downloaded', () => {
    mainWindow?.webContents.send('update-status', { status: 'ready' });
});
electron_updater_1.autoUpdater.on('error', (err) => {
    console.error('[updater] error:', err.message);
});
// ── Window ────────────────────────────────────────────────────────────────────
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 900,
        minHeight: 600,
        backgroundColor: '#0a0a0a',
        titleBarStyle: 'hiddenInset',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            webviewTag: true,
            preload: path_1.default.join(__dirname, 'preload.js'),
        },
    });
    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
    }
    else {
        mainWindow.loadFile(path_1.default.join(__dirname, '../dist/index.html'));
        // Check for updates 3 seconds after launch
        setTimeout(() => electron_updater_1.autoUpdater.checkForUpdates(), 3000);
    }
    mainWindow.on('closed', () => { mainWindow = null; });
}
electron_1.app.whenReady().then(createWindow);
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
        electron_1.app.quit();
});
electron_1.app.on('activate', () => {
    if (electron_1.BrowserWindow.getAllWindows().length === 0)
        createWindow();
});
// ── IPC ───────────────────────────────────────────────────────────────────────
electron_1.ipcMain.on('install-update', () => {
    electron_updater_1.autoUpdater.quitAndInstall();
});
electron_1.ipcMain.handle('get-version', () => electron_1.app.getVersion());
