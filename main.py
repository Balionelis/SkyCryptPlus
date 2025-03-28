import os
import sys
import json
import webview
import datetime
import threading
import traceback

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

def save_config(username, profile):
    # Saves the user's Minecraft username and profile to a configuration file
    # Creates the directory if it doesn't exist
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
            "default_profile": profile
        }
        
        # Write configuration to file
        with open(config_file_path, 'w') as config_file:
            json.dump(config, config_file, indent=4)
        
        print(f"Configuration saved for {username} with profile {profile}")
        return True
    except Exception as e:
        print(f"Error saving config file: {e}")
        return False
    
def create_first_time_config_window():
    # Creates an initial setup window for new users
    # Allows input of Minecraft username and profile    
    first_time_html = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>SkyCrypt+ First Time Setup</title>
        <style>
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
            input {
                width: 100%;
                padding: 10px;
                margin: 10px 0;
                border: 1px solid #BA5FDE;
                border-radius: 5px;
            }
            button {
                background-color: #BA5FDE;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                transition: background-color 0.3s;
            }
            button:hover {
                background-color: #9A3BAE;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>SkyCrypt+ Setup</h2>
            <input type="text" id="username" placeholder="Minecraft Username">
            <input type="text" id="profile" placeholder="Minecraft Profile Name">
            <button onclick="saveConfig()">Save Configuration</button>
            
            <script>
                function saveConfig() {
                    const username = document.getElementById('username').value;
                    const profile = document.getElementById('profile').value;
                    
                    if (username && profile) {
                        window.pywebview.api.save_configuration(username, profile);
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
        def save_configuration(self, username, profile):
            # Handles saving configuration and launching main application
            save_success = save_config(username, profile)
            if save_success:
                # Start main app in a separate thread
                threading.Thread(target=create_webview, args=(username, profile), daemon=True).start()
                window_instance.destroy()
    
    # Create setup window
    window_instance = webview.create_window(
        'SkyCrypt+ Setup', 
        html=first_time_html,
        width=400, 
        height=300,
        resizable=False
    )
    
    api = ConfigAPI()
    window_instance.expose(api.save_configuration)
    
    webview.start(debug=False)

def create_webview(username, profile):
    # Creates the main application window
    # Loads Hypixel stats from sky.shiiyu.moe with custom modifications    
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
                        networthValueSpan.style.color = '#BA5FDE';
                        
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

            function setupReloadAndWebsitesButtons() {{
                const reloadButton = document.createElement('button');
                reloadButton.id = 'custom-reload-button';
                reloadButton.textContent = 'Refresh Page';
                reloadButton.style.cssText = `
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    z-index: 9999;
                    padding: 10px;
                    background-color: #BA5FDE;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    outline: none;
                `;

                const toast = document.createElement('div');
                toast.id = 'reload-toast';
                toast.style.cssText = `
                    position: fixed;
                    top: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    background-color: #BA5FDE;
                    color: white;
                    padding: 15px 30px;
                    border-radius: 5px;
                    z-index: 10000;
                    opacity: 0;
                    transition: opacity 0.3s ease-in-out;
                `;
                toast.textContent = 'Refreshing...';

                reloadButton.addEventListener('click', () => {{
                    document.body.appendChild(toast);
                    toast.style.opacity = '1';

                    window.location.reload();

                    setTimeout(() => {{
                        toast.style.opacity = '0';
                        setTimeout(() => {{
                            document.body.removeChild(toast);
                        }}, 300);
                    }}, 2000);
                }});

                function extractUsernameAndProfile() {{
                    const pathParts = window.location.pathname.split('/');
                    const username = pathParts[2] || '';
                    const profile = pathParts[3] || '';
                    return {{ username, profile }};
                }}
                const patreonButton = document.createElement('button');
                patreonButton.id = 'custom-patreon-button';
                patreonButton.textContent = 'Patreon';
                patreonButton.style.cssText = `
                    position: fixed;
                    bottom: 20px;
                    right: 270px;
                    z-index: 9999;
                    padding: 10px;
                    background-color: #f96854;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    outline: none;
                `;

                patreonButton.addEventListener('click', () => {{
                    window.open('https://www.patreon.com/shiiyu', '_blank');
                }});

                const websitesButton = document.createElement('button');
                websitesButton.id = 'custom-websites-button';
                websitesButton.textContent = 'Other Websites';
                websitesButton.style.cssText = `
                    position: fixed;
                    bottom: 20px;
                    right: 140px;
                    z-index: 9999;
                    padding: 10px;
                    background-color: #BA5FDE;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    outline: none;
                `;

                const websitesList = document.createElement('div');
                websitesList.id = 'websites-dropdown';
                websitesList.style.cssText = `
                    position: fixed;
                    bottom: 80px;
                    right: 140px;
                    z-index: 10000;
                    background-color: white;
                    border: 1px solid #BA5FDE;
                    border-radius: 5px;
                    display: none;
                    flex-direction: column;
                    min-width: 250px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                `;

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

                websites.forEach(site => {{
                    const siteLink = document.createElement('a');
                    siteLink.textContent = site.name;
                    siteLink.href = site.url;
                    siteLink.target = '_blank';
                    siteLink.style.cssText = `
                        padding: 10px;
                        color: #BA5FDE;
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

                websitesButton.addEventListener('click', () => {{
                    if (websitesList.style.display === 'none' || websitesList.style.display === '') {{
                        websitesList.style.display = 'flex';
                    }} else {{
                        websitesList.style.display = 'none';
                    }}
                }});

                document.addEventListener('click', (event) => {{
                    if (!websitesButton.contains(event.target) && !websitesList.contains(event.target)) {{
                        websitesList.style.display = 'none';
                    }}
                }});

                document.body.appendChild(reloadButton);
                document.body.appendChild(websitesButton);
                document.body.appendChild(websitesList);
                document.body.appendChild(patreonButton);

                console.log('Buttons and websites list added successfully');
            }}

            function selectDraconicThemeSilently() {{
                try {{
                    if (localStorage.getItem('themeSwitchedOnce') === 'true') {{
                        console.log('Theme already set previously, skipping selection');
                        return;
                    }}

                    const themesButton = document.getElementById('themes-button');
                    if (themesButton) {{
                        themesButton.click();

                        setTimeout(() => {{
                            const draconicThemeRadio = document.querySelector('input[value="/resources/themes/draconic.json"]');
                            
                            if (draconicThemeRadio) {{
                                draconicThemeRadio.click();

                                if (themesButton.getAttribute('aria-expanded') === 'true') {{
                                    themesButton.click();
                                }}

                                localStorage.setItem('themeSwitchedOnce', 'true');

                                console.log('Draconic theme selected successfully');
                            }} else {{
                                console.warn('Draconic theme radio button not found');
                            }}
                        }}, 300);
                    }} else {{
                        console.warn('Themes button not found');
                    }}
                }} catch (error) {{
                    console.error('Silent theme selection failed:', error);
                }}
            }}

            if (document.readyState === 'loading') {{
                document.addEventListener('DOMContentLoaded', () => {{
                    removeAdditionalHeaderElements();
                    addNetworthElement();
                    setupReloadAndWebsitesButtons();
                    removeDonationBanner();
                    selectDraconicThemeSilently();
                }});
            }} else {{
                removeAdditionalHeaderElements();
                addNetworthElement();
                setupReloadAndWebsitesButtons();
                removeDonationBanner();
                selectDraconicThemeSilently();
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
        
        # Add script injection to window's loaded event
        window.events.loaded += on_loaded
        
        webview.start(debug=False)
    
    except Exception as e:
        print(f"Critical error in creating webview: {e}")
        print(f"Traceback: {traceback.format_exc()}")

def main():
    # Application entry point
    # Checks for existing configuration and launches accordingly
    try:
        config = read_config()
        
        if config and 'player_name' in config and 'default_profile' in config:
            # Use existing configuration to load stats
            username = config['player_name']
            profile = config['default_profile']
            create_webview(username, profile)
        else:
            # No configuration found, show setup window
            create_first_time_config_window()
    
    except Exception as e:
        print(f"Unexpected error: {e}")
        print(f"Traceback: {traceback.format_exc()}")

if __name__ == "__main__":
    main()