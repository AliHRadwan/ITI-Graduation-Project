<?php

use App\Http\Controllers\Api\RoomController;
use Illuminate\Support\Facades\Route;

// add auth:sanctum
Route::middleware(['auth:sanctum'])->group(function () {
Route::get('/rooms', [RoomController::class, 'index']);
Route::post('/rooms', [RoomController::class, 'store'])->middleware('manager.or.admin');
Route::get('/rooms/{id}', [RoomController::class, 'show']);
Route::patch('/rooms/{id}', [RoomController::class, 'update'])->middleware('manager.or.admin');
Route::delete('/rooms/{id}', [RoomController::class, 'destroy'])->middleware('manager.or.admin');
});