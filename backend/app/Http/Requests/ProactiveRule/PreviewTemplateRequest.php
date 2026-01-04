<?php

namespace App\Http\Requests\ProactiveRule;

use Illuminate\Foundation\Http\FormRequest;

class PreviewTemplateRequest extends FormRequest
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
            'message_template' => 'required|string',
            'variables' => 'nullable|array',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'message_template.required' => 'Message template is required',
        ];
    }
}
