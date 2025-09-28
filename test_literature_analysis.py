#!/usr/bin/env python3
"""
Test script to check if the literature search API returns AI analysis
"""
import requests
import json

def test_literature_analysis():
    base_url = "http://localhost:5000"
    
    print("🔍 Testing Literature Search API with AI Analysis")
    print("-" * 60)
    
    # First, let's try to login to get a token
    print("1. Attempting to login...")
    try:
        login_response = requests.post(f"{base_url}/auth/login", 
                                     json={"username": "admin", "password": "admin"})
        print(f"   Login Status: {login_response.status_code}")
        
        if login_response.status_code == 200:
            login_data = login_response.json()
            token = login_data.get('access_token')
            print(f"   ✅ Login successful, token received")
        else:
            print(f"   ❌ Login failed: {login_response.text}")
            print("   Trying without authentication...")
            token = None
    except Exception as e:
        print(f"   ❌ Login error: {e}")
        token = None
    
    print("\n2. Testing literature search...")
    
    # Test literature search
    headers = {
        'Content-Type': 'application/json'
    }
    if token:
        headers['Authorization'] = f'Bearer {token}'
    
    payload = {
        "specialty": "cardiology",
        "keywords": ["hypertension", "treatment"],
        "patient_conditions": ["high blood pressure"],
        "enable_ai_analysis": True,
        "max_results": 3
    }
    
    try:
        response = requests.post(f"{base_url}/literature/search", 
                               headers=headers,
                               json=payload)
        
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Response received")
            print(f"   Studies count: {len(data.get('data', {}).get('studies', []))}")
            
            # Check for AI analysis
            ai_analysis = data.get('data', {}).get('ai_analysis')
            if ai_analysis:
                print(f"   ✅ AI Analysis present!")
                print(f"   Analysis keys: {list(ai_analysis.keys())}")
                print(f"   Summary: {ai_analysis.get('summary', 'No summary')[:100]}...")
                print(f"   Key findings count: {len(ai_analysis.get('key_findings', []))}")
                print(f"   Confidence score: {ai_analysis.get('confidence_score', 'N/A')}")
            else:
                print(f"   ❌ No AI analysis in response")
                print(f"   Available data keys: {list(data.get('data', {}).keys())}")
            
            # Print full response structure (truncated)
            print(f"\n   📋 Full Response Structure:")
            print(json.dumps(data, indent=2)[:1000] + "..." if len(json.dumps(data, indent=2)) > 1000 else json.dumps(data, indent=2))
            
        else:
            print(f"   ❌ Request failed")
            print(f"   Error: {response.text}")
            
    except Exception as e:
        print(f"   ❌ Request error: {e}")

if __name__ == "__main__":
    test_literature_analysis()
