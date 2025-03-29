import os
import sys

def resource_path(relative_path):
    # Handle resource paths for both development and PyInstaller environments
    try:
        base_path = sys._MEIPASS
    except Exception:
        base_path = os.path.abspath(".")

    return os.path.join(base_path, relative_path)