# Mail System & Friend System Implementation Plan

## Overview
Implement two core communication features for Textical:
1. **Mail System** - In-game messaging between players
2. **Friend System** - Player connections and social features

## Mail System

### Database Schema
Add to Prisma schema:
```prisma
model Mail {
  id          Int      @id @default(autoincrement())
  senderId    Int
  receiverId  Int
  subject     String
  content     String
  isRead      Boolean  @default(false)
  isDeleted   Boolean  @default(false)
  sentAt      DateTime @default(now())
  readAt      DateTime?
  
  sender    User @relation("MailSender", fields: [senderId], references: [id])
  receiver  User @relation("MailReceiver", fields: [receiverId], references: [id])
  
  @@index([senderId])
  @@index([receiverId])
}
```

### Server-Side Components

1. **MailController.js** - Handle API endpoints
2. **MailService.js** - Business logic for mail operations
3. **MailRepository.js** - Data access layer

### API Endpoints
```javascript
// Send mail
POST /api/mail/send
Body: { receiverId, subject, content }

// Get mail list
GET /api/mail/:userId

// Get mail details
GET /api/mail/:id

// Mark as read
POST /api/mail/:id/read

// Delete mail
POST /api/mail/:id/delete
```

### Client-Side Components

1. **MailScreen.gd** & **MailScreen.tscn** - Main mail interface
2. **MailItem.gd** & **MailItem.tscn** - Individual mail entry
3. **SendMailScreen.gd** & **SendMailScreen.tscn** - Compose mail form
4. **MailHandler.gd** - Network layer for API calls

### Features
- Send/receive mail with subject and content
- Mark messages as read
- Delete messages
- Inbox with unread count indicator
- Mail storage with timestamp tracking

## Friend System

### Database Schema
Add to Prisma schema:
```prisma
model Friend {
  id            Int      @id @default(autoincrement())
  userId        Int
  friendId      Int
  status        String   @default("PENDING") // PENDING, ACCEPTED, REJECTED
  createdAt     DateTime @default(now())
  acceptedAt    DateTime?
  
  user    User @relation("UserFriends", fields: [userId], references: [id])
  friend  User @relation("FriendUsers", fields: [friendId], references: [id])
  
  @@unique([userId, friendId])
  @@index([userId])
  @@index([friendId])
}
```

### Server-Side Components

1. **FriendController.js** - Handle API endpoints
2. **FriendService.js** - Business logic for friend operations
3. **FriendRepository.js** - Data access layer

### API Endpoints
```javascript
// Send friend request
POST /api/friends/send
Body: { friendId }

// Accept friend request
POST /api/friends/accept
Body: { friendId }

// Reject friend request
POST /api/friends/reject
Body: { friendId }

// Remove friend
POST /api/friends/remove
Body: { friendId }

// Get friends list
GET /api/friends/:userId

// Get friend requests
GET /api/friends/:userId/requests
```

### Client-Side Components

1. **FriendsScreen.gd** & **FriendsScreen.tscn** - Main friends interface
2. **FriendItem.gd** & **FriendItem.tscn** - Individual friend entry
3. **FriendRequestItem.gd** & **FriendRequestItem.tscn** - Request entry
4. **AddFriendScreen.gd** & **AddFriendScreen.tscn** - Search and add friends
5. **FriendHandler.gd** - Network layer for API calls

### Features
- Send friend requests
- Accept/Reject friend requests
- Remove friends
- View friends list with statuses
- Search for users to add
- Friend request notifications

## Integration Points

### UI Integration
1. Add mail icon to TopHUD with unread indicator
2. Add friends icon to TownScreen interface
3. Add notifications for new mail and friend requests
4. Update game_state.gd with mail and friends data

### Real-Time Features
- Socket events for real-time mail notifications
- Socket events for friend request notifications
- Online status tracking (future enhancement)

## Implementation Timeline

1. **Database Setup** - Add Prisma models and migrate database
2. **Server-Side** - Create controllers, services, and repositories
3. **API Routes** - Add endpoints to API router
4. **Client-Side** - Create UI components and network handlers
5. **UI Integration** - Add icons and notifications
6. **Testing** - Test all features and fix bugs

## Future Enhancements

### Mail System
- Attach items to mail
- System messages (from NPCs/Game)
- Mail templates for quest rewards
- Mail filtering and search

### Friend System
- Friend online status
- Friend activity feed
- Group chat
- Friend achievements display

## Technical Considerations

- Use existing authentication system
- Follow existing code patterns (controllers → services → repositories)
- Use Prisma for database operations
- Handle errors and edge cases properly
- Add proper validation for all API endpoints
## Overview
Implement two core communication features for Textical:
1. **Mail System** - In-game messaging between players
2. **Friend System** - Player connections and social features

