import os
import sys

def resource_path(relative_path):
    # Get absolute path to resource for PyInstaller and dev environments
    try:
        base_path = sys._MEIPASS  # PyInstaller creates a temp folder at _MEIPASS
    except Exception:
        base_path = os.path.abspath(".")

    return os.path.join(base_path, relative_path)