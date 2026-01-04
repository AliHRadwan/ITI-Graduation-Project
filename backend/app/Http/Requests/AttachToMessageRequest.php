<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AttachToMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => 'required|in:image,audio,video,file',
            'storage_url' => 'required|string',
            'mime_type' => 'nullable|string',
            'size_bytes' => 'required|integer|min:0',
            'transcript' => 'nullable|string',
        ];
    }
}
