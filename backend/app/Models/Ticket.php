<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Ticket extends Model
{
    /** @use HasFactory<\Database\Factories\TicketFactory> */
    use HasFactory, HasUuids;

    protected $fillable = [
        "room_id",
        "department_id",
        "conversation_id",
        "category",
        "status",
        "priority",
        "description",
    ];

    public function room()
    {
        return $this->belongsTo(Room::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function conversation()
    {
        return $this->belongsTo(Conversation::class);
    }

    public function staffUser()
    {
        return $this->belongsTo(StaffUser::class, 'actor_staff_user_id');
    }

    public function notificationLogs()
    {
        return $this->hasMany(NotificationLog::class);
    }

    public function rating()
    {
        return $this->hasOne(Rating::class);
    }

    public function events()
    {
        return $this->hasMany(TicketEvent::class);
    }

    public function checkSlaFirstResponseBreaches(?SlaPolicy $policy): bool
    {
        if (!$policy || !$policy->is_active) {
            return false;
        }

        return now()->greaterThan(
            $this->created_at->addMinutes($policy->first_response_minutes)
        );
    }

    public function checkSlaResolutionBreaches(?SlaPolicy $policy): bool
    {
        // If no policy exists or it's inactive, it can't breach.
        if (!$policy || !$policy->is_active) {
            return false;
        }

        // Logic: Is "Now" > "Created At + Limit"?
        return now()->greaterThan(
            $this->created_at->addMinutes($policy->resolution_minutes)
        );
    }
}