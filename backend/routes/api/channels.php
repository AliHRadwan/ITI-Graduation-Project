<?php

use App\Http\Controllers\Api\ChannelConfigController;
use Illuminate\Support\Facades\Route;

// Temporarily removed auth:sanctum for testing
Route::get('/channels', [ChannelConfigController::class, 'index']);
Route::post('/channels', [ChannelConfigController::class, 'store']);
Route::get('/channels/{id}', [ChannelConfigController::class, 'show']);
Route::patch('/channels/{id}', [ChannelConfigController::class, 'update']);
Route::delete('/channels/{id}', [ChannelConfigController::class, 'destroy']);
