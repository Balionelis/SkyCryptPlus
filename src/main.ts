import { app, BrowserWindow, Menu } from 'electron';
import * as path from 'path';
import { setupLogging } from './utils/logger';
import { readConfig, updateConfigVersion } from './config/configManager';
import { createFirstTimeWindow } from './windows/firstTimeSetup';
import { createMainWindow } from './windows/mainWindow';
import { showErrorWindow } from './windows/errorWindow';

let mainWindow: BrowserWindow | null = null;

async function main() {
  try {
    await updateConfigVersion();
    setupLogging();
    const config = readConfig();
    
    Menu.setApplicationMenu(null);
    
    if (config && config.playerName && config.defaultProfile) {
      const username = config.playerName;
      const profile = config.defaultProfile;
      const theme = config.selectedTheme || 'default.json';
      mainWindow = createMainWindow(username, profile, theme);
    } else {
      createFirstTimeWindow();
    }
  } catch (err: any) {
    const errorDetails = `Error: ${err.message}\n\nStack trace:\n${err.stack}`;
    console.error(errorDetails);
    showErrorWindow(errorDetails);
  }
}

app.whenReady().then(() => {
  try {
    app.on('browser-window-created', (_, window) => {
      window.setMenuBarVisibility(false);
    });
    
    main();
  } catch (err: any) {
    const errorDetails = `Unhandled Error: ${err.message}\n\nStack trace:\n${err.stack}`;
    console.error(errorDetails);
    showErrorWindow(errorDetails);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    main();
  }
});