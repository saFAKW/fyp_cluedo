import uuid
from datetime import datetime

# Global dictionary to store all sessions
sessions = {}

def generate_session_id():
    """Generate a unique session ID using UUID"""
    return str(uuid.uuid4())

def create_session():
    """Create a new session with default values"""
    session_id = generate_session_id()
    session_data = {
        'session_id': session_id,
        'username': None,
        'room_code': None,
        'connected': True,
        'is_host': False,
        'created_at': datetime.now().isoformat(),
        'last_activity': datetime.now().isoformat()
    }
    sessions[session_id] = session_data
    print(f"Session created: {session_id}")
    return session_data

def get_session(session_id):
    """Retrieve session data by session_id"""
    return sessions.get(session_id)

def update_session(session_id, updates):
    """Update specific fields in a session"""
    if session_id in sessions:
        sessions[session_id].update(updates)
        sessions[session_id]['last_activity'] = datetime.now().isoformat()
        return sessions[session_id]
    return None

def delete_session(session_id):
    """Remove a session from storage"""
    if session_id in sessions:
        del sessions[session_id]
        print(f"Session deleted: {session_id}")
        return True
    return False

def session_exists(session_id):
    """Check if a session exists and is valid"""
    return session_id in sessions

def get_sessions_in_room(room_code):
    """Get all sessions that are in a specific room"""
    return [session for session in sessions.values() if session.get('room_code') == room_code]

def is_username_taken_in_room(username, room_code, exclude_session_id=None):
    """
    Check if a username is already taken in a specific room
    exclude_session_id: used when checking for reconnection (same user, same session)
    """
    room_sessions = get_sessions_in_room(room_code)
    for session in room_sessions:
        if session['session_id'] != exclude_session_id:
            if session.get('username') and session['username'].lower() == username.lower():
                return True
    return False