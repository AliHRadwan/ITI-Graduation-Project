<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

use Illuminate\Validation\ValidationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Throwable;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        //
    })
    ->withExceptions(function (Exceptions $exceptions) {

        // 1) Validation errors (422)
        $exceptions->render(function (ValidationException $e, $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'code' => 422,
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $e->errors(),
                ], 422);
            }
        });

        // 2) Model not found (404) - Route model binding / findOrFail
        $exceptions->render(function (ModelNotFoundException $e, $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'code' => 404,
                    'status' => 'error',
                    'message' => 'Resource not found',
                ], 404);
            }
        });

        // 3) Endpoint not found (404)
        $exceptions->render(function (NotFoundHttpException $e, $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'code' => 404,
                    'status' => 'error',
                    'message' => 'Endpoint not found',
                ], 404);
            }
        });

        // 4) Any HttpException (401/403/405...)
        $exceptions->render(function (HttpExceptionInterface $e, $request) {
            if ($request->expectsJson()) {
                $code = $e->getStatusCode();

                return response()->json([
                    'code' => $code,
                    'status' => 'error',
                    'message' => $e->getMessage() ?: 'HTTP error',
                ], $code);
            }
        });

        // 5) Fallback (500) لأي خطأ غير متوقع
        $exceptions->render(function (Throwable $e, $request) {
            if ($request->expectsJson()) {
                $isDebug = (bool) config('app.debug');

                return response()->json([
                    'code' => 500,
                    'status' => 'error',
                    'message' => $isDebug ? $e->getMessage() : 'Server error',
                ], 500);
            }
        });

    })
    ->create();
