<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TicketEvent extends Model
{
    /** @use HasFactory<\Database\Factories\TicketEventFactory> */
    use HasFactory, HasUuids;

    protected $fillable = [
        "ticket_id",
        "actor_staff_user_id",
        "event_type",
        "note",
    ];

    public function ticket()
    {
        return $this->belongsTo(Ticket::class, 'ticket_id');
    }

    public function staffUser()
    {
        return $this->belongsTo(StaffUser::class, 'actor_staff_user_id');
    }
}
