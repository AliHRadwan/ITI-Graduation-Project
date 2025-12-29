<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\GuestIdentity;
use App\Models\Message;
use App\Models\Room;

class Conversation extends Model
{
    use HasUuids;

    protected $table = 'conversations';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'guest_identity_id',
        'room_id',
        'status',
        'started_at',
        'last_seen_at',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'last_seen_at' => 'datetime',
    ];

    public function guestIdentity(): BelongsTo
    {
        return $this->belongsTo(GuestIdentity::class, 'guest_identity_id');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class, 'conversation_id');
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class, 'room_id');
    }
}
