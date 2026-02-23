# Single-Device Login Security Feature

## Feature Summary

Implement a comprehensive security system with the following features:
1. **Single-Device Login Enforcement** - Prevent concurrent logins from multiple devices
2. **Graceful Session Transition** - Notify old device before forced disconnect
3. **Session Heartbeat System** - Track active sessions with periodic heartbeats
4. **Login Attempt Rate Limiting** - Prevent brute force attacks

---

## Core Feature: Single-Device Login Enforcement

### Goals
- Prevent account sharing and unauthorized access
- Ensure only one active session per user at any time
- Provide automatic session management with graceful disconnect

### User-Facing Behavior
- **First login**: User successfully logs in, no previous session exists → immediate login
- **Second login (different device)**: 
  1. Server detects existing active session
  2. Old client receives "session_disconnecting" notification (5 seconds before disconnect)
  3. Old client is force disconnected after 5 seconds
  4. New login completes and new session becomes active
- **Manual logout**: User can log out from a device
- **Session expiry**: Sessions automatically expire after configurable inactivity period

### Login Flow (Sequence Diagram)

```
Client A (logged in)                    Server                          Client B (new login)
     |                                    |                                    |
     |                                    |  POST /auth/login                  |
     |                                    | <-----------------------------------|
     |                                    |                                    |
     |  session_disconnecting event       |  Check existing session            |
     |<-----------------------------------|                                    |
     |  {reason: "new_login",            |                                    |
     |   gracePeriod: 5000}               |                                    |
     |                                    |                                    |
     |  (5 second countdown)              |  Wait 5 seconds                    |
     |                                    |                                    |
     |  force_logout event                |                                    |
     |<-----------------------------------|                                    |
     |                                    |  Create new session                |
     |                                    |                                    |
     |                                    |  Return session token              |
     |                                    | ---------------------------------->|
     |                                    |                                    |
```

---

## Technical Architecture

### Database Schema

```prisma
model UserSession {
    id           String   @id @default(uuid())
    userId       Int
    user         User     @relation(fields: [userId], references: [id])
    deviceId     String   // Unique device identifier
    deviceInfo   String   // Human-readable device info
    deviceType   String   // DESKTOP, MOBILE, WEB
    ipAddress    String
    userAgent    String
    token        String   @unique // Session token
    isActive     Boolean  @default(true)
    lastHeartbeat DateTime @default(now())
    createdAt    DateTime @default(now())
    lastActiveAt DateTime @default(now())
    expiresAt    DateTime
}

model User {
    id        Int          @id @default(autoincrement())
    username  String       @unique
    password  String
    // ... existing fields ...
    sessions  UserSession[]
}

model LoginAttempt {
    id         Int      @id @default(autoincrement())
    userId     Int?
    username   String   // Even for failed attempts
    ipAddress  String
    userAgent  String
    success    Boolean
    reason     String?  // Error reason for failed attempts
    createdAt DateTime @default(now())
}
```

### Configuration

```javascript
// server config
const SESSION_CONFIG = {
    ABSOLUTE_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7 days
    INACTIVITY_EXPIRY: 24 * 60 * 60 * 1000,    // 24 hours
    HEARTBEAT_INTERVAL: 30000,                  // 30 seconds
    GRACE_PERIOD_BEFORE_DISCONNECT: 5000,       // 5 seconds (only if old session exists)
    MAX_LOGIN_ATTEMPTS: 5,                      // Max attempts before lockout
    LOCKOUT_DURATION: 15 * 60 * 1000,           // 15 minutes
};
```

---

## Server Components

### 1. SessionService (`server/src/services/sessionService.js`)

```javascript
class SessionService {
    // Create new session, invalidate old ones
    async createSession(userId, deviceInfo, ipAddress, userAgent)
    
    // Validate session token
    async validateSession(token)
    
    // Update heartbeat
    async heartbeat(token)
    
    // Get active session
    async getActiveSession(token)
    
    // Invalidate specific session
    async invalidateSession(token)
    
    // Invalidate all user sessions
    async invalidateAllUserSessions(userId, exceptToken)
    
    // Get all sessions for user
    async getUserSessions(userId)
    
    // Cleanup expired sessions
    async cleanupExpiredSessions()
}
```

