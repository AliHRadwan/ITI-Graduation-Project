<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class SlaPolicy extends Model
{
    /** @use HasFactory<\Database\Factories\SlaPolicyFactory> */
    use HasFactory, HasUuids;

    protected $fillable = [
        "department_id",
        "first_response_minutes",
        "resolution_minutes",
        "quiet_hours",
        "is_active",
    ];

    public function department()
    {
        return $this->belongsTo(Department::class);
    }
}
