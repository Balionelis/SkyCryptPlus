import { BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { saveConfig } from '../config/configManager';
import { createMainWindow } from './mainWindow';
import { getLogger } from '../utils/logger';

export function createFirstTimeWindow(): BrowserWindow {
  const setupWindow = new BrowserWindow({
    width: 400,
    height: 400,
    resizable: false,
    icon: path.join(__dirname, '../assets/images/logo_square.svg'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/firstTimePreload.js')
    }
  });
  
  setupWindow.setMenuBarVisibility(false);
  setupWindow.autoHideMenuBar = true;
  
  const setupHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>SkyCrypt+ First Time Setup</title>
        <style>
            html, body {
              margin: 0;
              height: 100%;
              overflow: hidden
            }
            
            body {
                font-family: Arial, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                background-color: #f0f0f0;
            }
            .container {
                background-color: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                text-align: center;
            }
            input, select {
                width: 100%;
                padding: 10px;
                margin: 10px 0;
                border: 1px solid #282828;
                border-radius: 5px;
                alight-items: center;
            }
            button {
                background-color: #282828;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                alight-items: center;
                transition: background-color 0.3s;
            }
            button:hover {
                background-color: #454545;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <svg width="120" height="120" viewBox="0 0 120 120">
                <rect rx="16" height="120" width="120" y="0" x="0" fill="#0bda51"/>
                <g fill="#ffffff">
                    <rect rx="4" height="28" width="19" y="69" x="22"/>
                    <rect rx="4" height="75" width="19" y="22" x="50"/>
                    <rect rx="4" height="47" width="19" y="50" x="79"/>
                </g>
                <g transform="matrix(0.56339476,0,0,0.56339476,34.936557,18.607696)" fill="#ffffff">
                    <rect rx="4" height="47" width="19" y="71.163567" x="20.163567" transform="matrix(0,1,1,0,0,0)"/>
                    <rect rx="4" height="47" width="19" y="5.836431" x="85.066917"/>
                </g>
            </svg>

            <input type="text" id="username" placeholder="Minecraft Username">
            <input type="text" id="profile" placeholder="Hypixel Skyblock Profile Name">
            <select id="theme">
                <option value="default.json" selected>Default Theme</option>
                <option value="draconic.json">Draconic Purple Theme</option>
                <option value="light.json">Default Light Theme</option>
                <option value="skylea.json">sky.lea.moe</option>
                <option value="nightblue.json">Night Blue Theme</option>
                <option value="sunrise.json">Sunrise Orange Theme</option>
                <option value="burning-cinnabar.json">Burning Cinnabar Theme</option>
                <option value="candycane.json">Candy Cane Theme</option>
                <option value="april-fools-2024.json">April Fools 2024 Theme</option>
            </select>
            <button id="saveButton">Save Configuration</button>
        </div>
        <script>
            document.getElementById('saveButton').addEventListener('click', () => {
                const username = document.getElementById('username').value;
                const profile = document.getElementById('profile').value;
                const theme = document.getElementById('theme').value;
                
                if (username && profile) {
                    window.api.saveConfig(username, profile, theme);
                } else {
                    alert('Please enter both username and profile name');
                }
            });
        </script>
    </body>
    </html>
  `;
  
  setupWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(setupHtml)}`);
  
  ipcMain.handle('save-config', (_, username: string, profile: string, theme: string) => {
    const saveSuccess = saveConfig(username, profile, theme);
    
    if (saveSuccess) {
      getLogger().info(`First time setup completed for ${username}`);
      
      setupWindow.close();
      
      createMainWindow(username, profile, theme);
    }
    
    return saveSuccess;
  });
  
  return setupWindow;
}