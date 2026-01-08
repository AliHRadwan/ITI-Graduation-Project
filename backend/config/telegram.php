<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Telegram Bot Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for Telegram bot integration used for QR code deep links
    | and bot communication.
    |
    */

    'bot_username' => env('TELEGRAM_BOT_USERNAME'),
    
    'bot_token' => env('TELEGRAM_BOT_TOKEN', ''),

];

