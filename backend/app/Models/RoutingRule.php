<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class RoutingRule extends Model
{
    /** @use HasFactory<\Database\Factories\RoutingRuleFactory> */
    use HasFactory, HasUuids;

    protected $fillable = [
        'department_id',
        'match_category',
        'priority_default',
        'is_active',
    ];

    public function department()
    {
        return $this->belongsTo(Department::class);
    }
}