### 2. RateLimiter (`server/src/services/rateLimitService.js`)

```javascript
class RateLimitService {
    // Check if request should be rate limited
    async checkRateLimit(ipAddress, username)
    
    // Record failed attempt
    async recordFailedAttempt(ipAddress, username)
    
    // Record success - reset counter
    async resetAttempts(ipAddress, username)
    
    // Check if locked out
    async isLockedOut(ipAddress, username)
}
```

### 3. Enhanced SocketService (`server/src/services/socketService.js`)

```javascript
// Socket events
socket.on("authenticate", async (data) => {
    const { userId, sessionToken, deviceInfo } = data;
    
    // Validate session
    const session = await sessionService.validateSession(sessionToken);
    if (!session) {
        socket.emit("session_invalid", { reason: "expired" });
        return;
    }
    
    // Check if user already has active session on another socket
    const existingSocket = this.userSockets.get(userId);
    if (existingSocket && existingSocket !== socket.id) {
        // Send graceful disconnect notification
        io.to(existingSocket).emit("session_disconnecting", {
            reason: "new_login",
            gracePeriod: CONFIG.GRACE_PERIOD_BEFORE_DISCONNECT
        });
        
        // Schedule forced disconnect
        setTimeout(() => {
            io.to(existingSocket).emit("force_logout", {
                reason: "new_login"
            });
            disconnectSocket(existingSocket);
        }, CONFIG.GRACE_PERIOD_BEFORE_DISCONNECT);
    }
    
    // Authenticate this socket
    this.userSockets.set(userId, socket.id);
    socket.userId = userId;
    socket.sessionToken = sessionToken;
    socket.emit("authenticated", { userId });
});

socket.on("heartbeat", (data) => {
    sessionService.heartbeat(socket.sessionToken);
});

socket.on("disconnect", () => {
    // Cleanup - but don't invalidate session immediately
    // Session expires via heartbeat timeout
});
```

### 4. Modified AuthController (`server/src/controllers/userController.js`)

```javascript
async login(req, res) {
    const { username, password, deviceInfo } = req.body;
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];
    
    // Rate limiting
    const rateLimit = await rateLimitService.checkRateLimit(ipAddress, username);
    if (rateLimit.blocked) {
        return res.status(429).json({
            error: "too_many_attempts",
            retryAfter: rateLimit.retryAfter
        });
    }
    
    // Validate credentials
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || user.password !== password) {
        await rateLimitService.recordFailedAttempt(ipAddress, username);
        return res.status(401).json({ error: "invalid_credentials" });
    }
    
    // Reset rate limit counter
    await rateLimitService.resetAttempts(ipAddress, username);
    
    // Check for existing active session
    const existingSession = await sessionService.getActiveSessionByUserId(user.id);
    
    // If existing session found, notify and disconnect old client first
    if (existingSession) {
        // Get socket ID for existing session
        const existingSocketId = socketService.getSocketIdBySessionToken(existingSession.token);
        
        if (existingSocketId) {
            // Send disconnect notification to old client
            socketService.emitToSocket(existingSocketId, "session_disconnecting", {
                reason: "new_login",
                gracePeriod: CONFIG.GRACE_PERIOD_BEFORE_DISCONNECT,
                newLoginAt: new Date().toISOString()
            });
            
            // Wait 5 seconds before completing new login
            await new Promise(resolve => setTimeout(resolve, CONFIG.GRACE_PERIOD_BEFORE_DISCONNECT));
            
            // Force disconnect old socket
            socketService.disconnectSocket(existingSocketId, "new_login");
            
            // Invalidate old session
            await sessionService.invalidateSession(existingSession.token);
        }
    }
    
    // Create new session (only after old session is disconnected)
    const session = await sessionService.createSession(
        user.id,
        deviceInfo,
        ipAddress,
        userAgent
    );
    
    // Log successful login
    await prisma.loginAttempt.create({
        data: {
            userId: user.id,
            username,
            ipAddress,
            userAgent,
            success: true
        }
    });
    
    res.json({
        success: true,
        user,
        session: {
            token: session.token,
            deviceId: session.deviceId,
            expiresAt: session.expiresAt
        }
    });
}
```

