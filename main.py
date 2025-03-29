import os
import sys
import json
import webview
import datetime
import traceback
import logging
import threading
from logging.handlers import RotatingFileHandler

should_launch_main_app = False
saved_username = None
saved_profile = None
saved_theme = None
current_version = "1.0.2"

def resource_path(relative_path):
    # Determines the correct path for bundled resources
    # Handles both source and compiled executable scenarios
    try:
        base_path = sys._MEIPASS
    except Exception:
        base_path = os.path.abspath(".")

    return os.path.join(base_path, relative_path)

def setup_logging():
    # Set up logging to file
    try:
        appdata_path = os.path.join(os.environ['APPDATA'], 'SkyCrypt+')
        
        # Check if the folder exists
        os.makedirs(appdata_path, exist_ok=True)
        
        log_file_path = os.path.join(appdata_path, 'skycrypt_plus.log')
        
        # Configure file handler (10 MB max, 1 backup files)
        file_handler = RotatingFileHandler(
            log_file_path, 
            maxBytes=10*1024*1024,  # 10 MB
            backupCount=1,
            encoding='utf-8'
        )
        
        # Configure the formatter
        formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
        file_handler.setFormatter(formatter)
        
        # Configure the root logger
        root_logger = logging.getLogger()
        root_logger.setLevel(logging.INFO)
        root_logger.addHandler(file_handler)
        
        # Log startup message
        logging.info("===== SkyCrypt+ Started =====")
        logging.info(f"Log file initialized at: {log_file_path}")
        
    except Exception as e:
        logging.error(f"Error setting up logging: {e}")

def read_config():
    # Reads the configuration file from the user's APPDATA folder
    # Returns the config if found, otherwise returns None
    try:
        appdata_path = os.path.join(os.environ['APPDATA'], 'SkyCrypt+')
        config_file_path = os.path.join(appdata_path, 'config.json')
        
        if os.path.exists(config_file_path):
            with open(config_file_path, 'r') as config_file:
                return json.load(config_file)
        return None
    except Exception as e:
        logging.error(f"Error reading config file: {e}")
        return None

def update_config_version():
    """
    Updates the version in the config file to match the current application version
    """
    try:
        # Get the current config
        config = read_config()
        if not config:
            logging.info("No existing config found to update version")
            return False
        
        # Update the version in the config if different
        if config.get("version") != current_version:
            config["version"] = current_version
            
            # Save the updated config
            appdata_path = os.path.join(os.environ['APPDATA'], 'SkyCrypt+')
            config_file_path = os.path.join(appdata_path, 'config.json')
            
            with open(config_file_path, 'w') as config_file:
                json.dump(config, config_file, indent=4)
            
            logging.info(f"Updated config version to {current_version}")
        
        return True
    except Exception as e:
        logging.error(f"Error updating config version: {e}")
        return False

def check_for_updates_async(window):
    """
    Performs an asynchronous check for updates and sends the result to the window
    """
    def check_updates_worker():
        try:
            update_info = check_for_updates()
            if update_info and update_info["update_available"]:
                # Send update info to the window
                window.evaluate_js(f"""
                    window.updateInfo = {{
                        currentVersion: "{update_info['current_version']}",
                        latestVersion: "{update_info['latest_version']}",
                        releaseUrl: "{update_info['release_url']}"
                    }};
                    
                    // Dispatch a custom event that our injected script will listen for
                    const updateEvent = new CustomEvent('skycryptPlusUpdateAvailable', {{ 
                        detail: window.updateInfo 
                    }});
                    document.dispatchEvent(updateEvent);
                """)
                logging.info(f"Update available: {update_info['current_version']} → {update_info['latest_version']}")
            else:
                logging.info("No updates available or couldn't check for updates")
        except Exception as e:
            logging.error(f"Error in update checker thread: {e}")
    
    # Start the check in a separate thread to avoid blocking the UI
    update_thread = threading.Thread(target=check_updates_worker)
    update_thread.daemon = True
    update_thread.start()

