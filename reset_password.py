import json
from werkzeug.security import generate_password_hash

JSON_FILE = 'data/data.json'

def reset_password():
    try:
        with open(JSON_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        new_hash = generate_password_hash('admin123', method='pbkdf2:sha256')
        data['admin_credentials']['password_hash'] = new_hash
        
        with open(JSON_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=4, ensure_ascii=False)
        
        print(f"Password reset to 'admin123'. New hash: {new_hash}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    reset_password()
