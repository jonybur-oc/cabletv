import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import path from 'path';

const isDev = process.env.NODE_ENV === 'development';

let mainWindow: BrowserWindow | null = null;

// ── Auto-updater config ───────────────────────────────────────────────────────
autoUpdater.autoDownload = true;          // download in background
autoUpdater.autoInstallOnAppQuit = true;  // install when user quits

autoUpdater.on('update-available', () => {
  mainWindow?.webContents.send('update-status', { status: 'downloading' });
});

autoUpdater.on('update-downloaded', () => {
  mainWindow?.webContents.send('update-status', { status: 'ready' });
});

autoUpdater.on('error', (err) => {
  console.error('[updater] error:', err.message);
});

// ── Window ────────────────────────────────────────────────────────────────────

function createWindow() {
  mainWindow = new BrowserWindow({
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
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    // Check for updates 3 seconds after launch
    setTimeout(() => autoUpdater.checkForUpdates(), 3000);
  }

  mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// ── IPC ───────────────────────────────────────────────────────────────────────

ipcMain.on('install-update', () => {
  autoUpdater.quitAndInstall();
});

ipcMain.handle('get-version', () => app.getVersion());
