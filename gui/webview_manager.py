import os
import logging
import traceback
import webview
import json
import threading
import time

from config.config_manager import read_config
from utils.updater import check_for_updates_async
from assets.js.injector import get_essential_js_code, get_enhanced_js_code

def create_webview(username, profile, theme=None):
    if not theme:
        config = read_config()
        theme = config.get('selected_theme', 'default.json') if config else 'default.json'
    
    url = f"https://sky.shiiyu.moe/stats/{username}/{profile}"
    
    try:
        class Api:
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

            def save_auto_refresh(self, interval):
                try:
                    config = read_config()
                    if config:
                        config['auto_refresh_interval'] = interval
                        appdata_path = os.path.join(os.environ['APPDATA'], 'SkyCrypt+')
                        config_file_path = os.path.join(appdata_path, 'config.json')
                        
                        with open(config_file_path, 'w') as config_file:
                            json.dump(config, config_file, indent=4)
                        logging.info(f"Auto refresh interval saved: {interval}")
                        return True
                    return False
                except Exception as e:
                    logging.error(f"Error saving auto refresh interval: {e}")
                    return False

            def get_auto_refresh(self):
                try:
                    config = read_config()
                    if config and 'auto_refresh_interval' in config:
                        return config['auto_refresh_interval']
                    return 'off'
                except Exception as e:
                    logging.error(f"Error getting auto refresh interval: {e}")
                    return 'off'
        
        api = Api()
        
        window = webview.create_window(
            'SkyCrypt+', 
            url, 
            width=1500, 
            height=800,
            fullscreen=False,
            background_color='#ffffff',
            text_select=True,
            js_api=api
        )
        
        def inject_essential_js():
            try:
                js_code = get_essential_js_code(theme)
                window.evaluate_js(js_code)
                logging.info("Essential JavaScript injection successful")
            except Exception as e:
                logging.error(f"Error injecting essential JavaScript: {e}")
        
        def inject_enhanced_js():
            try:
                time.sleep(0.5)
                js_code = get_enhanced_js_code(theme)
                window.evaluate_js(js_code)
                logging.info("Enhanced JavaScript injection successful")
            except Exception as e:
                logging.error(f"Error injecting enhanced JavaScript: {e}")
                
        def check_updates_later():
            try:
                time.sleep(3)
                check_for_updates_async(window)
            except Exception as e:
                logging.error(f"Error in delayed update check: {e}")
        
        def on_loaded():
            inject_essential_js()
            threading.Thread(target=inject_enhanced_js, daemon=True).start()
            threading.Thread(target=check_updates_later, daemon=True).start()
        
        window.events.loaded += on_loaded
        
        webview.start(debug=False)
    
    except Exception as e:
        logging.error(f"Error creating webview: {e}")
        logging.error(f"Traceback: {traceback.format_exc()}")