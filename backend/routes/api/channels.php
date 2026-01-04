<?php

use App\Http\Controllers\Api\ChannelConfigController;
use Illuminate\Support\Facades\Route;

// add auth:sanctum
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/channels', [ChannelConfigController::class, 'index']);
    Route::post('/channels', [ChannelConfigController::class, 'store'])->middleware('manager.or.admin');
    Route::get('/channels/{id}', [ChannelConfigController::class, 'show']);
    Route::patch('/channels/{id}', [ChannelConfigController::class, 'update'])->middleware('manager.or.admin');
    Route::delete('/channels/{id}', [ChannelConfigController::class, 'destroy'])->middleware('manager.or.admin');
});
