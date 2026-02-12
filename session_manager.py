import uuid
from datetime import datetime

# dictionary to store all sessions
sessions = {}

def generate_session_id():
    """generate a unique session ID using UUID"""
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
    """retrieve session data by session_id"""
    return sessions.get(session_id)

def update_session(session_id, updates):
    """Update specific fields in a session"""
    if session_id in sessions:
        sessions[session_id].update(updates)
        sessions[session_id]['last_activity'] = datetime.now().isoformat()
        return sessions[session_id]
    return None

def delete_session(session_id):
    """remove a session from storage"""
    if session_id in sessions:
        del sessions[session_id]
        print(f"Session deleted: {session_id}")
        return True
    return False

def session_exists(session_id):
    """check if a session exists and is valid"""
    return session_id in sessions