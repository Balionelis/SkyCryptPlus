import webview
import logging
from config.config_manager import save_config
from gui.webview_manager import create_webview

# Global state variables for window interaction
should_launch_main_app = False
saved_username = None
saved_profile = None
saved_theme = None

def create_first_time_config_window():
    global should_launch_main_app, saved_username, saved_profile, saved_theme
    
    first_time_html = """
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
            <?xml version="1.0" encoding="UTF-8" standalone="no"?>
                <svg
                width="120"
                height="120"
                version="1.1"
                id="svg14"
                sodipodi:docname="logo_square.svg"
                inkscape:version="1.4 (86a8ad7, 2024-10-11)"
                inkscape:export-filename="logo_square.png"
                inkscape:export-xdpi="96"
                inkscape:export-ydpi="96"
                xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
                xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
                xmlns="http://www.w3.org/2000/svg"
                xmlns:svg="http://www.w3.org/2000/svg">
                <defs
                    id="defs18" />
                <sodipodi:namedview
                    id="namedview16"
                    pagecolor="#ffffff"
                    bordercolor="#666666"
                    borderopacity="1.0"
                    inkscape:pageshadow="2"
                    inkscape:pageopacity="0.0"
                    inkscape:pagecheckerboard="0"
                    inkscape:showpageshadow="2"
                    inkscape:deskcolor="#d1d1d1"
                    inkscape:zoom="6.725"
                    inkscape:cx="60.074349"
                    inkscape:cy="60"
                    inkscape:window-width="1920"
                    inkscape:window-height="1009"
                    inkscape:window-x="-8"
                    inkscape:window-y="828"
                    inkscape:window-maximized="1"
                    inkscape:current-layer="svg14" />
                <title
                    id="title2">SkyCrypt+ Logo</title>
                <rect
                    rx="16"
                    height="120"
                    width="120"
                    y="0"
                    x="0"
                    fill="#0bda51"
                    id="rect4"
                    style="fill:#0bda51;fill-opacity:1" />
                <g
                    fill="#ffffff"
                    id="g12"
                    style="fill:#ffffff;fill-opacity:1">
                    <rect
                    rx="4"
                    height="28"
                    width="19"
                    y="69"
                    x="22"
                    id="rect6"
                    style="fill:#ffffff;fill-opacity:1" />
                    <rect
                    rx="4"
                    height="75"
                    width="19"
                    y="22"
                    x="50"
                    id="rect8"
                    style="fill:#ffffff;fill-opacity:1" />
                    <rect
                    rx="4"
                    height="47"
                    width="19"
                    y="50"
                    x="79"
                    id="rect10"
                    style="fill:#ffffff;fill-opacity:1" />
                </g>
                <g
                    id="g1"
                    inkscape:label="+"
                    transform="matrix(0.56339476,0,0,0.56339476,34.936557,18.607696)"
                    style="fill:#ffffff;fill-opacity:1">
                    <rect
                    rx="4"
                    height="47"
                    width="19"
                    y="71.163567"
                    x="20.163567"
                    id="rect10-0"
                    style="fill:#ffffff;fill-opacity:1"
                    transform="matrix(0,1,1,0,0,0)" />
                    <rect
                    rx="4"
                    height="47"
                    width="19"
                    y="5.836431"
                    x="85.066917"
                    id="rect10-9"
                    style="fill:#ffffff;fill-opacity:1" />
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
            <button onclick="saveConfig()">Save Configuration</button>
            
            <script>
                function saveConfig() {
                    const username = document.getElementById('username').value;
                    const profile = document.getElementById('profile').value;
                    const theme = document.getElementById('theme').value;
                    
                    if (username && profile) {
                        window.pywebview.api.save_configuration(username, profile, theme);
                    } else {
                        alert('Please enter both username and profile name');
                    }
                }
            </script>
        </div>
    </body>
    </html>
    """
    
    class ConfigAPI:
        def save_configuration(self, username, profile, theme="default.json"):
            save_success = save_config(username, profile, theme)
            if save_success:
                global should_launch_main_app, saved_username, saved_profile, saved_theme
                should_launch_main_app = True
                saved_username = username
                saved_profile = profile
                saved_theme = theme
                window_instance.destroy()
    
    window_instance = webview.create_window(
        'SkyCrypt+ Setup', 
        html=first_time_html,
        width=400, 
        height=400,
        resizable=False
    )
    
    api = ConfigAPI()
    window_instance.expose(api.save_configuration)
    
    webview.start(debug=False)
    
    # Launch main app after setup if configuration was saved successfully
    if should_launch_main_app:
        create_webview(saved_username, saved_profile, saved_theme)