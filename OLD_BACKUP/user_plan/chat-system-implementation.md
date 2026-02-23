# Chat System Implementation Plan

## Overview
The chat system will enable real-time communication between players in Textical. It will feature:
- Global chat channel for all players
- Guild chat channel for guild members only
- Private messaging between players
- Chat history and notification system
- Typing indicators

## Implementation Steps

### Step 1: Create Chat Model
Add chat-related model to Prisma schema:

```prisma
// server/prisma/schema.prisma
model ChatMessage {
  id          Int      @id @default(autoincrement())
  channelType String   @default("GLOBAL") // GLOBAL, GUILD, PRIVATE
  channelId   Int?
  userId      Int
  user        User     @relation(fields: [userId], references: [id])
  message     String
  timestamp   DateTime @default(now())
  isDeleted   Boolean  @default(false)
}
```

### Step 2: Create Chat Service
```javascript
// server/src/services/chatService.js
class ChatService {
    async sendMessage(channelType, channelId, userId, message) {
        // Validate message content
        // Save message to database
        // Emit message to connected clients
    }
    
    async getMessages(channelType, channelId, limit = 50, offset = 0) {
        // Get chat history for a specific channel
    }
    
    async deleteMessage(messageId, userId) {
        // Check permissions
        // Mark message as deleted
    }
    
    async getOnlineUsers() {
        // Get list of currently online users
    }
}

module.exports = new ChatService();
```

### Step 3: Create Chat Controller
```javascript
// server/src/controllers/ChatController.js
class ChatController extends BaseController {
    async sendMessage(req, res) {
        // Handle sending a message
    }
    
    async getMessages(req, res) {
        // Handle getting chat history
    }
    
    async deleteMessage(req, res) {
        // Handle deleting a message
    }
    
    async getOnlineUsers(req, res) {
        // Handle getting online users
    }
}
```

### Step 4: Create Chat Handler (Client)
```gdscript
# client/src/network/ChatHandler.gd
extends BaseNetworkHandler
class_name ChatHandler

func send_message(channel_type: String, channel_id: int, user_id: int, message: String):
	_request("/chat/send", HTTPClient.METHOD_POST, {
		"channelType": channel_type,
		"channelId": channel_id,
		"userId": user_id,
		"message": message
	})

func get_messages(channel_type: String, channel_id: int, limit: int = 50, offset: int = 0):
	var params = "?channelType=" + channel_type + "&limit=" + str(limit)
	if channel_id > 0:
		params += "&channelId=" + str(channel_id)
	if offset > 0:
		params += "&offset=" + str(offset)
	
	_request("/chat/messages" + params, HTTPClient.METHOD_GET)

func delete_message(user_id: int, message_id: int):
	_request("/chat/delete", HTTPClient.METHOD_POST, {
		"userId": user_id,
		"messageId": message_id
	})

func get_online_users():
	_request("/chat/online-users", HTTPClient.METHOD_GET)
```

