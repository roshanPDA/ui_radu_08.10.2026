const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const fs = require("fs");

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadFile("index.html");
}

ipcMain.handle("save-image", async (event, imageData) => {
  const { filePath } = await dialog.showSaveDialog({
    filters: [{ name: "Images", extensions: ["png"] }],
  });

  if (!filePath) return;

  const base64Data = imageData.slice("data:image/png;base64,".length);
  fs.writeFileSync(filePath, base64Data, "base64");
});

ipcMain.handle("load-image", async () => {
  const { filePaths } = await dialog.showOpenDialog({
    filters: [{ name: "Images", extensions: ["png", "jpg", "jpeg"] }],
    properties: ["openFile"],
  });

  if (!filePaths || !filePaths[0]) return null;

  const buffer = fs.readFileSync(filePaths[0]);
  return "data:image/png;base64," + buffer.toString("base64");
});

app.whenReady().then(createWindow);
