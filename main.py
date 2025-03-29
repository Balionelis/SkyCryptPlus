import os
import sys
import json
import webview
import datetime
import traceback

should_launch_main_app = False
saved_username = None
saved_profile = None
saved_theme = None

def resource_path(relative_path):
    # Determines the correct path for bundled resources
    # Handles both source and compiled executable scenarios
    try:
        base_path = sys._MEIPASS
    except Exception:
        base_path = os.path.abspath(".")

    return os.path.join(base_path, relative_path)

def read_config():
    # Reads the configuration file from the user's Documents folder
    # Returns the config if found, otherwise returns None
    try:
        documents_path = os.path.join(os.path.expanduser('~'), 'Documents')
        config_file_path = os.path.join(documents_path, 'SkyCrypt+', 'config.json')
        
        if os.path.exists(config_file_path):
            with open(config_file_path, 'r') as config_file:
                return json.load(config_file)
        return None
    except Exception as e:
        print(f"Error reading config file: {e}")
        return None

def save_config(username, profile, theme="default.json"):
    # Saves the user's Minecraft username, profile name, and theme to a configuration file
    try:
        documents_path = os.path.join(os.path.expanduser('~'), 'Documents')
        skycrypt_folder_path = os.path.join(documents_path, 'SkyCrypt+')
        config_file_path = os.path.join(skycrypt_folder_path, 'config.json')
        
        # Ensure the folder exists
        os.makedirs(skycrypt_folder_path, exist_ok=True)
        
        # Prepare configuration data
        config = {
            "version": "1.0.0",
            "created_at": str(datetime.datetime.now()),
            "player_name": username,
            "default_profile": profile,
            "selected_theme": theme
        }
        
        # Write configuration to file
        with open(config_file_path, 'w') as config_file:
            json.dump(config, config_file, indent=4)
        
        print(f"Configuration saved for {username} with profile {profile} and theme {theme}")
        return True
    except Exception as e:
        print(f"Error saving config file: {e}")
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

        # JavaScript for website customization
        reload_script = f"""
        (function() {{
            function removeAdditionalHeaderElements() {{
                try {{
                    const additionalPlayerStatsDiv = document.getElementById('additional_player_stats');
                    if (additionalPlayerStatsDiv) {{
                        additionalPlayerStatsDiv.remove();
                        console.log('Entire additional_player_stats div removed');
                    }}

                    const infoButton = document.getElementById('info-button');
                    if (infoButton) {{
                        infoButton.remove();
                        console.log('About button removed');
                    }}

                    const apiButton = document.getElementById('api_button');
                    if (apiButton) {{
                        apiButton.remove();
                        console.log('API button removed');
                    }}

                    const blmLogo = document.querySelector('a.blm-logo');
                    if (blmLogo) {{
                        blmLogo.remove();
                        console.log('BLM logo removed');
                    }}

                    const infoBox = document.querySelector('#info-box');
                    if(infoBox) {{
                        infoBox.remove();
                        console.log('Info Box removed');
                    }}
                }} catch (error) {{
                    console.error('Error removing header elements:', error);
                }}
            }}


            function addNetworthElement() {{
                try {{
                    const existingNetworth = document.querySelector('#additional_stats_container .additional-stat span[data-tippy-content*="Total Networth"] .stat-value');
                    const statsForProfile = document.getElementById('stats_for_profile');
                    
                    if (statsForProfile && existingNetworth) {{
                        const networthValue = existingNetworth.textContent.trim();
                        
                        const networthElement = document.createElement('span');
                        networthElement.id = 'player_networth';
                        networthElement.className = 'player-networth';
                        networthElement.style.cssText = `
                            position: relative;
                            display: inline-block;
                            font-weight: 600;
                            cursor: context-menu;
                            background-color: rgba(127, 127, 127, .2);
                            border-radius: 100px;
                            padding: 0 15px;
                            height: 54px;
                            line-height: 54px;
                            vertical-align: middle;
                            font-size: 30px;
                            margin-left: 10px;
                        `;
                        
                        const networthLabelSpan = document.createElement('span');
                        networthLabelSpan.textContent = 'Networth: ';
                        
                        const networthValueSpan = document.createElement('span');
                        networthValueSpan.textContent = networthValue;
                        networthValueSpan.style.color = '#55FF55';
                        
                        networthElement.appendChild(networthLabelSpan);
                        networthElement.appendChild(networthValueSpan);
                        
                        statsForProfile.insertAdjacentElement('afterend', networthElement);
                        console.log('Networth element added successfully');
                    }} else {{
                        console.warn('Could not find networth element or stats_for_profile');
                        console.warn('Existing Networth Element:', existingNetworth);
                        console.warn('Stats For Profile:', statsForProfile);
                    }}
                }} catch (error) {{
                    console.error('Error adding Networth element:', error);
                }}
            }}

            function removeDonationBanner() {{
                try {{
                    const banners = document.querySelectorAll('figure.banner');
                    banners.forEach(banner => banner.remove());
                    console.log('Donation banner removed');
                }} catch (error) {{
                    console.error('Error removing donation banner:', error);
                }}
            }}

            function modifyThemesButton() {{
                const themesButton = document.getElementById('themes-button');
                const themesList = document.getElementById('themes-box');
                
                if (themesButton && themesList) {{
                    themesButton.style.display = 'none';
                    themesList.style.display = 'none';
                    themesList.style.visibility = 'hidden';
                    
                    // Add a MutationObserver to track theme selection
                    const observer = new MutationObserver((mutations) => {{
                        mutations.forEach((mutation) => {{
                            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {{
                                const themeRadios = document.querySelectorAll('input[name="theme"]');
                                themeRadios.forEach(radio => {{
                                    radio.addEventListener('change', () => {{
                                        // Automatically apply selection 
                                        if (!localStorage.getItem('themesButtonVisible')) {{
                                            localStorage.setItem('themesButtonVisible', 'true');
                                            
                                            // Update theme and save via API
                                            const selectedTheme = radio.value.split('/').pop();
                                            window.pywebview.api.save_theme(selectedTheme);
                                        }}
                                    }});
                                }});
                            }}
                        }});
                    }});

                    // Configure the observer to watch for class changes
                    observer.observe(themesButton, {{ attributes: true }});
                }}
            }}            
            function setupReloadAndWebsitesButtons() {{
                const buttonContainer = document.createElement('div');
                buttonContainer.id = 'custom-buttons-container';
                buttonContainer.style.cssText = `
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    z-index: 9999;
                    display: flex;
                    gap: 10px;
                    align-items: center;
                `;

                const reloadButton = document.createElement('button');
                reloadButton.id = 'custom-reload-button';
                reloadButton.textContent = 'Refresh Page';
                reloadButton.style.cssText = `
                    padding: 10px;
                    background-color: #282828;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    outline: none;
                `;

                const isMainPage = window.location.href === 'https://sky.shiiyu.moe/';

                const websitesButton = document.createElement('button');
                websitesButton.id = 'custom-websites-button';
                websitesButton.textContent = 'Other Websites';
                websitesButton.style.cssText = `
                    padding: 10px;
                    background-color: #282828;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    outline: none;
                    display: ${{isMainPage ? 'none' : 'block'}};
                `;

                const websitesList = document.createElement('div');
                websitesList.id = 'websites-dropdown';
                websitesList.style.cssText = `
                    position: fixed;
                    bottom: 80px;
                    right: 140px;
                    z-index: 10000;
                    background-color: #282828;
                    border: 1px solid #FFFFFF;
                    border-radius: 5px;
                    display: none;
                    flex-direction: column;
                    min-width: 250px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                `;

                const themeButton = document.createElement('button');
                themeButton.id = 'custom-theme-button';
                themeButton.textContent = 'Themes';
                themeButton.style.cssText = `
                    width: 75px;
                    height: 35px;
                    background-color: #282828;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                `;

                const themesList = document.createElement('div');
                themesList.id = 'themes-dropdown';
                themesList.style.cssText = `
                    position: fixed;
                    bottom: 80px;
                    right: 100px;
                    z-index: 10000;
                    background-color: #282828;
                    border: 1px solid #FFFFFF;
                    border-radius: 5px;
                    display: none;
                    flex-direction: column;
                    min-width: 250px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                `;

                const patreonButton = document.createElement('button');
                patreonButton.id = 'custom-patreon-button';
                patreonButton.style.cssText = `
                    width: 35px;
                    height: 35px;
                    background-color: #FF424D;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    padding: 4px;
                    outline: none;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                `;

                const patreonSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                patreonSvg.setAttribute('version', '1.2');
                patreonSvg.setAttribute('baseProfile', 'tiny');
                patreonSvg.setAttribute('viewBox', '0 0 1014.8 1014.8');
                patreonSvg.setAttribute('overflow', 'visible');
                patreonSvg.style.width = '100%';
                patreonSvg.style.height = '100%';

                patreonSvg.innerHTML = `
                    <path fill="#FF424D" d="M507.4,1014.8L507.4,1014.8C227.2,1014.8,0,787.7,0,507.4v0C0,227.2,227.2,0,507.4,0h0
                        c280.2,0,507.4,227.2,507.4,507.4v0C1014.8,787.7,787.7,1014.8,507.4,1014.8z"/>
                    <g>
                        <circle fill="#FFFFFF" cx="586.4" cy="439.1" r="204.6"/>
                        <rect x="223.8" y="234.5" fill="#241E12" width="100" height="545.8"/>
                    </g>
                `;

                patreonButton.appendChild(patreonSvg);
                    
                const extractUsernameAndProfile = () => {{
                    const pathParts = window.location.pathname.split('/');
                    const username = pathParts[2] || '';
                    const profile = pathParts[3] || '';
                    return {{ username, profile }};
                }};

                const {{ username, profile }} = extractUsernameAndProfile();

                const websites = [
                    {{
                        name: "Plancke",
                        url: `https://plancke.io/hypixel/player/stats/${{username}}`
                    }},
                    {{
                        name: "EliteBot",
                        url: `https://elitebot.dev/@${{username}}/${{profile}}`
                    }},
                    {{
                        name: "Coflnet",
                        url: `https://sky.coflnet.com/player/${{username}}`
                    }}
                ];

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

                // Populate websites dropdown
                websites.forEach(site => {{
                    const siteLink = document.createElement('a');
                    siteLink.textContent = site.name;
                    siteLink.href = site.url;
                    siteLink.target = '_blank';
                    siteLink.style.cssText = `
                        padding: 10px;
                        color: #FFFFFF;
                        text-decoration: none;
                        border-bottom: 1px solid #e0e0e0;
                        transition: background-color 0.2s;
                    `;
                    siteLink.addEventListener('mouseover', () => {{
                        siteLink.style.backgroundColor = 'rgba(186, 95, 222, 0.1)';
                    }});
                    siteLink.addEventListener('mouseout', () => {{
                        siteLink.style.backgroundColor = 'transparent';
                    }});
                    websitesList.appendChild(siteLink);
                }});

                // Populate themes dropdown
                const currentTheme = localStorage.getItem('currentTheme') || 'default.json';
                themes.forEach(theme => {{
                    const themePicker = document.createElement('div');
                    themePicker.textContent = theme.name;
                    themePicker.style.cssText = `
                        padding: 10px;
                        color: ${{theme.file === currentTheme ? 'white' : '#FFFFFF'}};
                        background-color: ${{theme.file === currentTheme ? '#282828' : 'transparent'}};
                        text-decoration: none;
                        border-bottom: 1px solid #e0e0e0;
                        transition: background-color 0.2s;
                        cursor: pointer;
                    `;

                    themePicker.addEventListener('click', () => {{
                        const themesButton = document.getElementById('themes-button');
                        if (themesButton) {{
                            themesButton.click();
                            
                            setTimeout(() => {{
                                const themeRadio = document.querySelector(`input[value="/resources/themes/${{theme.file}}"]`);
                                
                                if (themeRadio) {{
                                    themeRadio.click();
                                    
                                    // Save theme to localStorage and send to Python
                                    localStorage.setItem('currentTheme', theme.file);
                                    window.pywebview.api.save_theme(theme.file);

                                    // Recalculate theme options
                                    document.querySelectorAll('#themes-dropdown > div').forEach(themeOption => {{
                                        themeOption.style.color = themeOption.textContent === themePicker.textContent ? 'white' : '#FFFFFF';
                                        themeOption.style.backgroundColor = themeOption.textContent === themePicker.textContent ? '#282828' : 'transparent';
                                    }});

                                    if (themesButton.getAttribute('aria-expanded') === 'true') {{
                                        themesButton.click();
                                    }}
                                    
                                    themesList.style.display = 'none';
                                }}
                            }}, 300);
                        }}
                    }});

                    themesList.appendChild(themePicker);
                }});

                // Event listeners for websites dropdown
                websitesButton.addEventListener('click', () => {{
                    if (websitesList.style.display === 'none' || websitesList.style.display === '') {{
                        websitesList.style.display = 'flex';
                    }} else {{
                        websitesList.style.display = 'none';
                    }}
                }});

                // Event listeners for themes dropdown
                themeButton.addEventListener('click', () => {{
                    if (themesList.style.display === 'none' || themesList.style.display === '') {{
                        themesList.style.display = 'flex';
                    }} else {{
                        themesList.style.display = 'none';
                    }}
                }});

                // Common click-outside logic for dropdowns
                document.addEventListener('click', (event) => {{
                    if (!websitesButton.contains(event.target) && !websitesList.contains(event.target)) {{
                        websitesList.style.display = 'none';
                    }}
                    if (!themeButton.contains(event.target) && !themesList.contains(event.target)) {{
                        themesList.style.display = 'none';
                    }}
                }});

                // Patreon button event
                patreonButton.addEventListener('click', () => {{
                    window.open('https://www.patreon.com/shiiyu', '_blank');
                }});

                // Reload button event
                reloadButton.addEventListener('click', () => {{
                    window.location.reload();
                }});

                // Append buttons to container
                buttonContainer.appendChild(reloadButton);
                buttonContainer.appendChild(websitesButton);
                buttonContainer.appendChild(themeButton);
                buttonContainer.appendChild(patreonButton);

                document.body.appendChild(buttonContainer);
                document.body.appendChild(websitesList);
                document.body.appendChild(themesList);

                // Add call to modifyThemesButton
                modifyThemesButton();
            }}

            function selectDraconicThemeSilently() {{ 
                // Check if theme has been set on first load
                const hasSetTheme = localStorage.getItem('initialThemeSet');
                
                if (!hasSetTheme) {{
                    const currentTheme = '{theme}';  // Directly use the theme from config
                    
                    const themesButton = document.getElementById('themes-button'); 
                    if (themesButton) {{ 
                        themesButton.click(); 
                        
                        setTimeout(() => {{ 
                            const themeRadio = document.querySelector(`input[value="/resources/themes/${{currentTheme}}"]`); 
                            if (themeRadio) {{ 
                                themeRadio.click(); 
                                
                                setTimeout(() => {{
                                    if (themesButton.getAttribute('aria-expanded') === 'true') {{ 
                                        themesButton.click(); 
                                    }} 
                                    
                                    // Save theme to localStorage
                                    localStorage.setItem('currentTheme', currentTheme);
                                    
                                    // Mark theme as set
                                    localStorage.setItem('initialThemeSet', 'true');
                                }}, 300);
                            }} else {{
                                console.warn(`Theme radio for ${{currentTheme}} not found`);
                            }}
                        }}, 500); 
                    }} else {{
                        console.warn('Themes button not found');
                    }}
                }}
            }}
            function updateSiteName() {{
                try {{
                    const siteNameElement = document.querySelector('#site_name');
                    if (siteNameElement) {{
                        siteNameElement.textContent = 'SkyCrypt+';
                        console.log('Site name updated to SkyCrypt+');
                    }} else {{
                        console.warn('Site name element not found');
                    }}
                }} catch (error) {{
                    console.error('Error updating site name:', error);
                }}
            }}            

            if (document.readyState === 'loading') {{
                document.addEventListener('DOMContentLoaded', () => {{
                    removeAdditionalHeaderElements();
                    addNetworthElement();
                    setupReloadAndWebsitesButtons();
                    removeDonationBanner();
                    selectDraconicThemeSilently();
                    updateSiteName();
                }});
            }} else {{
                removeAdditionalHeaderElements();
                addNetworthElement();
                setupReloadAndWebsitesButtons();
                removeDonationBanner();
                selectDraconicThemeSilently();
                updateSiteName();
            }}
        }})();
        """
        
        def on_loaded():
            # Inject JavaScript when page loads
            try:
                window.evaluate_js(f"""
                (function() {{
                    setTimeout(() => {{
                        {reload_script}
                    }}, 500);
                }})();
                """)
                print("Reload script injection initiated")
            except Exception as e:
                print(f"Error injecting reload script: {e}")
                print(f"Traceback: {traceback.format_exc()}")
        
        # Create ConfigAPI class to handle theme saving
        class WebviewAPI:
            def save_theme(self, theme):
                config = read_config()
                if config:
                    config['selected_theme'] = theme
                    documents_path = os.path.join(os.path.expanduser('~'), 'Documents')
                    skycrypt_folder_path = os.path.join(documents_path, 'SkyCrypt+')
                    config_file_path = os.path.join(skycrypt_folder_path, 'config.json')
                    
                    with open(config_file_path, 'w') as config_file:
                        json.dump(config, config_file, indent=4)
                    print(f"Theme saved: {theme}")

        # Expose the save_theme method
        window.expose(WebviewAPI().save_theme)

        # Add script injection to window's loaded event
        window.events.loaded += on_loaded
        
        webview.start(debug=False)
    
    except Exception as e:
        print(f"Critical error in creating webview: {e}")
        print(f"Traceback: {traceback.format_exc()}")

def main():
    try:
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
        print(error_details)  # Also print to console
        show_error_window(error_details)

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        error_details = f"Unhandled Error: {str(e)}\n\nTraceback:\n{traceback.format_exc()}"
        print(error_details)
        show_error_window(error_details)