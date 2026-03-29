import requests
import json

# Explore ff.garena.com/api
base = "https://ff.garena.com/api"

paths = [
    "/guest/create",
    "/account/create", 
    "/user/guest",
    "/auth/guest",
    "/v1/guest",
    "/v2/guest/create",
    "/mobile/guest",
    "/game/guest/create"
]

print("Exploring Free Fire API paths...\n")

for path in paths:
    url = f"{base}{path}"
    for method in ["GET", "POST"]:
        try:
            if method == "GET":
                r = requests.get(url, timeout=3)
            else:
                r = requests.post(url, json={"region": "IN"}, timeout=3)
            
            if r.status_code != 404:
                print(f"✅ {method} {url}")
                print(f"   Status: {r.status_code}")
                print(f"   Response: {r.text[:200]}")
                print()
        except:
            pass
