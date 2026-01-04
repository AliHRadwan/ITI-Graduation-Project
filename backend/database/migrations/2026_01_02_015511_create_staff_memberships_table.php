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
            $table->uuid('id')->primary();
            $table->uuid('staff_user_id');
            $table->uuid('department_id');
            $table->uuid('staff_role_id');
            $table->timestamps();
            $table->unique(['staff_user_id', 'department_id']);

            $table->foreign('staff_user_id')->references('id')->on('staff_users')->cascadeOnDelete();
            $table->foreign('department_id')->references('id')->on('departments')->cascadeOnDelete();
            $table->foreign('staff_role_id')->references('id')->on('staff_roles');
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
