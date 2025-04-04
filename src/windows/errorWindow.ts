import { BrowserWindow } from 'electron';
import * as path from 'path';

export function showErrorWindow(errorMessage: string): BrowserWindow {
  const errorWindow = new BrowserWindow({
    width: 600,
    height: 500,
    resizable: false,
    icon: path.join(__dirname, '../assets/images/logo_square.svg'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  
  errorWindow.setMenuBarVisibility(false);
  errorWindow.autoHideMenuBar = true;
  
  const sanitizedErrorMessage = errorMessage
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
  
  const errorHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>SkyCrypt+ Error</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                background-color: #f8d7da;
                color: #721c24;
                text-align: center;
                padding: 20px;
            }
            .error-container {
                background-color: white;
                border: 2px solid #f5c6cb;
                border-radius: 10px;
                padding: 30px;
                max-width: 600px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            pre {
                text-align: left;
                background-color: #f1f1f1;
                padding: 15px;
                border-radius: 5px;
                max-height: 300px;
                overflow-y: auto;
                white-space: pre-wrap;
                word-wrap: break-word;
            }
        </style>
    </head>
    <body>
        <div class="error-container">
            <h2>⚠️ SkyCrypt+ Startup Error</h2>
            <p>An unexpected error occurred while launching the application:</p>
            <pre>${sanitizedErrorMessage}</pre>
            <p>Please check the console or contact support if this persists.</p>
        </div>
    </body>
    </html>
  `;
  
  errorWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(errorHtml)}`);
  
  return errorWindow;
}