def save_config(username, profile, theme="default.json"):
    # Saves the user's Minecraft username, profile name, and theme to a configuration file
    try:
        appdata_path = os.path.join(os.environ['APPDATA'], 'SkyCrypt+')
        config_file_path = os.path.join(appdata_path, 'config.json')
        
        # Ensure the folder exists
        os.makedirs(appdata_path, exist_ok=True)
        
        # Prepare configuration data
        config = {
            "version": current_version,
            "created_at": str(datetime.datetime.now()),
            "player_name": username,
            "default_profile": profile,
            "selected_theme": theme
        }
        
        # Write configuration to file
        with open(config_file_path, 'w') as config_file:
            json.dump(config, config_file, indent=4)
        
        logging.info(f"Configuration saved for {username} with profile {profile} and theme {theme}")
        return True
    except Exception as e:
        logging.error(f"Error saving config file: {e}")
        return False

def show_error_window(error_message):
    """
    Creates a webview window to display any critical errors
    """
    error_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>SkyCrypt+ Error</title>
        <style>
            body {{
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
            }}
            .error-container {{
                background-color: white;
                border: 2px solid #f5c6cb;
                border-radius: 10px;
                padding: 30px;
                max-width: 600px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }}
            pre {{
                text-align: left;
                background-color: #f1f1f1;
                padding: 15px;
                border-radius: 5px;
                max-height: 300px;
                overflow-y: auto;
                white-space: pre-wrap;
                word-wrap: break-word;
            }}
        </style>
    </head>
    <body>
        <div class="error-container">
            <h2>⚠️ SkyCrypt+ Startup Error</h2>
            <p>An unexpected error occurred while launching the application:</p>
            <pre>{error_message}</pre>
            <p>Please check the console or contact support if this persists.</p>
        </div>
    </body>
    </html>
    """
    
    # Create an error display window
    error_window = webview.create_window(
        'SkyCrypt+ Error', 
        html=error_html,
        width=600, 
        height=500,
        resizable=False
    )
    
    webview.start(debug=False)

def create_first_time_config_window():
    # Creates an initial setup window for new users
    # Allows input of Minecraft username and profile    
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
            # Handles saving configuration and closing the setup window
            save_success = save_config(username, profile, theme)
            if save_success:
                # Set flag to start main app after this window closes
                global should_launch_main_app
                should_launch_main_app = True
                global saved_username, saved_profile, saved_theme
                saved_username = username
                saved_profile = profile
                saved_theme = theme
                # Close setup window
                window_instance.destroy()
    
    # Create setup window
    window_instance = webview.create_window(
        'SkyCrypt+ Setup', 
        html=first_time_html,
        width=400, 
        height=400,
        resizable=False
    )
    
    api = ConfigAPI()
    window_instance.expose(api.save_configuration)
    
    # Start the window and after it closes, check if we should launch the main app
    webview.start(debug=False)
    
    # After window is closed, check if main app should be launched
    if 'should_launch_main_app' in globals() and should_launch_main_app:
        create_webview(saved_username, saved_profile, saved_theme)

def check_for_updates():
    """
    Checks the SkyCrypt+ GitHub repository for the latest release version
    and compares it to the current version in the config file.
    Returns the latest version and a boolean indicating if an update is available.
    """
    import requests
    import logging
    import json
    import os
    from packaging import version

    try:
        # Get the latest release from GitHub API
        response = requests.get(
            "https://api.github.com/repos/Balionelis/SkyCryptPlus/releases/latest",
            headers={"Accept": "application/vnd.github.v3+json"},
            timeout=5
        )
        
        if response.status_code == 200:
            release_data = response.json()
            latest_version = release_data.get("tag_name", "").lstrip("v")
            release_url = release_data.get("html_url", "https://github.com/Balionelis/SkyCryptPlus/releases")
            
            # Read current version from config
            try:
                appdata_path = os.path.join(os.environ['APPDATA'], 'SkyCrypt+')
                config_file_path = os.path.join(appdata_path, 'config.json')
                
                if os.path.exists(config_file_path):
                    with open(config_file_path, 'r') as config_file:
                        config = json.load(config_file)
                        current_version = config.get("version", "0.0.0")
                        
                        # Compare versions
                        update_available = version.parse(latest_version) > version.parse(current_version)
                        logging.info(f"Version check: Current={current_version}, Latest={latest_version}, Update Available={update_available}")
                        
                        return {
                            "current_version": current_version,
                            "latest_version": latest_version,
                            "update_available": update_available,
                            "release_url": release_url
                        }
                
                logging.warning("Config file not found or no version specified")
                return None
                
            except Exception as e:
                logging.error(f"Error reading config during update check: {e}")
                return None
        else:
            logging.error(f"GitHub API returned status code {response.status_code}")
            return None
            
    except Exception as e:
        logging.error(f"Error checking for updates: {e}")
        return None

def create_webview(username, profile, theme=None):
    # If no theme is provided, try to read from config
    if not theme:
        config = read_config()
        theme = config.get('selected_theme', 'default.json') if config else 'default.json'
    
    url = f"https://sky.shiiyu.moe/stats/{username}/{profile}"
    
    try:
        # Initialize main application window
        window = webview.create_window(
            'SkyCrypt+', 
            url, 
            width=1200, 
            height=800,
            fullscreen=False,
            background_color='#ffffff',
            text_select=True
        )

        # All JavaScript for website customization in one big script
        js_code = f"""
        (function() {{
            console.log('SkyCrypt+ JavaScript starting');
            
            // Function to remove unneeded header elements
            function removeHeaderElements() {{
                console.log('Removing header elements');
                try {{
                    document.getElementById('additional_player_stats')?.remove();
                    document.getElementById('info-button')?.remove();
                    document.getElementById('api_button')?.remove();
                    document.querySelector('a.blm-logo')?.remove();
                    document.getElementById('info-box')?.remove();
                }} catch (error) {{
                    console.error('Error removing header elements:', error);
                }}
            }}

            // Function to add networth element at the top
            function addNetworth() {{
                console.log('Adding networth element');
                try {{
                    const networth = document.querySelector('#additional_stats_container .additional-stat span[data-tippy-content*="Total Networth"] .stat-value');
                    const profileStats = document.getElementById('stats_for_profile');
                    
                    if (profileStats && networth) {{
                        const value = networth.textContent.trim();
                        
                        const networthEl = document.createElement('span');
                        networthEl.id = 'player_networth';
                        networthEl.className = 'player-networth';
                        networthEl.style.cssText = 'position: relative; display: inline-block; font-weight: 600; cursor: context-menu; background-color: rgba(127, 127, 127, .2); border-radius: 100px; padding: 0 15px; height: 54px; line-height: 54px; vertical-align: middle; font-size: 30px; margin-left: 10px;';
                        
                        const labelSpan = document.createElement('span');
                        labelSpan.textContent = 'Networth: ';
                        
                        const valueSpan = document.createElement('span');
                        valueSpan.textContent = value;
                        valueSpan.style.color = '#55FF55';
                        
                        networthEl.appendChild(labelSpan);
                        networthEl.appendChild(valueSpan);
                        
                        profileStats.insertAdjacentElement('afterend', networthEl);
                        console.log('Networth added');
                    }} else {{
                        console.warn('Could not find networth or stats_for_profile');
                    }}
                }} catch (error) {{
                    console.error('Error adding Networth:', error);
                }}
            }}

            // Remove donation banners
            function removeBanners() {{
                try {{
                    document.querySelectorAll('figure.banner').forEach(banner => banner.remove());
                    console.log('Banners removed');
                }} catch (error) {{
                    console.error('Error removing banners:', error);
                }}
            }}

            // Hide and watch the themes button
            function handleThemes() {{
                const themesBtn = document.getElementById('themes-button');
                const themesList = document.getElementById('themes-box');
                
                if (themesBtn && themesList) {{
                    themesBtn.style.display = 'none';
                    themesList.style.display = 'none';
                    themesList.style.visibility = 'hidden';
                    
                    // Watch for theme changes
                    new MutationObserver((mutations) => {{
                        mutations.forEach((mutation) => {{
                            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {{
                                document.querySelectorAll('input[name="theme"]').forEach(radio => {{
                                    radio.addEventListener('change', () => {{
                                        if (!localStorage.getItem('themesButtonVisible')) {{
                                            localStorage.setItem('themesButtonVisible', 'true');
                                            const theme = radio.value.split('/').pop();
                                            window.pywebview.api.save_theme(theme);
                                        }}
                                    }});
                                }});
                            }}
                        }});
                    }}).observe(themesBtn, {{ attributes: true }});
                }}
            }}
            
            // Add all the custom buttons
            function addCustomButtons() {{
                console.log('Adding custom buttons');
                
                // Get username and profile from URL
                const pathParts = window.location.pathname.split('/');
                const username = pathParts[2] || '';
                const profile = pathParts[3] || '';
                const isMainPage = window.location.href === 'https://sky.shiiyu.moe/';
                
                // Create button container
                const buttonContainer = document.createElement('div');
                buttonContainer.id = 'custom-buttons-container';
                buttonContainer.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 9999; display: flex; gap: 10px; align-items: center;';

                // Create refresh button
                const refreshBtn = document.createElement('button');
                refreshBtn.id = 'custom-reload-button';
                refreshBtn.textContent = 'Refresh Page';
                refreshBtn.style.cssText = 'padding: 10px; background-color: #282828; color: white; border: none; border-radius: 5px; cursor: pointer; outline: none;';
                refreshBtn.onclick = () => window.location.reload();

                // Create websites button
                const sitesBtn = document.createElement('button');
                sitesBtn.id = 'custom-websites-button';
                sitesBtn.textContent = 'Other Websites';
                sitesBtn.style.cssText = `padding: 10px; background-color: #282828; color: white; border: none; border-radius: 5px; cursor: pointer; outline: none; display: ${{isMainPage ? 'none' : 'block'}};`;

                // Create websites dropdown
                const sitesDropdown = document.createElement('div');
                sitesDropdown.id = 'websites-dropdown';
                sitesDropdown.style.cssText = 'position: fixed; bottom: 80px; right: 140px; z-index: 10000; background-color: #282828; border: 1px solid #FFFFFF; border-radius: 5px; display: none; flex-direction: column; min-width: 250px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);';

                // Create themes button
                const themeBtn = document.createElement('button');
                themeBtn.id = 'custom-theme-button';
                themeBtn.textContent = 'Themes';
                themeBtn.style.cssText = 'width: 75px; height: 35px; background-color: #282828; color: white; border: none; border-radius: 5px; cursor: pointer; display: flex; justify-content: center; align-items: center;';

                // Create themes dropdown
                const themesDropdown = document.createElement('div');
                themesDropdown.id = 'themes-dropdown';
                themesDropdown.style.cssText = 'position: fixed; bottom: 80px; right: 100px; z-index: 10000; background-color: #282828; border: 1px solid #FFFFFF; border-radius: 5px; display: none; flex-direction: column; min-width: 250px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);';

                // Create Patreon button
                const patreonBtn = document.createElement('button');
                patreonBtn.id = 'custom-patreon-button';
                patreonBtn.style.cssText = 'width: 35px; height: 35px; background-color: #FF424D; border: none; border-radius: 5px; cursor: pointer; padding: 4px; outline: none; display: flex; justify-content: center; align-items: center;';
                patreonBtn.onclick = () => window.open('https://www.patreon.com/shiiyu', '_blank');

                // Create Patreon SVG
                const patreonSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                patreonSvg.setAttribute('version', '1.2');
                patreonSvg.setAttribute('baseProfile', 'tiny');
                patreonSvg.setAttribute('viewBox', '0 0 1014.8 1014.8');
                patreonSvg.setAttribute('overflow', 'visible');
                patreonSvg.style.width = '100%';
                patreonSvg.style.height = '100%';
                patreonSvg.innerHTML = '<path fill="#FF424D" d="M507.4,1014.8L507.4,1014.8C227.2,1014.8,0,787.7,0,507.4v0C0,227.2,227.2,0,507.4,0h0c280.2,0,507.4,227.2,507.4,507.4v0C1014.8,787.7,787.7,1014.8,507.4,1014.8z"/><g><circle fill="#FFFFFF" cx="586.4" cy="439.1" r="204.6"/><rect x="223.8" y="234.5" fill="#241E12" width="100" height="545.8"/></g>';
                patreonBtn.appendChild(patreonSvg);

                // Define websites
                const websites = [
                    {{ name: "Plancke", url: `https://plancke.io/hypixel/player/stats/${{username}}` }},
                    {{ name: "EliteBot", url: `https://elitebot.dev/@${{username}}/${{profile}}` }},
                    {{ name: "Coflnet", url: `https://sky.coflnet.com/player/${{username}}` }}
                ];

                // Define themes
                const themes = [
                    {{ name: "Default Theme", file: "default.json" }},
                    {{ name: "Draconic Purple Theme", file: "draconic.json" }},
                    {{ name: "Default Light Theme", file: "light.json" }},
                    {{ name: "sky.lea.moe", file: "skylea.json" }},
                    {{ name: "Night Blue Theme", file: "nightblue.json" }},
                    {{ name: "Sunrise Orange Theme", file: "sunrise.json" }},
                    {{ name: "Burning Cinnabar Theme", file: "burning-cinnabar.json" }},
                    {{ name: "Candy Cane Theme", file: "candycane.json" }},
                    {{ name: "April Fools 2024 Theme", file: "april-fools-2024.json" }}
                ];

                // Add website links
                websites.forEach(site => {{
                    const link = document.createElement('a');
                    link.textContent = site.name;
                    link.href = site.url;
                    link.target = '_blank';
                    link.style.cssText = 'padding: 10px; color: #FFFFFF; text-decoration: none; border-bottom: 1px solid #e0e0e0; transition: background-color 0.2s;';
                    link.onmouseover = () => link.style.backgroundColor = 'rgba(186, 95, 222, 0.1)';
                    link.onmouseout = () => link.style.backgroundColor = 'transparent';
                    sitesDropdown.appendChild(link);
                }});

                // Add theme options
                const currentTheme = localStorage.getItem('currentTheme') || 'default.json';
                themes.forEach(theme => {{
                    const option = document.createElement('div');
                    option.textContent = theme.name;
                    option.style.cssText = `padding: 10px; color: ${{theme.file === currentTheme ? 'white' : '#FFFFFF'}}; background-color: ${{theme.file === currentTheme ? '#282828' : 'transparent'}}; text-decoration: none; border-bottom: 1px solid #e0e0e0; transition: background-color 0.2s; cursor: pointer;`;
                    
                    option.onclick = () => {{
                        const themesButton = document.getElementById('themes-button');
                        if (themesButton) {{
                            themesButton.click();
                            
                            setTimeout(() => {{
                                const radio = document.querySelector(`input[value="/resources/themes/${{theme.file}}"]`);
                                
                                if (radio) {{
                                    radio.click();
                                    localStorage.setItem('currentTheme', theme.file);
                                    window.pywebview.api.save_theme(theme.file);

                                    // Update selected theme appearance
                                    document.querySelectorAll('#themes-dropdown > div').forEach(opt => {{
                                        opt.style.color = opt.textContent === option.textContent ? 'white' : '#FFFFFF';
                                        opt.style.backgroundColor = opt.textContent === option.textContent ? '#FF424D' : 'transparent';
                                    }});

                                    if (themesButton.getAttribute('aria-expanded') === 'true') {{
                                        themesButton.click();
                                    }}
                                    
                                    themesDropdown.style.display = 'none';
                                }}
                            }}, 300);
                        }}
                    }};
                    
                    themesDropdown.appendChild(option);
                }});

                // Toggle websites dropdown
                sitesBtn.onclick = () => {{
                    sitesDropdown.style.display = sitesDropdown.style.display === 'none' || sitesDropdown.style.display === '' ? 'flex' : 'none';
                }};

                // Toggle themes dropdown
                themeBtn.onclick = () => {{
                    themesDropdown.style.display = themesDropdown.style.display === 'none' || themesDropdown.style.display === '' ? 'flex' : 'none';
                }};

                // Close dropdowns when clicking outside
                document.addEventListener('click', (e) => {{
                    if (!sitesBtn.contains(e.target) && !sitesDropdown.contains(e.target)) {{
                        sitesDropdown.style.display = 'none';
                    }}
                    if (!themeBtn.contains(e.target) && !themesDropdown.contains(e.target)) {{
                        themesDropdown.style.display = 'none';
                    }}
                }});

                // Add all buttons to container
                buttonContainer.appendChild(refreshBtn);
                buttonContainer.appendChild(sitesBtn);
                buttonContainer.appendChild(themeBtn);
                buttonContainer.appendChild(patreonBtn);

                // Add everything to the page
                document.body.appendChild(buttonContainer);
                document.body.appendChild(sitesDropdown);
                document.body.appendChild(themesDropdown);
            }}

            // Apply theme from config
            function applyTheme() {{
                const hasSetTheme = localStorage.getItem('initialThemeSet');
                
                if (!hasSetTheme) {{
                    const themeToUse = '{theme}';
                    
                    const themesBtn = document.getElementById('themes-button'); 
                    if (themesBtn) {{ 
                        themesBtn.click(); 
                        
                        setTimeout(() => {{ 
                            const radio = document.querySelector(`input[value="/resources/themes/${{themeToUse}}"]`); 
                            if (radio) {{ 
                                radio.click(); 
                                
                                setTimeout(() => {{
                                    if (themesBtn.getAttribute('aria-expanded') === 'true') {{ 
                                        themesBtn.click(); 
                                    }} 
                                    
                                    localStorage.setItem('currentTheme', themeToUse);
                                    localStorage.setItem('initialThemeSet', 'true');
                                }}, 300);
                            }}
                        }}, 500); 
                    }}
                }}
            }}

            // Change site name
            function changeSiteName() {{
                try {{
                    const nameEl = document.querySelector('#site_name');
                    if (nameEl) {{
                        nameEl.textContent = 'SkyCrypt+';
                    }}
                }} catch (error) {{
                    console.error('Error changing site name:', error);
                }}
            }}
            
            // Update button function
            function addUpdateButton(updateInfo) {{
                try {{
                    const buttonContainer = document.getElementById('custom-buttons-container');
                    
                    if (!buttonContainer || document.getElementById('update-available-button')) {{
                        return;
                    }}
                    
                    const updateBtn = document.createElement('button');
                    updateBtn.id = 'update-available-button';
                    updateBtn.textContent = `Update Available: v${{updateInfo.latestVersion}}`;
                    updateBtn.style.cssText = 'padding: 10px; background-color: #FF424D; color: white; border: none; border-radius: 5px; cursor: pointer; outline: none;';
                    
                    updateBtn.onmouseout = () => updateBtn.style.backgroundColor = '#FF424D';
                    updateBtn.onclick = () => window.open(updateInfo.releaseUrl, '_blank');
                    
                    buttonContainer.insertBefore(updateBtn, buttonContainer.firstChild);
                }} catch (error) {{
                    console.error('Error adding update button:', error);
                }}
            }}
            
            // Listen for update events
            document.addEventListener('skycryptPlusUpdateAvailable', (event) => {{
                addUpdateButton(event.detail);
            }});
            
            if (window.updateInfo) {{
                addUpdateButton(window.updateInfo);
            }}

            // Run all the functions when page loads
            function runAll() {{
                console.log('Running all SkyCrypt+ modifications');
                removeHeaderElements();
                addNetworth();
                addCustomButtons();
                removeBanners();
                handleThemes();
                applyTheme();
                changeSiteName();
            }}

            // Run when page is ready
            if (document.readyState === 'loading') {{
                document.addEventListener('DOMContentLoaded', runAll);
            }} else {{
                runAll();
            }}
        }})();
        """

        # Function to run when the page loads
        def on_loaded():
            try:
                # Inject JavaScript
                window.evaluate_js(js_code)
                logging.info("JavaScript injection successful")
            except Exception as e:
                logging.error(f"Error injecting JavaScript: {e}")
                logging.error(f"Traceback: {traceback.format_exc()}")
            
            # Check for updates
            check_for_updates_async(window)
        
        # API for saving themes
        class WebviewAPI:
            def save_theme(self, theme):
                try:
                    config = read_config()
                    if config:
                        config['selected_theme'] = theme
                        appdata_path = os.path.join(os.environ['APPDATA'], 'SkyCrypt+')
                        config_file_path = os.path.join(appdata_path, 'config.json')
                        
                        with open(config_file_path, 'w') as config_file:
                            json.dump(config, config_file, indent=4)
                        logging.info(f"Theme saved: {theme}")
                except Exception as e:
                    logging.error(f"Error saving theme: {e}")

        # Add API and event handler
        window.expose(WebviewAPI().save_theme)
        window.events.loaded += on_loaded
        
        # Start the webview
        webview.start(debug=False)
    
    except Exception as e:
        logging.error(f"Error creating webview: {e}")
        logging.error(f"Traceback: {traceback.format_exc()}")

def check_for_updates_async(window):
    def check_updates_worker():
        try:
            update_info = check_for_updates()
            if update_info and update_info["update_available"]:
                # Send update info to the window
                window.evaluate_js(f"""
                    window.updateInfo = {{
                        currentVersion: "{update_info['current_version']}",
                        latestVersion: "{update_info['latest_version']}",
                        releaseUrl: "{update_info['release_url']}"
                    }};
                    
                    // Dispatch a custom event that our injected script will listen for
                    const updateEvent = new CustomEvent('skycryptPlusUpdateAvailable', {{ 
                        detail: window.updateInfo 
                    }});
                    document.dispatchEvent(updateEvent);
                """)
                logging.info(f"Update available: {update_info['current_version']} → {update_info['latest_version']}")
            else:
                logging.info("No updates available or couldn't check for updates")
        except Exception as e:
            logging.error(f"Error in update checker thread: {e}")
    
    # Start the check in a separate thread to avoid blocking the UI
    update_thread = threading.Thread(target=check_updates_worker)
    update_thread.daemon = True
    update_thread.start()

def main():
    try:
        update_config_version()
        setup_logging()
        config = read_config()
        
        if config and 'player_name' in config and 'default_profile' in config:
            # Use existing configuration to load stats
            username = config['player_name']
            profile = config['default_profile']
            theme = config.get('selected_theme', 'default.json')
            create_webview(username, profile, theme)
        else:
            # If no configuration found, show setup window
            create_first_time_config_window()
    
    except Exception as e:
        # Capture full traceback for detailed error information
        error_details = f"Error: {str(e)}\n\nTraceback:\n{traceback.format_exc()}"
        logging.error(error_details)
        show_error_window(error_details)

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        error_details = f"Unhandled Error: {str(e)}\n\nTraceback:\n{traceback.format_exc()}"
        logging.critical(error_details)
        show_error_window(error_details)
