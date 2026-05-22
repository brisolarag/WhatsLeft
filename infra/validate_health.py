import sys
import time
import requests

def check_health(url, timeout=30):
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "Healthy" or data.get("Status") == "Healthy":
                    print(f"Health check passed! Response: {data}")
                    return True
        except Exception as e:
            print(f"Waiting for healthy response... ({e})")
        time.sleep(2)
    
    print(f"Health check failed after {timeout} seconds.")
    return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python validate_health.py <url>")
        sys.exit(1)
        
    url = sys.argv[1]
    if check_health(url):
        sys.exit(0)
    else:
        sys.exit(1)
