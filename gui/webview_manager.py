import os
import logging
import traceback
import webview
import json

from config.config_manager import read_config
from utils.updater import check_for_updates_async
from assets.js.injector import get_js_code

def create_webview(username, profile, theme=None):
    if not theme:
        config = read_config()
        theme = config.get('selected_theme', 'default.json') if config else 'default.json'
    
    url = f"https://sky.shiiyu.moe/stats/{username}/{profile}"
    
    try:
        window = webview.create_window(
            'SkyCrypt+', 
            url, 
            width=1200, 
            height=800,
            fullscreen=False,
            background_color='#ffffff',
            text_select=True
        )
        
        def on_loaded():
            try:
                # Inject custom JS to modify the sky.shiiyu.moe page
                js_code = get_js_code(theme)
                window.evaluate_js(js_code)
                logging.info("JavaScript injection successful")
            except Exception as e:
                logging.error(f"Error injecting JavaScript: {e}")
                logging.error(f"Traceback: {traceback.format_exc()}")
            
            check_for_updates_async(window)
        
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

        window.expose(WebviewAPI().save_theme)
        window.events.loaded += on_loaded
        
        webview.start(debug=False)
    
    except Exception as e:
        logging.error(f"Error creating webview: {e}")
        logging.error(f"Traceback: {traceback.format_exc()}")