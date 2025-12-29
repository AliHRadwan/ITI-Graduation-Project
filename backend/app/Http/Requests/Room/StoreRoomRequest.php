<?php

namespace App\Http\Requests\Room;

use Illuminate\Foundation\Http\FormRequest;

class StoreRoomRequest extends FormRequest
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
            'room_number' => 'required|string|max:50|unique:rooms,room_number',
            'status' => 'nullable|string|in:available,occupied,maintenance,cleaning',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'room_number.required' => 'Room number is required',
            'room_number.unique' => 'This room number already exists',
            'status.in' => 'Status must be one of: available, occupied, maintenance, cleaning',
        ];
    }
}
