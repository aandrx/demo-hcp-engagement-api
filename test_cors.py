#!/usr/bin/env python3
"""
Simple script to test if the Flask API is working with CORS
"""
import requests
import json

def test_api():
    base_url = "http://localhost:5000"
    
    print("Testing Flask API CORS Configuration")
    print(f"Base URL: {base_url}")
    print("-" * 50)
    
    # Test health endpoint
    try:
        print("1. Testing health endpoint...")
        response = requests.get(f"{base_url}/health")
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.text}")
        print(f"   CORS Headers: {dict(response.headers)}")
        print()
    except Exception as e:
        print(f"   Health check failed: {e}")
        print()
    
    # Test login endpoint with OPTIONS (preflight)
    try:
        print("2. Testing login OPTIONS (preflight)...")
        response = requests.options(f"{base_url}/auth/login", 
                                  headers={
                                      'Origin': 'http://localhost:3000',
                                      'Access-Control-Request-Method': 'POST',
                                      'Access-Control-Request-Headers': 'Content-Type'
                                  })
        print(f"   Status: {response.status_code}")
        print(f"   CORS Headers:")
        for header, value in response.headers.items():
            if 'access-control' in header.lower():
                print(f"     {header}: {value}")
        print()
    except Exception as e:
        print(f"   OPTIONS request failed: {e}")
        print()
    
    # Test actual login
    try:
        print("3. Testing login POST...")
        response = requests.post(f"{base_url}/auth/login",
                               headers={
                                   'Content-Type': 'application/json',
                                   'Origin': 'http://localhost:3000'
                               },
                               json={'username': 'test', 'password': 'test'})
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.text}")
        print(f"   CORS Headers:")
        for header, value in response.headers.items():
            if 'access-control' in header.lower():
                print(f"     {header}: {value}")
        print()
    except Exception as e:
        print(f"   Login request failed: {e}")
        print()

if __name__ == "__main__":
    test_api()
