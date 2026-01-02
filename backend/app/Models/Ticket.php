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
}
