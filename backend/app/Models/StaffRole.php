<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class StaffRole extends Model
{
    //
    use HasFactory;

    protected $fillable = ['name'];

    public function memberships()
    {
        return $this->hasMany(StaffMembership::class);
    }
}
