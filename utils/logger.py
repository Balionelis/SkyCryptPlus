import os
import logging
from logging.handlers import RotatingFileHandler

def setup_logging():
    try:
        appdata_path = os.path.join(os.environ['APPDATA'], 'SkyCrypt+')
        os.makedirs(appdata_path, exist_ok=True)
        log_file_path = os.path.join(appdata_path, 'skycrypt_plus.log')
        
        # Configure rotating file handler with 10MB size limit
        file_handler = RotatingFileHandler(
            log_file_path, 
            maxBytes=10*1024*1024,
            backupCount=1,
            encoding='utf-8'
        )
        
        formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
        file_handler.setFormatter(formatter)
        
        root_logger = logging.getLogger()
        root_logger.setLevel(logging.INFO)
        root_logger.addHandler(file_handler)
        
        logging.info("===== SkyCrypt+ Started =====")
        logging.info(f"Log file initialized at: {log_file_path}")
        
    except Exception as e:
        logging.error(f"Error setting up logging: {e}")