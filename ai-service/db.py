"""
Supabase database client (sync — FastAPI runs each request in its own thread)
"""
import os
import supabase

supabase_url = os.getenv("SUPABASE_URL", "")
supabase_service_key = os.getenv("SUPABASE_SERVICE_KEY", "")

# Singleton sync client
_client = None

def get_supabase():
    global _client
    if _client is None:
        _client = supabase.create_client(supabase_url, supabase_service_key)
    return _client
