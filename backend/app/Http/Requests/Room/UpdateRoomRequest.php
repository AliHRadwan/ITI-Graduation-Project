<?php

namespace App\Http\Requests\Room;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRoomRequest extends FormRequest
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
            'room_number' => [
                'sometimes',
                'string',
                'max:50',
                Rule::unique('rooms', 'room_number')->ignore($this->route('id')),
            ],
            'status' => 'sometimes|string|in:available,occupied,maintenance,cleaning',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'room_number.unique' => 'This room number already exists',
            'status.in' => 'Status must be one of: available, occupied, maintenance, cleaning',
        ];
    }
}