## Mail System

### Database Schema
Add to Prisma schema:
```prisma
model Mail {
  id          Int      @id @default(autoincrement())
  senderId    Int
  receiverId  Int
  subject     String
  content     String
  isRead      Boolean  @default(false)
  isDeleted   Boolean  @default(false)
  sentAt      DateTime @default(now())
  readAt      DateTime?
  
  sender    User @relation("MailSender", fields: [senderId], references: [id])
  receiver  User @relation("MailReceiver", fields: [receiverId], references: [id])
  
  @@index([senderId])
  @@index([receiverId])
}
```

### Server-Side Components

1. **MailController.js** - Handle API endpoints
2. **MailService.js** - Business logic for mail operations
3. **MailRepository.js** - Data access layer

### API Endpoints
```javascript
// Send mail
POST /api/mail/send
Body: { receiverId, subject, content }

// Get mail list
GET /api/mail/:userId

// Get mail details
GET /api/mail/:id

// Mark as read
POST /api/mail/:id/read

// Delete mail
POST /api/mail/:id/delete
```

### Client-Side Components

1. **MailScreen.gd** & **MailScreen.tscn** - Main mail interface
2. **MailItem.gd** & **MailItem.tscn** - Individual mail entry
3. **SendMailScreen.gd** & **SendMailScreen.tscn** - Compose mail form
4. **MailHandler.gd** - Network layer for API calls

### Features
- Send/receive mail with subject and content
- Mark messages as read
- Delete messages
- Inbox with unread count indicator
- Mail storage with timestamp tracking

## Friend System

### Database Schema
Add to Prisma schema:
```prisma
model Friend {
  id            Int      @id @default(autoincrement())
  userId        Int
  friendId      Int
  status        String   @default("PENDING") // PENDING, ACCEPTED, REJECTED
  createdAt     DateTime @default(now())
  acceptedAt    DateTime?
  
  user    User @relation("UserFriends", fields: [userId], references: [id])
  friend  User @relation("FriendUsers", fields: [friendId], references: [id])
  
  @@unique([userId, friendId])
  @@index([userId])
  @@index([friendId])
}
```

### Server-Side Components

1. **FriendController.js** - Handle API endpoints
2. **FriendService.js** - Business logic for friend operations
3. **FriendRepository.js** - Data access layer

### API Endpoints
```javascript
// Send friend request
POST /api/friends/send
Body: { friendId }

// Accept friend request
POST /api/friends/accept
Body: { friendId }

// Reject friend request
POST /api/friends/reject
Body: { friendId }

// Remove friend
POST /api/friends/remove
Body: { friendId }

// Get friends list
GET /api/friends/:userId

// Get friend requests
GET /api/friends/:userId/requests
```

### Client-Side Components

1. **FriendsScreen.gd** & **FriendsScreen.tscn** - Main friends interface
2. **FriendItem.gd** & **FriendItem.tscn** - Individual friend entry
3. **FriendRequestItem.gd** & **FriendRequestItem.tscn** - Request entry
4. **AddFriendScreen.gd** & **AddFriendScreen.tscn** - Search and add friends
5. **FriendHandler.gd** - Network layer for API calls

### Features
- Send friend requests
- Accept/Reject friend requests
- Remove friends
- View friends list with statuses
- Search for users to add
- Friend request notifications

## Integration Points

### UI Integration
1. Add mail icon to TopHUD with unread indicator
2. Add friends icon to TownScreen interface
3. Add notifications for new mail and friend requests
4. Update game_state.gd with mail and friends data

### Real-Time Features
- Socket events for real-time mail notifications
- Socket events for friend request notifications
- Online status tracking (future enhancement)

## Implementation Timeline

1. **Database Setup** - Add Prisma models and migrate database
2. **Server-Side** - Create controllers, services, and repositories
3. **API Routes** - Add endpoints to API router
4. **Client-Side** - Create UI components and network handlers
5. **UI Integration** - Add icons and notifications
6. **Testing** - Test all features and fix bugs

## Future Enhancements

### Mail System
- Attach items to mail
- System messages (from NPCs/Game)
- Mail templates for quest rewards
- Mail filtering and search

### Friend System
- Friend online status
- Friend activity feed
- Group chat
- Friend achievements display

## Technical Considerations

- Use existing authentication system
- Follow existing code patterns (controllers → services → repositories)
- Use Prisma for database operations
- Handle errors and edge cases properly
- Add proper validation for all API endpoints
