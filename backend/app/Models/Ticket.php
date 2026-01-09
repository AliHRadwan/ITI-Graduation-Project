<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Support\Facades\Http;

class Ticket extends Model
{
    /** @use HasFactory<\Database\Factories\TicketFactory> */
    use HasFactory, HasUuids;

    protected $fillable = [
        "room_id",
        "department_id",
        "conversation_id",
        "actor_staff_user_id",
        "category",
        "status",
        "priority",
        "description",
    ];

    protected static function booted()
    {
        static::updated(function ($ticket) {
            if ($ticket->wasChanged('status')) {
                $ticket->notifyStatusChange();
            }
        });
    }

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

    public function notifyStatusChange()
    {
        $webhookUrl = config('services.n8n.ticket_webhook_url');
        
        if (!$webhookUrl) {
            return;
        }

        $payload = [
            'ticket_id' => $this->id,
            'conversation_id' => $this->conversation_id,
            'status' => $this->status,
            'old_status' => $this->getOriginal('status'),
            'priority' => $this->priority,
            'category' => $this->category,
            'room_number' => $this->room?->room_number,
            'assigned_staff_name' => $this->staffUser?->name,
            'updated_by' => auth()->user()?->name ?? 'system',
        ];

        try {
            Http::timeout(5)->post($webhookUrl, $payload);
        } catch (\Exception $e) {
            \Log::warning('Failed to send ticket notification webhook', [
                'ticket_id' => $this->id,
                'error' => $e->getMessage()
            ]);
        }
    }
}