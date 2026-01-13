<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Gate;
use App\Models\Ticket;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::define('ticket.addNote', function ($user, Ticket $ticket) {
            if (!$user) {
                return false;
            }

            if ($user->hasRole('ReadOnly')) {
                return false;
            }

            if ($user->isManagerOrAdmin()) {
                return true;
            }

            $assignmentUsed = !is_null($ticket->actor_staff_user_id);
            if ($assignmentUsed) {
                return $ticket->actor_staff_user_id === $user->id;
            }

            return $ticket->department_id
                ? $user->memberships()->where('department_id', $ticket->department_id)->exists()
                : false;
        });

        Gate::define('ticket.updateStatus', function ($user, Ticket $ticket) {
            if (!$user) {
                return false;
            }

            if ($user->hasRole('ReadOnly')) {
                return false;
            }

            if ($user->isManagerOrAdmin()) {
                return true;
            }

            $assignmentUsed = !is_null($ticket->actor_staff_user_id);
            if ($assignmentUsed) {
                return $ticket->actor_staff_user_id === $user->id;
            }

            return $ticket->department_id
                ? $user->memberships()->where('department_id', $ticket->department_id)->exists()
                : false;
        });
    }
}
