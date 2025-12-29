<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; 
    }

    public function rules(): array
    {
        return [
            'role' => 'sometimes|in:guest,agent,staff,system',
            'content' => 'required|string',
            'extracted_entities' => 'nullable|array',
        ];
    }
}
