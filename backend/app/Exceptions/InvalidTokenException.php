<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;

class InvalidTokenException extends Exception
{
    /**
     * Render the exception as an HTTP response.
     */
    public function render(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $this->message ?: 'Invalid or inactive token',
            'error' => 'INVALID_TOKEN',
        ], 404);
    }
}
