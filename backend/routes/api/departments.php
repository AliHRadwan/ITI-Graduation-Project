<?php

use App\Http\Controllers\Api\DepartmentController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/departments', [DepartmentController::class, 'index']);
});

Route::middleware(['auth:sanctum', 'manager.or.admin'])->group(function () {
    Route::post('/departments', [DepartmentController::class, 'store']);
    Route::get('/departments/{id}', [DepartmentController::class, 'show']);
    Route::patch('/departments/{id}', [DepartmentController::class, 'update']);
    Route::post('/departments/{id}/deactivate', [DepartmentController::class, 'deactivate']);
    Route::delete('/departments/{id}', [DepartmentController::class, 'destroy']);
});
