import os
import json
import datetime
import logging

from version import current_version

def read_config():
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
    try:
        config = read_config()
        if not config:
            logging.info("No existing config found to update version")
            return False
        
        if config.get("version") != current_version:
            config["version"] = current_version
            
            appdata_path = os.path.join(os.environ['APPDATA'], 'SkyCrypt+')
            config_file_path = os.path.join(appdata_path, 'config.json')
            
            with open(config_file_path, 'w') as config_file:
                json.dump(config, config_file, indent=4)
            
            logging.info(f"Updated config version to {current_version}")
        
        return True
    except Exception as e:
        logging.error(f"Error updating config version: {e}")
        return False

def save_config(username, profile, theme="default.json"):
    try:
        appdata_path = os.path.join(os.environ['APPDATA'], 'SkyCrypt+')
        config_file_path = os.path.join(appdata_path, 'config.json')
        
        os.makedirs(appdata_path, exist_ok=True)
        
        config = {
            "version": current_version,
            "created_at": str(datetime.datetime.now()),
            "player_name": username,
            "default_profile": profile,
            "selected_theme": theme
        }
        
        with open(config_file_path, 'w') as config_file:
            json.dump(config, config_file, indent=4)
        
        logging.info(f"Configuration saved for {username} with profile {profile} and theme {theme}")
        return True
    except Exception as e:
        logging.error(f"Error saving config file: {e}")
        return False