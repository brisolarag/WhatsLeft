import sys
import time
import requests

def check_ui(url, timeout=30):
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                print("UI check passed! Status code: 200")
                return True
        except Exception as e:
            print(f"Waiting for UI response... ({e})")
        time.sleep(2)
    
    print(f"UI check failed after {timeout} seconds.")
    return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python validate_ui.py <url>")
        sys.exit(1)
        
    url = sys.argv[1]
    if check_ui(url):
        sys.exit(0)
    else:
        sys.exit(1)
