# n8n Workflow Update Guide - QR Code & Room Integration

## 🎯 Overview

This guide explains how to update your n8n Telegram workflow to handle QR code scanning and room linking.

---

## 📱 Workflow Flow

```
1. Guest scans QR code in Room 305
   ↓
2. Telegram opens: https://t.me/YourBot?start={token}
   ↓
3. n8n receives: /start {token}
   ↓
4. n8n resolves token → room_id
   ↓
5. n8n upserts conversation WITH room_id
   ↓
6. Conversation is now linked to Room 305 ✅
   ↓
7. All future tickets inherit room_id automatically
```

---

## 🔧 Required Changes

### **1. Add QR Token Resolution Node**

**Position:** Right after "Telegram Trigger" node

**Node Name:** `Resolve QR Token`

**Type:** `HTTP Request`

**Settings:**
```json
{
  "method": "GET",
  "url": "=http://35.157.152.174/api/qr/resolve/{{ $json.text.split(' ')[1] }}",
  "responseFormat": "json",
  "options": {
    "ignore404": true
  }
}
```

**When to Execute:** 
- Add a condition: Only if message starts with `/start` AND has a token

**Condition Node Settings:**
```json
{
  "conditions": {
    "string": [
      {
        "value1": "={{ $json.text }}",
        "operation": "startsWith",
        "value2": "/start"
      },
      {
        "value1": "={{ $json.text.split(' ').length }}",
        "operation": "equal",
        "value2": 2
      }
    ]
  }
}
```

---

### **2. Update "Store Channel Event" Node**

**Current Payload:**
```json
{
  "channel_type": "telegram",
  "channel_user_id": "{{$json.channel_user_id}}",
  "chat_id": "{{$json.chat_id}}",
  "preferred_language": "{{$json.language_code}}",
  "user_metadata": {
    "username": "{{$json.username}}",
    "first_name": "{{$json.first_name}}",
    "last_name": "{{$json.last_name}}"
  }
}
```

**NEW Payload (add room_id if available):**
```json
{
  "channel_type": "telegram",
  "channel_user_id": "{{$json.channel_user_id}}",
  "chat_id": "{{$json.chat_id}}",
  "room_id": "={{$node['Resolve QR Token'].json.success ? $node['Resolve QR Token'].json.data.room_id : null}}",
  "preferred_language": "{{$json.language_code}}",
  "user_metadata": {
    "username": "{{$json.username}}",
    "first_name": "{{$json.first_name}}",
    "last_name": "{{$json.last_name}}"
  }
}
```

---

### **3. Update "Get Context" Node**

**No changes needed!** The context API already returns room_id:

```json
{
  "conversation_id": "...",
  "room": {
    "id": "...",
    "room_number": "305"
  }
}
```

---

### **4. Update "Create Ticket" Nodes**

**All 3 ticket creation nodes need this change:**
- ✅ Emergency ticket
- ✅ Service request ticket
- ✅ Handoff ticket (if it creates a ticket)

**Current Payload:**
```json
{
  "conversation_id": "{{$node['Store Channel Event'].json.conversation_id}}",
  "category": "maintenance",
  "priority": "urgent",
  "description": "...",
  "source": "telegram"
}
```

**NEW Payload (add room_id from context):**
```json
{
  "conversation_id": "{{$node['Store Channel Event'].json.conversation_id}}",
  "room_id": "={{$node['Get Context'].json.room?.id}}",
  "category": "maintenance",
  "priority": "urgent",
  "description": "...",
  "source": "telegram"
}
```

**Note:** The `?` makes it optional - if room doesn't exist in context, backend will get it from conversation

---

### **5. Add "QR Welcome Message" Node**

**Position:** After successful QR token resolution

**Node Name:** `Send QR Welcome`

**Type:** `Telegram Send Message`

**Settings:**
```json
{
  "chatId": "={{$node['Normalize Telegram'].json.chat_id}}",
  "text": "=Welcome to Room {{$node['Resolve QR Token'].json.data.room_number}}! 🏨\n\nI'm your AI Hotel Concierge. How can I help you today?\n\n• Request room service\n• Report maintenance issues\n• Ask about hotel amenities\n• Get local recommendations",
  "parse_mode": "Markdown"
}
```

---

### **6. Add "No QR Code" Error Handler**

**Position:** If QR token resolution fails

**Node Name:** `No Room Error`

**Type:** `Telegram Send Message`

**Settings:**
```json
{
  "chatId": "={{$node['Normalize Telegram'].json.chat_id}}",
  "text": "⚠️ I couldn't find your room information.\n\nPlease scan the QR code located in your room to link your conversation.\n\nYou can find the QR code:\n• On your room's welcome card\n• On the door\n• On the nightstand",
  "parse_mode": "Markdown"
}
```

---

## 🔄 Complete Workflow Structure

```
Telegram Trigger
  ↓
Normalize Telegram
  ↓
[Check if /start command] → IF Node
  ↓                          ↓
  YES                        NO
  ↓                          ↓
Resolve QR Token          Store Channel Event
  ↓                          ↓
[Token Valid?] → IF        Get Context
  ↓             ↓            ↓
  YES           NO           Classify Intent
  ↓             ↓            ↓
Store Channel Event      No Room Error     [Switch on intent]
(with room_id)                              ↓
  ↓                                    Create Ticket
Send QR Welcome                        (with room_id from context)
```

---

## 🧪 Testing Steps

### **Test 1: QR Code Scan**
1. Send: `/start abc123token456`
2. Expected: 
   - ✅ "Welcome to Room 305!" message
   - ✅ Conversation linked to room

### **Test 2: Invalid Token**
1. Send: `/start invalid_token`
2. Expected: 
   - ⚠️ "Please scan QR code" error message

### **Test 3: Ticket Creation**
1. After QR scan, send: "AC not working"
2. Expected:
   - ✅ Ticket created with room_id = "Room 305"
   - ✅ Department auto-assigned (Maintenance)
   - ✅ Staff auto-assigned (Round-robin)

### **Test 4: Without QR Scan**
1. Send message without scanning QR first
2. Try to create ticket
3. Expected:
   - ❌ Error: "Guest must scan QR code first"

---

## 🚀 Deployment Checklist

- [ ] Update API URLs to: `http://35.157.152.174/api/...`
- [ ] Add "Resolve QR Token" node
- [ ] Update "Store Channel Event" with room_id
- [ ] Update all 3 "Create Ticket" nodes with room_id
- [ ] Add "QR Welcome" message
- [ ] Add "No Room Error" message
- [ ] Test QR code scanning flow
- [ ] Test ticket creation with room
- [ ] Test error handling without QR scan

---

## 📞 Support

If you encounter issues:

1. **Check n8n execution logs** - Look for which node failed
2. **Test API directly** - Use curl/Postman to verify backend
3. **Check room_id** - Verify it's being passed correctly

**Backend API is ready! ✅** All endpoints support room_id validation.

---

**Last Updated:** January 7, 2026  
**Backend URL:** http://35.157.152.174  
**Status:** Ready for n8n Integration 🎉