### Step 5: Implement Real-Time Communication with Socket.io
```javascript
// server/src/services/socketService.js
io.on('connection', (socket) => {
    // Existing socket handlers...
    
    // Join global chat
    socket.join('global-chat');
    
    // Join guild chat (if user is in a guild)
    socket.on('chat:join-guild', (guildId) => {
        socket.join(`guild-chat:${guildId}`);
    });
    
    // Leave guild chat (when leaving guild)
    socket.on('chat:leave-guild', (guildId) => {
        socket.leave(`guild-chat:${guildId}`);
    });
    
    // Join private chat with another user
    socket.on('chat:join-private', (otherUserId) => {
        const roomId = [socket.userId, otherUserId].sort().join('-');
        socket.join(`private-chat:${roomId}`);
    });
    
    // Send message
    socket.on('chat:send', async (data) => {
        const { channelType, channelId, message } = data;
        
        // Save message to database
        const chatMessage = await chatRepository.create({
            channelType,
            channelId,
            userId: socket.userId,
            message
        });
        
        // Emit message to appropriate channel
        let targetChannel;
        switch (channelType) {
            case 'GLOBAL':
                targetChannel = 'global-chat';
                break;
            case 'GUILD':
                targetChannel = `guild-chat:${channelId}`;
                break;
            case 'PRIVATE':
                const otherUserId = data.otherUserId;
                const roomId = [socket.userId, otherUserId].sort().join('-');
                targetChannel = `private-chat:${roomId}`;
                break;
            default:
                console.error('Invalid channel type:', channelType);
                return;
        }
        
        io.to(targetChannel).emit('chat:message', chatMessage);
    });
    
    // Typing indicator
    socket.on('chat:typing', (data) => {
        const { channelType, channelId } = data;
        
        let targetChannel;
        switch (channelType) {
            case 'GLOBAL':
                targetChannel = 'global-chat';
                break;
            case 'GUILD':
                targetChannel = `guild-chat:${channelId}`;
                break;
            case 'PRIVATE':
                const otherUserId = data.otherUserId;
                const roomId = [socket.userId, otherUserId].sort().join('-');
                targetChannel = `private-chat:${roomId}`;
                break;
            default:
                console.error('Invalid channel type:', channelType);
                return;
        }
        
        io.to(targetChannel).emit('chat:typing', {
            userId: socket.userId,
            isTyping: data.isTyping
        });
    });
});
```

### Step 6: Create Chat UI
1. **Chat Window**: Main chat interface with multiple tabs
2. **Global Chat Tab**: Shows all global messages
3. **Guild Chat Tab**: Shows guild messages (only visible if in a guild)
4. **Private Chat Tabs**: Individual tabs for each private conversation
5. **Message Input**: Text field for typing messages
6. **Notification System**: Shows unread message indicators
7. **User List**: Displays online users in each channel

### Step 7: Implement Chat Features
```gdscript
# client/src/ui/ChatWindow.gd
extends Control

func _on_message_received(message: Dictionary):
	# Display message in appropriate channel
	var channel = get_channel_tab(message.channelType, message.channelId)
	channel.add_message(message)

func _on_typing_received(data: Dictionary):
	# Show typing indicator
	var channel = get_channel_tab(data.channelType, data.channelId)
	channel.set_typing(data.userId, data.isTyping)

func _on_send_button_pressed():
	var text = $MessageInput.text.strip_edges()
	if text.is_empty():
		return
	
	var currentTab = $TabContainer.current_tab
	var channelType = get_channel_type(currentTab)
	var channelId = get_channel_id(currentTab)
	
	ChatHandler.send_message(channelType, channelId, GameState.current_user.id, text)
	$MessageInput.text = ""
```

### Step 8: Add Chat Filtering
```javascript
// server/src/services/chatService.js
validateMessage(message) {
    // Remove profanity
    // Limit message length
    // Check for spam
    // Return validated message
}

async checkSpam(userId, message) {
    // Check message frequency
    // Check for repeated messages
    // Return spam score
}
```

### Step 9: Implement Chat History
```javascript
// server/src/services/chatService.js
async getMessages(channelType, channelId, limit = 50, offset = 0) {
    let query = chatRepository
        .findMany({
            where: {
                channelType,
                isDeleted: false
            },
            orderBy: {
                timestamp: 'desc'
            },
            take: limit,
            skip: offset,
            include: {
                user: true
            }
        });
    
    if (channelType === 'GUILD') {
        query.where.channelId = channelId;
    } else if (channelType === 'PRIVATE') {
        // For private messages, we need to filter by both users
        query.where.channelId = channelId;
    }
    
    const messages = await query;
    
    // Reverse to show oldest first
    return messages.reverse();
}
```

### Step 10: Test and Balance
1. Test all chat functionality
2. Test spam filtering
3. Test typing indicators
4. Performance testing for large chat rooms
5. Test notifications

---

The chat system will provide a robust real-time communication platform for players to interact with each other in Textical. The implementation plan focuses on creating a user-friendly interface with all the essential features of a modern chat system.

