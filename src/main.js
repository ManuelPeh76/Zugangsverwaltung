
/*  Zugangsverwaltung

    File: main.js
    Author: Manuel Pelzer
    Copyright © 2025 By Manuel Pelzer
    MIT License
*/

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs/promises');


const options = {
  width: 1200,
  height: 1000,
  frame: false,
  webPreferences: {
    preload: path.join(__dirname, './preload.js'),
    contextIsolation: true,
    nodeIntegration: false
  }
};

app.whenReady().then(() => {

  const mainWindow = new BrowserWindow(options);
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  const is = () => mainWindow && !mainWindow.isDestroyed();

  const saveJs = async (event, {str, backup}) => {
    let text = "";
    const license = "/*\nZugangsverwaltung\n\n\tFile: data.js\n\tCopyright © 2025 By Manuel Pelzer\n\tMIT License\n*/\n\n";
    try {
      if (backup) {
        text = await fs.readFile(path.join(__dirname, "data.js"), "utf8");
        text = text.replace(license, "");
        let t = text./*replace(/(\/\*|\/\/|\*\/)/g, "").*/trim().split("\n").map(e => "// " + e.trim()).join("\n");
        text = `/* Backup vom ${new Date().toLocaleString("de-DE", { dateStyle: "short", timeStyle: "short" })} */\n` + t + "\n\n";
      }
      const content = `${license}${text || ""}function data() {\n\treturn [${str}];\n}`
      const isUnlinked = await fs.unlink(path.join(__dirname, "data.js")).then(() => true).catch(e => e);
      if (typeof isUnlinked === "boolean") return await fs.writeFile(path.join(__dirname, "data.js"), content, 'utf8').then(() => true).catch(e => e);
      return isUnlinked || false;
    } catch (e) {
      return e.toString();
    }
  };

  ipcMain.handle('save-new-js', saveJs);
  ipcMain.handle("minimize", () => is() && mainWindow.minimize());
  ipcMain.handle("maximize", () => is() && (mainWindow.isMaximized() ? (mainWindow.unmaximize(), false) : (mainWindow.maximize(), true)));
  ipcMain.handle("unmaximize", () => is() && mainWindow.unmaximize());
  ipcMain.handle("quit", app.quit);

});



