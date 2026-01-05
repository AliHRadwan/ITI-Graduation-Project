<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class StaffMembership extends Model
{
    use HasFactory, HasUuids;
    
        protected $fillable = [
        'staff_user_id',
        'department_id',
        'staff_role_id',
    ];

    public function staffUser()
    {
        return $this->belongsTo(StaffUser::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class, 'department_id', 'id');
    }

    public function role()
    {
        return $this->belongsTo(StaffRole::class, 'staff_role_id');
    }
}
