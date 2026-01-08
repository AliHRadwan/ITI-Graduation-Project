# QR Code Telegram Deep Link Implementation

## ✅ Changes Completed

### 1. Created Telegram Configuration
**File:** `backend/config/telegram.php`
- Added configuration for Telegram bot username and token
- Reads from environment variables

### 2. Updated QR Token Service
**File:** `backend/app/Services/QrTokenService.php`
- **Line 31 changed from:**
  ```php
  'deep_link' => config('app.url') . '/api/qr/resolve/' . $token,
  ```
- **To:**
  ```php
  'deep_link' => 'https://t.me/' . config('telegram.bot_username') . '?start=' . $token,
  ```

### 3. Created Setup Documentation
**File:** `backend/TELEGRAM_QR_SETUP.md`
- Complete setup instructions
- Testing guide
- Troubleshooting tips

---

## 🔧 Required Manual Steps

### You Need to Add to `backend/.env`:

```env
TELEGRAM_BOT_USERNAME=YourActualBotUsername
TELEGRAM_BOT_TOKEN=your_bot_token_here
```

**Important:**
- Replace `YourActualBotUsername` with your bot's username (no @ symbol)
- Get token from @BotFather on Telegram

---

## 🚀 Deployment Steps

### On Your Local Machine:
1. Add the environment variables to `backend/.env`
2. Clear config cache:
   ```bash
   cd backend
   php artisan config:cache
   ```

### Tell Your Friend (Who Manages Deployment):
1. Add `TELEGRAM_BOT_USERNAME` to production `.env`
2. Add `TELEGRAM_BOT_TOKEN` to production `.env`
3. Run on server:
   ```bash
   php artisan config:cache
   ```
4. Restart the backend service

---

## 🧪 How to Test

### 1. Generate a QR Token:
```bash
curl -X POST http://3.79.18.186/api/qr/rooms/{roomId}/tokens \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"expires_at": "2026-12-31 23:59:59"}'
```

### 2. Check the Response:
```json
{
  "success": true,
  "data": {
    "deep_link": "https://t.me/YourBotUsername?start=abc123token456"
  }
}
```

### 3. Scan the QR Code:
- Should open Telegram
- Should open your bot
- Should send `/start abc123token456`
- Your n8n workflow should receive it

---

## 📊 Complete Flow

```
1. Admin generates QR code for Room 305
   ↓
2. QR code contains: https://t.me/HotelBot?start=token123
   ↓
3. Guest scans QR with phone
   ↓
4. Telegram opens with bot
   ↓
5. Telegram sends: /start token123
   ↓
6. n8n "Check for QR Start Command" detects it (TRUE branch)
   ↓
7. n8n "Resolve QR Token" extracts: token123
   ↓
8. n8n "Link Guest to Room" calls:
   POST /api/integrations/conversations/upsert
   { "qr_token": "token123", ... }
   ↓
9. Backend resolves token → Room 305
   ↓
10. Conversation linked to Room 305
   ↓
11. Guest receives welcome message
   ↓
12. All future tickets include room_id automatically ✅
```

---

## ⚠️ Don't Forget

After adding to `.env`, you MUST run:
```bash
php artisan config:cache
```

Otherwise Laravel won't see the new config values!

---

## 🎯 Next Steps

1. ✅ Code changes complete
2. ⏳ Add to `.env` (manual step)
3. ⏳ Clear config cache
4. ⏳ Deploy to production
5. ⏳ Test QR code generation
6. ⏳ Test scanning flow

Good luck! 🚀

