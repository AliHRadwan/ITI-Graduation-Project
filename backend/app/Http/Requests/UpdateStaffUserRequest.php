<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class UpdateStaffUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization handled by middleware
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $userId = $this->route('id'); // Get user ID from route parameter

        return [
            'name' => [
                'sometimes',
                'string',
                'min:2',
                'max:100',
                'regex:/^[\p{L}\s\-\'\.]+$/u', // Allows letters, spaces, hyphens, apostrophes, and dots
            ],
            'email' => [
                'sometimes',
                'email', // Strict email validation
                'max:255',
                'unique:staff_users,email,' . $userId,
            ],
            'password' => [
                'sometimes',
                'string',
                'min:8',
                'max:128',
                Password::min(8)
                    ->letters()      // Must contain at least one letter
                    ->mixedCase()    // Must contain at least one uppercase and one lowercase letter
                    ->numbers()      // Must contain at least one number
                    ->symbols(),     // Must contain at least one symbol
            ],
            'is_active' => [
                'sometimes',
                'boolean',
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.min' => 'The name must be at least 2 characters.',
            'name.max' => 'The name may not be greater than 100 characters.',
            'name.regex' => 'The name may only contain letters, spaces, hyphens, apostrophes, and dots.',
            
            'email.email' => 'The email must be a valid email address.',
            'email.max' => 'The email may not be greater than 255 characters.',
            'email.unique' => 'The email has already been taken.',
            
            'password.min' => 'The password must be at least 8 characters.',
            'password.max' => 'The password may not be greater than 128 characters.',
        ];
    }
}
