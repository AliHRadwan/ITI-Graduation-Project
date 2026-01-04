<?php

namespace App\Http\Requests\ProactiveRule;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProactiveRuleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'trigger_type' => 'sometimes|string|in:ticket_created,sla_breach,status_changed,scheduled',
            'trigger_config' => 'sometimes|array',
            'message_template' => 'sometimes|string',
            'is_active' => 'sometimes|boolean',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'trigger_type.in' => 'Trigger type must be one of: ticket_created, sla_breach, status_changed, scheduled',
        ];
    }
}
