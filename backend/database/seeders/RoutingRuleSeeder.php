<?php

namespace Database\Seeders;

use App\Models\RoutingRule;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RoutingRuleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        RoutingRule::factory()->count(10)->create();
    }
}
