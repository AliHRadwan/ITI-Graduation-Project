<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ProactiveRule>
 */
class ProactiveRuleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // 1. Pick a random trigger type first
        $type = $this->faker->randomElement([
            'ticket_created', 
            'sla_breach', 
            'status_changed', 
            'scheduled'
        ]);

        // 2. Generate config based on that type (for realism)
        $config = match ($type) {
            'ticket_created' => [
                'priority_filter' => ['high', 'critical'],
                'department_id' => null, // null = all departments
            ],
            'sla_breach' => [
                'threshold_minutes' => 60,
                'notify_manager' => true,
            ],
            'status_changed' => [
                'from' => 'open',
                'to' => 'resolved',
            ],
            'scheduled' => [
                'cron' => '0 9 * * 1', // Every Monday at 9am
                'timezone' => 'UTC',
            ],
        };

        // 3. Generate a relevant message template
        $template = match ($type) {
            'ticket_created' => "Hi {{user_name}}, we received your request ({{ticket_id}}). A dedicated agent will be with you shortly.",
            'sla_breach' => "ALERT: Ticket {{ticket_id}} has breached the SLA limit of {{limit}} minutes.",
            'status_changed' => "Good news! Your ticket {{ticket_id}} has been marked as {{status}}.",
            'scheduled' => "Reminder: Please complete your weekly report.",
        };

        return [
            'trigger_type' => $type,
            'trigger_config' => $config, // Laravel will cast this to JSON automatically if configured in Model
            'message_template' => $template,
            'is_active' => $this->faker->boolean(80), // 80% chance of being true
            'created_at' => $this->faker->dateTimeBetween('-1 month', 'now'),
            'updated_at' => $this->faker->dateTimeBetween('-1 month', 'now'),
        ];
    }
}
