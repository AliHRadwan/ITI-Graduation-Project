<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ChannelConfig\StoreChannelConfigRequest;
use App\Http\Requests\ChannelConfig\UpdateChannelConfigRequest;
use App\Http\Resources\ChannelConfigResource;
use App\Models\ChannelConfig;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ChannelConfigController extends Controller
{
    /**
     * Display a listing of channel configurations.
     * GET /channels
     */
    public function index(): AnonymousResourceCollection
    {
        $channels = ChannelConfig::orderBy('channel_type')->get();

        return ChannelConfigResource::collection($channels);
    }

    /**
     * Store a newly created channel configuration.
     * POST /channels
     */
    public function store(StoreChannelConfigRequest $request): JsonResponse
    {
        $channel = ChannelConfig::create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Channel configuration created successfully',
            'data' => new ChannelConfigResource($channel),
        ], 201);
    }

    /**
     * Display the specified channel configuration.
     * GET /channels/{id}
     */
    public function show(string $id): ChannelConfigResource
    {
        $channel = ChannelConfig::findOrFail($id);

        return new ChannelConfigResource($channel);
    }

    /**
     * Update the specified channel configuration.
     * PATCH /channels/{id}
     */
    public function update(UpdateChannelConfigRequest $request, string $id): JsonResponse
    {
        $channel = ChannelConfig::findOrFail($id);
        $channel->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Channel configuration updated successfully',
            'data' => new ChannelConfigResource($channel->fresh()),
        ]);
    }

    /**
     * Remove the specified channel configuration.
     * DELETE /channels/{id}
     */
    public function destroy(string $id): JsonResponse
    {
        $channel = ChannelConfig::findOrFail($id);
        $channel->delete();

        return response()->json([
            'success' => true,
            'message' => 'Channel configuration deleted successfully',
        ]);
    }
}
