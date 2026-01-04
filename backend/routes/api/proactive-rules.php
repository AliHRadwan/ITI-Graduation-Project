<?php

use App\Http\Controllers\Api\ProactiveRuleController;
use Illuminate\Support\Facades\Route;

// add auth:sanctum
Route::middleware('auth:sanctum')->group(function () {  
Route::get('/proactive-rules', [ProactiveRuleController::class, 'index']);
Route::post('/proactive-rules', [ProactiveRuleController::class, 'store']);
Route::post('/proactive-rules/preview', [ProactiveRuleController::class, 'preview']);
Route::get('/proactive-rules/{id}', [ProactiveRuleController::class, 'show']);
Route::patch('/proactive-rules/{id}', [ProactiveRuleController::class, 'update']);
Route::post('/proactive-rules/{id}/deactivate', [ProactiveRuleController::class, 'deactivate']);
Route::delete('/proactive-rules/{id}', [ProactiveRuleController::class, 'destroy']);
});