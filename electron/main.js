const { app, BrowserWindow } = require("electron");
const path = require("path");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (app.isPackaged) {
    // 👉 Load remote URL when packaged
    mainWindow.loadURL("https://open-way-pos.vercel.app/pos/login");
  } else {
    // 👉 In dev, load local Next.js server
    mainWindow.loadURL("http://localhost:3000");
  }

  // Uncomment if you want devtools
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