### 5. Session Middleware (`server/src/middleware/sessionMiddleware.js`)

```javascript
function sessionMiddleware(req, res, next) {
    const token = req.headers['x-session-token'];
    
    if (!token) {
        return res.status(401).json({ error: "no_session" });
    }
    
    const session = await sessionService.validateSession(token);
    if (!session) {
        return res.status(401).json({ error: "session_expired" });
    }
    
    req.userId = session.userId;
    req.session = session;
    next();
}
```

---

## Client Components

### 1. Enhanced AuthHandler (`client/src/network/AuthHandler.gd`)

```gdscript
var session_token: String = ""
var device_info: String = ""

func login(username: String, password: String):
    var device_id = _get_device_id()
    device_info = _get_device_info()
    _request("/auth/login", HTTPClient.METHOD_POST, {
        "username": username,
        "password": password,
        "deviceInfo": device_info
    })

func _handle_success(endpoint: String, json):
    if endpoint.contains("/auth/login"):
        session_token = json.session.token
        GameState.set_user(json.user)
        GameState.set_session_token(session_token)
        emit_signal("login_success", json)

func _handle_error(endpoint: String, message: String, extra: Dictionary = {}):
    if endpoint.contains("/auth/login"):
        if message == "too_many_attempts":
            # Show lockout message with retry time
            var retry_after = extra.get("retryAfter", 0)
            ui_manager.show_error("Too many attempts. Try again in %d seconds" % retry_after)
        emit_signal("login_failed", message)
```

### 2. Enhanced SocketHandler (`client/src/network/SocketHandler.gd`)

```gdscript
var session_token: String = ""
var heartbeat_timer: Timer

func _ready():
    heartbeat_timer = Timer.new()
    heartbeat_timer.wait_time = 25  # Send heartbeat every 25s
    heartbeat_timer.timeout.connect(_send_heartbeat)
    add_child(heartbeat_timer)

func authenticate(user_id: int):
    var msg = '42["authenticate", %s]' % JSON.stringify({
        "userId": user_id,
        "sessionToken": session_token,
        "deviceInfo": AuthHandler.device_info
    })
    socket.send_text(msg)

func _on_data(raw_data: String):
    # ... existing event handling ...
    elif raw_data.begins_with("42"):
        var payload = raw_data.substr(2)
        var json = JSON.parse_string(payload)
        if json is Array and json.size() >= 2:
            var event = json[0]
            var data = json[1]
            match event:
                "session_disconnecting":
                    _handle_graceful_disconnect(data)
                "force_logout":
                    _handle_force_logout(data)
                # ... other events ...

func _handle_graceful_disconnect(data: Dictionary):
    var reason = data.get("reason", "unknown")
    var grace_period = data.get("gracePeriod", 5)
    
    # Show notification
    ui_manager.show_notification(
        "Perangkat lain sedang login. Anda akan disconnect dalam %d detik." % grace_period
    )
    
    # Start countdown display
    _show_disconnect_countdown(grace_period)

func _show_disconnect_countdown(seconds: int):
    var countdown_label = Label.new()
    countdown_label.text = str(seconds)
    countdown_label.set_anchors_preset(Control.PRESET_CENTER)
    countdown_label.add_theme_font_size_override("font_size", 48)
    countdown_label.add_theme_color_override("font_color", Color.RED)
    add_child(countdown_label)
    
    var timer = Timer.new()
    timer.wait_time = 1
    timer.timeout.connect(func():
        seconds -= 1
        if seconds > 0:
            countdown_label.text = str(seconds)
        else:
            timer.queue_free()
            countdown_label.queue_free()
    )
    add_child(timer)
    timer.start()

func _handle_force_logout(data: Dictionary):
    var reason = data.get("reason", "unknown")
    
    # Stop heartbeat
    heartbeat_timer.stop()
    
    # Show message
    ui_manager.show_error("You have been logged out. Reason: %s" % reason)
    
    # Reset state
    _disconnect_socket()
    GameState.clear_session()
    
    # Return to login screen
    ui_manager.show_login_screen()

func _send_heartbeat():
    var msg = '42["heartbeat", {"token": "%s"}]' % session_token
    socket.send_text(msg)

func _disconnect_socket():
    is_socket_connected = false
    is_authenticated = false
    socket.close()
```

