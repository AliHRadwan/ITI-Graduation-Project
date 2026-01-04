<?php

namespace App\Http\Requests\ProactiveRule;

use Illuminate\Foundation\Http\FormRequest;

class StoreProactiveRuleRequest extends FormRequest
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
            'trigger_type' => 'required|string|in:ticket_created,sla_breach,status_changed,scheduled',
            'trigger_config' => 'nullable|array',
            'message_template' => 'required|string',
            'is_active' => 'nullable|boolean',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'trigger_type.required' => 'Trigger type is required',
            'trigger_type.in' => 'Trigger type must be one of: ticket_created, sla_breach, status_changed, scheduled',
            'message_template.required' => 'Message template is required',
        ];
    }
}
