<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class StaffUser extends Model
{
    //
     use HasFactory, Notifiable, HasApiTokens, SoftDeletes;

    protected $table = 'staff_users';

    protected $fillable = [
        'name',
        'email',
        'password',
        'is_active',
        'invite_token',
        'invite_token_expires_at',
    ];

    protected $hidden = [
        'password',
    ];

    // memberships (هتتفهم بعدين)
    public function memberships()
    {
        return $this->hasMany(StaffMembership::class);
    }
    public function departments()
    {
        return $this->belongsToMany(
            Department::class,
            'staff_memberships'
        )->withPivot('staff_role_id');
    }
    public function roles()
    {
        return $this->belongsToMany(
            StaffRole::class,      // جدول الأدوار
            'staff_memberships',   // جدول الربط
            'staff_user_id',       // FK للمستخدم
            'staff_role_id'        // FK للدور
        );
    }

    /**
     * Check if user has a specific role
     */
    public function hasRole(string $roleName): bool
    {
        return $this->roles()->where('name', $roleName)->exists();
    }

    /**
     * Check if user is Admin
     */
    public function isAdmin(): bool
    {
        return $this->hasRole('Admin');
    }

    /**
     * Check if user is Manager or Admin
     */
    public function isManagerOrAdmin(): bool
    {
        return $this->hasRole('Admin') || $this->hasRole('Manager');
    }

    /**
     * Get user's role names as array
     */
    public function getRoleNames(): array
    {
        return $this->roles()->pluck('name')->toArray();
    }
}
