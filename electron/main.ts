import { app, BrowserWindow, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import path from 'path';

const isDev = process.env.NODE_ENV === 'development';

let mainWindow: BrowserWindow | null = null;

// ── Auto-updater ──────────────────────────────────────────────────────────────
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;
autoUpdater.on('update-available', () => mainWindow?.webContents.send('update-status', { status: 'downloading' }));
autoUpdater.on('update-downloaded', () => mainWindow?.webContents.send('update-status', { status: 'ready' }));
autoUpdater.on('error', (err) => console.error('[updater]', err.message));

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
      sandbox: false,       // needed for webview to work
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    // Use app.getAppPath() for reliable path resolution after signing
    const indexPath = path.join(app.getAppPath(), 'dist', 'index.html');
    mainWindow.loadFile(indexPath).catch(err => {
      console.error('Failed to load index.html:', err);
      // Fallback: try relative to __dirname
      mainWindow?.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
    });
    setTimeout(() => autoUpdater.checkForUpdates().catch(() => {}), 5000);
  }

  mainWindow.webContents.on('did-fail-load', (event, code, desc) => {
    console.error('Page failed to load:', code, desc);
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.on('install-update', () => autoUpdater.quitAndInstall());
ipcMain.handle('get-version', () => app.getVersion());
