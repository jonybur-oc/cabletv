import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';

const isDev = process.env.NODE_ENV === 'development';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#0a0a0a',
    titleBarStyle: 'hiddenInset', // clean look on macOS
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true,         // enable <webview> for embedding Netflix/HBO
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// Handle webview navigation requests from renderer
ipcMain.on('navigate-webview', (_event, url: string) => {
  // Future: control webview from main process if needed
  console.log('[main] navigate-webview', url);
});
