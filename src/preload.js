/*  Zugangsverwaltung

    File: preload.js
    Author: Manuel Pelzer
    Copyright © 2025 By Manuel Pelzer
    MIT License
*/

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  onLog: cb => ipcRenderer.on('log', (_, msg) => cb(msg)),
  saveNewJs: args => ipcRenderer.invoke('save-new-js', args),
  minimize: () => ipcRenderer.invoke("minimize"),
  maximize: () => ipcRenderer.invoke("maximize"),
  unmaximize: () => ipcRenderer.invoke("unmaximize"),
  quit: () => ipcRenderer.invoke("quit")

});
