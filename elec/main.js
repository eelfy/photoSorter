const path = require("path");
const { app, BrowserWindow } = require("electron");

const IS_DEV = process.env.IS_DEV === 'true'

try {
  require('electron-reloader')(module)
} catch (_) { }

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    autoHideMenuBar: true,  
    nodeIntegration: true,
    webPreferences: {
      preload: path.join(app.getAppPath(), "preload.js"),
      sandbox: false,
    },
  });

  // mainWindow.webContents.openDevTools()
  mainWindow.loadFile("index.html");
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
