import os
import json
import logging
import threading
import requests
from packaging import version

def check_for_updates():
    try:
        response = requests.get(
            "https://api.github.com/repos/Balionelis/SkyCryptPlus/releases/latest",
            headers={"Accept": "application/vnd.github.v3+json"},
            timeout=5
        )
        
        if response.status_code == 200:
            release_data = response.json()
            latest_version = release_data.get("tag_name", "").lstrip("v")
            release_url = release_data.get("html_url", "https://github.com/Balionelis/SkyCryptPlus/releases")
            
            try:
                appdata_path = os.path.join(os.environ['APPDATA'], 'SkyCrypt+')
                config_file_path = os.path.join(appdata_path, 'config.json')
                
                if os.path.exists(config_file_path):
                    with open(config_file_path, 'r') as config_file:
                        config = json.load(config_file)
                        current_version = config.get("version", "0.0.0")
                        
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

def check_for_updates_async(window):
    def check_updates_worker():
        try:
            update_info = check_for_updates()
            if update_info and update_info["update_available"]:
                # Inject update notification via JavaScript
                window.evaluate_js(f"""
                    window.updateInfo = {{
                        currentVersion: "{update_info['current_version']}",
                        latestVersion: "{update_info['latest_version']}",
                        releaseUrl: "{update_info['release_url']}"
                    }};
                    
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
    
    update_thread = threading.Thread(target=check_updates_worker)
    update_thread.daemon = True
    update_thread.start()