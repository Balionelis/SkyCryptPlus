import traceback
import logging

from utils.logger import setup_logging
from config.config_manager import read_config, update_config_version
from gui.webview_manager import create_webview
from gui.first_time_setup import create_first_time_config_window
from gui.error_window import show_error_window

def main():
    try:
        update_config_version()
        setup_logging()
        config = read_config()
        
        if config and 'player_name' in config and 'default_profile' in config:
            username = config['player_name']
            profile = config['default_profile']
            theme = config.get('selected_theme', 'default.json')
            create_webview(username, profile, theme)
        else:
            create_first_time_config_window()
    
    except Exception as e:
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