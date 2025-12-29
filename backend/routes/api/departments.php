<?php

use App\Http\Controllers\Api\DepartmentController;
use Illuminate\Support\Facades\Route;

// Temporarily removed auth:sanctum for testing
Route::get('/departments', [DepartmentController::class, 'index']);
Route::post('/departments', [DepartmentController::class, 'store']);
Route::get('/departments/{id}', [DepartmentController::class, 'show']);
Route::patch('/departments/{id}', [DepartmentController::class, 'update']);
Route::post('/departments/{id}/deactivate', [DepartmentController::class, 'deactivate']);
Route::delete('/departments/{id}', [DepartmentController::class, 'destroy']);
