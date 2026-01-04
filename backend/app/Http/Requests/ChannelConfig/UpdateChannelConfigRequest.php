<?php

namespace App\Http\Requests\ChannelConfig;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateChannelConfigRequest extends FormRequest
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
            'channel_type' => 'sometimes|string|in:web,telegram,whatsapp',
            'external_account_id' => [
                'sometimes',
                'string',
                'max:255',
                Rule::unique('channel_configs', 'external_account_id')->ignore($this->route('id')),
            ],
            'settings' => 'sometimes|array',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'channel_type.in' => 'Channel type must be one of: web, telegram, whatsapp',
            'external_account_id.unique' => 'This external account ID already exists',
        ];
    }
}