### 3. GameState Updates (`client/src/autoload/game_state.gd`)

```gdscript
var session_token: String = ""
var session_expires_at: int = 0
var device_info: String = ""

func set_session_token(token: String, expires_at: int):
    session_token = token
    session_expires_at = expires_at
    # Save to secure storage
    _save_creds_to_keychain(username, session_token)

func clear_session():
    session_token = ""
    session_expires_at = 0
    _clear_creds_from_keychain()

func is_session_valid() -> bool:
    return session_token != "" and OS.get_unix_time() < session_expires_at
```

---

## API Endpoints

### Authentication

```
POST /auth/login
Headers: Content-Type: application/json
Body: {
    "username": "string",
    "password": "string",
    "deviceInfo": "string"  // Optional
}
Response (200): {
    "success": true,
    "user": { ... },
    "session": {
        "token": "uuid",
        "deviceId": "string",
        "expiresAt": "ISO8601"
    }
}
Response (401): { "error": "invalid_credentials" }
Response (429): { "error": "too_many_attempts", "retryAfter": 900 }

POST /auth/logout
Headers: X-Session-Token: string
Body: { "all": boolean }  // Optional, default false
Response: { "success": true }

POST /auth/logout-all
Headers: X-Session-Token: string
Response: { "success": true }

GET /auth/sessions
Headers: X-Session-Token: string
Response: {
    "sessions": [
        {
            "id": "uuid",
            "deviceInfo": "string",
            "deviceType": "DESKTOP",
            "ipAddress": "string",
            "createdAt": "ISO8601",
            "lastActiveAt": "ISO8601"
        }
    ]
}
```

### Socket Events

Client → Server:
```
["authenticate", { 
    "userId": int, 
    "sessionToken": "uuid",
    "deviceInfo": "string"
}]
["heartbeat", { "token": "uuid" }]
```

Server → Client:
```
["session_disconnecting", { 
    "reason": "new_login|security", 
    "gracePeriod": 10000 
}]
["force_logout", { 
    "reason": "new_login|security|timeout|inactivity" 
}]
["session_expired", { "reason": "timeout" }]
["authenticated", { "userId": int }]
["rate_limit_exceeded", { "retryAfter": 900 }]
```

---

## Implementation Checklist

### Phase 1: Core Infrastructure
- [ ] Create Prisma migration for UserSession and LoginAttempt models
- [ ] Implement SessionService with all session management functions
- [ ] Implement RateLimitService for login rate limiting
- [ ] Add session middleware for protected routes

### Phase 2: Server Integration
- [ ] Update login endpoint with session creation and rate limiting
- [ ] Add logout endpoints (single and all sessions)
- [ ] Add session listing endpoint
- [ ] Modify socketService for session validation
- [ ] Implement graceful disconnect notification

### Phase 3: Client Integration
- [ ] Update AuthHandler for session token handling
- [ ] Modify SocketHandler for session authentication
- [ ] Add heartbeat timer implementation
- [ ] Implement graceful disconnect UI
- [ ] Add forced logout handling

### Phase 4: Testing & Polish
- [ ] Write unit tests for SessionService
- [ ] Test rate limiting behavior
- [ ] Test socket forced disconnect flow
- [ ] Update API documentation
- [ ] Test edge cases (network interruption, etc.)

---

## Security Considerations

1. **Token Security**: Use UUID v4 with sufficient entropy
2. **Rate Limiting**: Prevent brute force attacks on login
3. **Session Binding**: Optionally bind sessions to IP/user-agent
4. **Audit Trail**: Log all login attempts for security analysis
5. **Secure Storage**: Client stores tokens in secure storage (not plain text)
6. **Grace Period**: 10-second grace period prevents data loss during transition

## Rollback Plan

1. Feature flag to disable single-device enforcement
2. Database migration to clear sessions
3. Admin "kill all sessions" endpoint
4. Quick disable via environment variable
