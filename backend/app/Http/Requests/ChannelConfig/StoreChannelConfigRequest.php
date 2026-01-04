<?php

namespace App\Http\Requests\ChannelConfig;

use Illuminate\Foundation\Http\FormRequest;

class StoreChannelConfigRequest extends FormRequest
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
            'channel_type' => 'required|string|in:web,telegram,whatsapp',
            'external_account_id' => 'required|string|max:255|unique:channel_configs,external_account_id',
            'settings' => 'nullable|array',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'channel_type.required' => 'Channel type is required',
            'channel_type.in' => 'Channel type must be one of: web, telegram, whatsapp',
            'external_account_id.required' => 'External account ID is required',
            'external_account_id.unique' => 'This external account ID already exists',
        ];
    }
}
