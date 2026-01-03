<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\Api\StaffUserController;
use App\Http\Controllers\Api\StaffRoleController;
use App\Http\Controllers\Api\StaffMembershipController;
use App\Http\Controllers\Api\LoginController;


Route::post('/auth/login', [LoginController::class, 'login'])->middleware('throttle:10,1');
Route::post('/auth/forgot-password', [LoginController::class, 'forgotPassword'])->middleware('throttle:10,1');
Route::post('/auth/reset-password', [LoginController::class, 'resetPassword'])->middleware('throttle:10,1');
Route::post('/auth/invite/accept', [LoginController::class, 'acceptInvite'])->middleware('throttle:10,1');
Route::post('/auth/invite', [LoginController::class, 'invite'])->middleware('admin')->middleware('throttle:10,1');

Route::middleware('auth:sanctum')->group(function () :void {
    Route::post('/auth/logout', [LoginController::class, 'logout']);
    Route::get('/auth/me', [LoginController::class, 'me']);
    Route::post('/auth/invite', [LoginController::class, 'invite'])->middleware('admin');
});
Route::prefix('staff/users')->middleware('auth:sanctum')->group(function () {
    Route::get('/', [StaffUserController::class, 'index'])->middleware('manager.or.admin');
    Route::post('/', [StaffUserController::class, 'store'])->middleware('admin');
    Route::get('{id}', [StaffUserController::class, 'show'])->middleware('manager.or.admin');
    Route::patch('{id}', [StaffUserController::class, 'update'])->middleware('manager.or.admin');
    Route::post('{id}/deactivate', [StaffUserController::class, 'deactivate'])->middleware('admin');
    Route::post('{id}/activate', [StaffUserController::class, 'activate'])->middleware('admin');
    Route::delete('{id}', [StaffUserController::class, 'destroy'])->middleware('admin'); // Soft delete
    Route::post('{id}/restore', [StaffUserController::class, 'restore'])->middleware('admin'); // Restore soft deleted
    Route::delete('{id}/force', [StaffUserController::class, 'forceDelete'])->middleware('admin'); // Permanent delete
});

Route::prefix('staff/roles')->middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/', [StaffRoleController::class, 'index']);
    Route::post('/', [StaffRoleController::class, 'store']);     // optional
    Route::patch('{id}', [StaffRoleController::class, 'update']); // optional
    Route::delete('{id}', [StaffRoleController::class, 'destroy']); // optional
});

Route::prefix('staff/memberships')->middleware(['auth:sanctum', 'manager.or.admin'])->group(function () {

    Route::get('/', [StaffMembershipController::class, 'index']);
    Route::post('/', [StaffMembershipController::class, 'store']);
    Route::patch('{id}', [StaffMembershipController::class, 'update']);
    Route::delete('{id}', [StaffMembershipController::class, 'destroy']);
});
