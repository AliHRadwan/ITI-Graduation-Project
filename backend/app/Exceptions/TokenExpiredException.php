<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;

class TokenExpiredException extends Exception
{
    /**
     * Render the exception as an HTTP response.
     */
    public function render(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $this->message ?: 'Token has expired',
            'error' => 'TOKEN_EXPIRED',
        ], 410);
    }
}
