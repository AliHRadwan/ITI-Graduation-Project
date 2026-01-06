# n8n Integration Guide - Hotel AI Concierge

## ✅ Backend Setup Complete!

All integration endpoints are now live and ready for n8n.

---

## 📍 Available Endpoints

### Base URL
```
http://localhost:8001/api/integrations
```

### Authentication
All requests need this header:
```
Authorization: Bearer test-token-123
```

---

## 🔗 Endpoint 1: Upsert Guest + Conversation

**Purpose**: Register/update guest and get their active conversation

**URL**: `POST /api/integrations/conversations/upsert`

**Request Body**:
```json
{
  "channel_type": "telegram",
  "channel_user_id": "{{ $json.channel_user_id }}",
  "chat_id": "{{ $json.chat_id }}",
  "preferred_language": "{{ $json.language }}",
  "user_metadata": {
    "username": "{{ $json.user.username }}",
    "first_name": "{{ $json.user.first_name }}",
    "last_name": "{{ $json.user.last_name }}"
  }
}
```

**Response**:
```json
{
  "guest_identity_id": "uuid",
  "conversation_id": "uuid",
  "room_id": "uuid-or-null",
  "room_number": "305",
  "status": "open",
  "is_handoff": false
}
```

---

## 🔗 Endpoint 2: Get Conversation Context

**Purpose**: Fetch recent messages, room info, and open tickets for LLM

**URL**: `GET /api/integrations/conversations/{conversation_id}/context?limit=5&include_tickets=true`

**Response**:
```json
{
  "conversation_id": "uuid",
  "room": {
    "room_number": "305",
    "floor": 3,
    "room_type": "Deluxe"
  },
  "recent_messages": [
    {
      "role": "guest",
      "content": "Hello",
      "created_at": "2026-01-06T10:25:00Z"
    }
  ],
  "open_tickets": [...],
  "open_tickets_count": 1
}
```

---

## 🔗 Endpoint 3: Log Message

**Purpose**: Store guest or assistant messages

**URL**: `POST /api/integrations/conversations/{conversation_id}/messages`

**Request Body**:
```json
{
  "role": "guest",
  "content": "I need extra towels",
  "extracted_entities": {
    "item": "towels",
    "quantity": 2
  }
}
```

**Response**:
```json
{
  "message_id": "uuid",
  "created_at": "2026-01-06T10:30:00Z"
}
```

---

## 🔗 Endpoint 4: Create Ticket

**Purpose**: Create service request, complaint, or emergency ticket

**URL**: `POST /api/integrations/tickets`

**Request Body**:
```json
{
  "conversation_id": "uuid",
  "room_id": "uuid",
  "category": "housekeeping",
  "priority": "medium",
  "description": "Guest needs extra towels",
  "source": "ai_agent",
  "is_emergency": false
}
```

**Valid Categories**: `housekeeping`, `food_and_drinks`, `maintenance`, `room_service`, `other`

**Valid Priorities**: `low`, `medium`, `high`, `urgent`

**Response**:
```json
{
  "ticket_id": "uuid",
  "status": "open",
  "notification_sent": false
}
```

---

## 🔗 Endpoint 5: Handoff Conversation

**Purpose**: Mark conversation for human staff intervention

**URL**: `POST /api/integrations/conversations/{conversation_id}/handoff`

**Request Body**:
```json
{
  "reason": "Guest requested human assistance",
  "priority": "high"
}
```

**Response**:
```json
{
  "conversation_id": "uuid",
  "status": "handoff",
  "handoff_requested": true
}
```

---

## 🔗 Endpoint 6: Get Chat ID

**Purpose**: Get Telegram chat_id for proactive notifications

**URL**: `GET /api/integrations/conversations/{conversation_id}/chat-id`

**Response**:
```json
{
  "chat_id": "123456789",
  "channel_type": "telegram"
}
```

---

## 🎯 n8n Node Configuration

### Node: "Store Channel Event" (Upsert Conversation)

1. **Method**: POST
2. **URL**: `http://localhost:8001/api/integrations/conversations/upsert`
3. **Authentication**: None (we're using manual headers)
4. **Send Headers**: ON
5. **Header Parameters**:
   - Name: `Content-Type`, Value: `application/json`
   - Name: `Authorization`, Value: `Bearer test-token-123`
6. **Send Body**: ON
7. **Body Content Type**: JSON
8. **JSON Body**: (see Request Body above)

---

## ✅ Testing

Run this in PowerShell to test:

```powershell
$body = @{
    channel_type='telegram'
    channel_user_id='test123'
    chat_id='test123'
    preferred_language='en'
    user_metadata=@{
        username='testuser'
        first_name='Test'
        last_name='User'
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri 'http://localhost:8001/api/integrations/conversations/upsert' `
    -Method Post `
    -Headers @{
        'Content-Type'='application/json'
        'Authorization'='Bearer test-token-123'
    } `
    -Body $body
```

---

## 🚀 Next Steps

1. ✅ Backend endpoints created
2. ✅ Database migrated
3. ✅ Test script verified
4. 🔄 **NOW**: Test in n8n by clicking "Execute node"
5. ⏭️ **NEXT**: Configure remaining n8n nodes

---

## 📝 Notes

- Conversation status values: `open`, `handoff`, `closed`
- Ticket status values: `new`, `doing`, `done`, `canceled`
- All IDs are UUIDs
- Timestamps are ISO 8601 format
- The `metadata` column stores chat_id and user_metadata as JSON

---

## 🔒 Security (TODO)

For production:
1. Create proper Sanctum API token
2. Add rate limiting
3. Add IP whitelist for n8n server
4. Use HTTPS
5. Add request validation middleware

---

Generated: 2026-01-06

