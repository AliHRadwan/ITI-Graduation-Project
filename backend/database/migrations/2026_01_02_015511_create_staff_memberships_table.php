<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('staff_memberships', function (Blueprint $table) {
            $table->id();
            $table->foreignId('staff_user_id')->constrained('staff_users')->cascadeOnDelete();
            $table->uuid('department_id');
            $table->foreign('department_id')->references('id')->on('departments')->cascadeOnDelete();
            $table->foreignId('staff_role_id')->constrained('staff_roles');
            $table->timestamps();
            $table->unique(['staff_user_id', 'department_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('staff_memberships');
    }
};
