const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let browserWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 850,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
}

app.whenReady().then(() => {
  createWindow();
});

ipcMain.on('open-browser-window', (event, url) => {
  if (!url) return;

  if (browserWindow && !browserWindow.isDestroyed()) {
    browserWindow.loadURL(url);
    browserWindow.focus();
    return;
  }

  browserWindow = new BrowserWindow({
    width: 1280,
    height: 900
  });

  browserWindow.loadURL(url);

  browserWindow.on('closed', () => {
    browserWindow = null;
  });
});

ipcMain.on('close-browser-window', () => {
  if (browserWindow && !browserWindow.isDestroyed()) {
    browserWindow.close();
    browserWindow = null;
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});