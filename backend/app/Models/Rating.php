<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rating extends Model
{
    /** @use HasFactory<\Database\Factories\RatingFactory> */
    use HasFactory, HasUuids;

    protected $fillable = [
        'ticket_id',
        'stars',
        'comment',
    ];

    public function ticket()
    {
        return $this->belongsTo(Ticket::class);
    }
    
}
