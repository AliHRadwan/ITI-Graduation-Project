<?php

use App\Http\Controllers\Api\RoomController;
use Illuminate\Support\Facades\Route;

// Temporarily removed auth:sanctum for testing
Route::get('/rooms', [RoomController::class, 'index']);
Route::post('/rooms', [RoomController::class, 'store']);
Route::get('/rooms/{id}', [RoomController::class, 'show']);
Route::patch('/rooms/{id}', [RoomController::class, 'update']);
Route::delete('/rooms/{id}', [RoomController::class, 'destroy']);
