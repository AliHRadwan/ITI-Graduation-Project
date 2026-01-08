# Telegram Configuration for QR Code Deep Links

This document explains how to configure Telegram bot integration for QR code deep links.

## Setup Instructions

### 1. Add to `.env` File

Add these environment variables to your `backend/.env` file:

```env
TELEGRAM_BOT_USERNAME=YourBotUsername
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
```

**Important:**
- Replace `YourBotUsername` with your actual Telegram bot username (without the `@` symbol)
- Example: `TELEGRAM_BOT_USERNAME=HotelConciergeBot`
- Get your bot token from [@BotFather](https://t.me/botfather) on Telegram

### 2. How It Works

When a QR code is generated for a room, it now creates a Telegram deep link:

**Old Format (Wrong):**
```
http://localhost/api/qr/resolve/abc123token456
```

**New Format (Correct):**
```
https://t.me/HotelConciergeBot?start=abc123token456
```

### 3. Guest Flow

1. Guest scans QR code in their hotel room
2. QR code opens Telegram with deep link
3. Telegram opens the bot and sends `/start abc123token456`
4. n8n workflow receives the message
5. Workflow extracts token and calls backend API
6. Backend links conversation to room
7. Guest can now chat with bot about their room

### 4. Files Modified

- `backend/app/Services/QrTokenService.php` - Updated deep link generation
- `backend/config/telegram.php` - New config file for Telegram settings

### 5. Testing

After deployment, generate a new QR token and verify the deep link format:

```bash
curl -X POST http://your-backend-url/api/qr/rooms/{roomId}/tokens \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"expires_at": "2026-12-31 23:59:59"}'
```

Check the response `deep_link` field - it should start with `https://t.me/`.

## Troubleshooting

**Issue:** QR code still shows old format
- **Solution:** Clear Laravel config cache: `php artisan config:cache`

**Issue:** Deep link shows `null` in bot username
- **Solution:** Make sure `TELEGRAM_BOT_USERNAME` is set in `.env`

**Issue:** Bot doesn't respond to `/start` command
- **Solution:** Check n8n workflow "Check for QR Start Command" IF node is configured correctly