## Overview
The chat system will enable real-time communication between players in Textical. It will feature:
- Global chat channel for all players
- Guild chat channel for guild members only
- Private messaging between players
- Chat history and notification system
- Typing indicators

## Implementation Steps

### Step 1: Create Chat Model
Add chat-related model to Prisma schema:

```prisma
// server/prisma/schema.prisma
model ChatMessage {
  id          Int      @id @default(autoincrement())
  channelType String   @default("GLOBAL") // GLOBAL, GUILD, PRIVATE
  channelId   Int?
  userId      Int
  user        User     @relation(fields: [userId], references: [id])
  message     String
  timestamp   DateTime @default(now())
  isDeleted   Boolean  @default(false)
}
```

### Step 2: Create Chat Service
```javascript
// server/src/services/chatService.js
class ChatService {
    async sendMessage(channelType, channelId, userId, message) {
        // Validate message content
        // Save message to database
        // Emit message to connected clients
    }
    
    async getMessages(channelType, channelId, limit = 50, offset = 0) {
        // Get chat history for a specific channel
    }
    
    async deleteMessage(messageId, userId) {
        // Check permissions
        // Mark message as deleted
    }
    
    async getOnlineUsers() {
        // Get list of currently online users
    }
}

module.exports = new ChatService();
```

### Step 3: Create Chat Controller
```javascript
// server/src/controllers/ChatController.js
class ChatController extends BaseController {
    async sendMessage(req, res) {
        // Handle sending a message
    }
    
    async getMessages(req, res) {
        // Handle getting chat history
    }
    
    async deleteMessage(req, res) {
        // Handle deleting a message
    }
    
    async getOnlineUsers(req, res) {
        // Handle getting online users
    }
}
```

### Step 4: Create Chat Handler (Client)
```gdscript
# client/src/network/ChatHandler.gd
extends BaseNetworkHandler
class_name ChatHandler

func send_message(channel_type: String, channel_id: int, user_id: int, message: String):
	_request("/chat/send", HTTPClient.METHOD_POST, {
		"channelType": channel_type,
		"channelId": channel_id,
		"userId": user_id,
		"message": message
	})

func get_messages(channel_type: String, channel_id: int, limit: int = 50, offset: int = 0):
	var params = "?channelType=" + channel_type + "&limit=" + str(limit)
	if channel_id > 0:
		params += "&channelId=" + str(channel_id)
	if offset > 0:
		params += "&offset=" + str(offset)
	
	_request("/chat/messages" + params, HTTPClient.METHOD_GET)

func delete_message(user_id: int, message_id: int):
	_request("/chat/delete", HTTPClient.METHOD_POST, {
		"userId": user_id,
		"messageId": message_id
	})

func get_online_users():
	_request("/chat/online-users", HTTPClient.METHOD_GET)
```

### Step 5: Implement Real-Time Communication with Socket.io
```javascript
// server/src/services/socketService.js
io.on('connection', (socket) => {
    // Existing socket handlers...
    
    // Join global chat
    socket.join('global-chat');
    
    // Join guild chat (if user is in a guild)
    socket.on('chat:join-guild', (guildId) => {
        socket.join(`guild-chat:${guildId}`);
    });
    
    // Leave guild chat (when leaving guild)
    socket.on('chat:leave-guild', (guildId) => {
        socket.leave(`guild-chat:${guildId}`);
    });
    
    // Join private chat with another user
    socket.on('chat:join-private', (otherUserId) => {
        const roomId = [socket.userId, otherUserId].sort().join('-');
        socket.join(`private-chat:${roomId}`);
    });
    
    // Send message
    socket.on('chat:send', async (data) => {
        const { channelType, channelId, message } = data;
        
        // Save message to database
        const chatMessage = await chatRepository.create({
            channelType,
            channelId,
            userId: socket.userId,
            message
        });
        
        // Emit message to appropriate channel
        let targetChannel;
        switch (channelType) {
            case 'GLOBAL':
                targetChannel = 'global-chat';
                break;
            case 'GUILD':
                targetChannel = `guild-chat:${channelId}`;
                break;
            case 'PRIVATE':
                const otherUserId = data.otherUserId;
                const roomId = [socket.userId, otherUserId].sort().join('-');
                targetChannel = `private-chat:${roomId}`;
                break;
            default:
                console.error('Invalid channel type:', channelType);
                return;
        }
        
        io.to(targetChannel).emit('chat:message', chatMessage);
    });
    
    // Typing indicator
    socket.on('chat:typing', (data) => {
        const { channelType, channelId } = data;
        
        let targetChannel;
        switch (channelType) {
            case 'GLOBAL':
                targetChannel = 'global-chat';
                break;
            case 'GUILD':
                targetChannel = `guild-chat:${channelId}`;
                break;
            case 'PRIVATE':
                const otherUserId = data.otherUserId;
                const roomId = [socket.userId, otherUserId].sort().join('-');
                targetChannel = `private-chat:${roomId}`;
                break;
            default:
                console.error('Invalid channel type:', channelType);
                return;
        }
        
        io.to(targetChannel).emit('chat:typing', {
            userId: socket.userId,
            isTyping: data.isTyping
        });
    });
});
```

### Step 6: Create Chat UI
1. **Chat Window**: Main chat interface with multiple tabs
2. **Global Chat Tab**: Shows all global messages
3. **Guild Chat Tab**: Shows guild messages (only visible if in a guild)
4. **Private Chat Tabs**: Individual tabs for each private conversation
5. **Message Input**: Text field for typing messages
6. **Notification System**: Shows unread message indicators
7. **User List**: Displays online users in each channel

### Step 7: Implement Chat Features
```gdscript
# client/src/ui/ChatWindow.gd
extends Control

func _on_message_received(message: Dictionary):
	# Display message in appropriate channel
	var channel = get_channel_tab(message.channelType, message.channelId)
	channel.add_message(message)

func _on_typing_received(data: Dictionary):
	# Show typing indicator
	var channel = get_channel_tab(data.channelType, data.channelId)
	channel.set_typing(data.userId, data.isTyping)

func _on_send_button_pressed():
	var text = $MessageInput.text.strip_edges()
	if text.is_empty():
		return
	
	var currentTab = $TabContainer.current_tab
	var channelType = get_channel_type(currentTab)
	var channelId = get_channel_id(currentTab)
	
	ChatHandler.send_message(channelType, channelId, GameState.current_user.id, text)
	$MessageInput.text = ""
```

### Step 8: Add Chat Filtering
```javascript
// server/src/services/chatService.js
validateMessage(message) {
    // Remove profanity
    // Limit message length
    // Check for spam
    // Return validated message
}

async checkSpam(userId, message) {
    // Check message frequency
    // Check for repeated messages
    // Return spam score
}
```

### Step 9: Implement Chat History
```javascript
// server/src/services/chatService.js
async getMessages(channelType, channelId, limit = 50, offset = 0) {
    let query = chatRepository
        .findMany({
            where: {
                channelType,
                isDeleted: false
            },
            orderBy: {
                timestamp: 'desc'
            },
            take: limit,
            skip: offset,
            include: {
                user: true
            }
        });
    
    if (channelType === 'GUILD') {
        query.where.channelId = channelId;
    } else if (channelType === 'PRIVATE') {
        // For private messages, we need to filter by both users
        query.where.channelId = channelId;
    }
    
    const messages = await query;
    
    // Reverse to show oldest first
    return messages.reverse();
}
```

### Step 10: Test and Balance
1. Test all chat functionality
2. Test spam filtering
3. Test typing indicators
4. Performance testing for large chat rooms
5. Test notifications

---

The chat system will provide a robust real-time communication platform for players to interact with each other in Textical. The implementation plan focuses on creating a user-friendly interface with all the essential features of a modern chat system.

