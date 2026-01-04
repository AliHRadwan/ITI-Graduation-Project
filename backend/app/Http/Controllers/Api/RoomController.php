<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Room\StoreRoomRequest;
use App\Http\Requests\Room\UpdateRoomRequest;
use App\Http\Resources\RoomResource;
use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class RoomController extends Controller
{
    /**
     * Display a listing of rooms.
     * GET /rooms
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Room::query();

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $rooms = $query->orderBy('room_number')->get();

        return RoomResource::collection($rooms);
    }

    /**
     * Store a newly created room.
     * POST /rooms
     */
    public function store(StoreRoomRequest $request): JsonResponse
    {
        $room = Room::create([
            'room_number' => $request->validated('room_number'),
            'status' => $request->validated('status', 'available'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Room created successfully',
            'data' => new RoomResource($room),
        ], 201);
    }

    /**
     * Display the specified room.
     * GET /rooms/{id}
     */
    public function show(string $id): RoomResource
    {
        $room = Room::findOrFail($id);

        return new RoomResource($room);
    }

    /**
     * Update the specified room.
     * PATCH /rooms/{id}
     */
    public function update(UpdateRoomRequest $request, string $id): JsonResponse
    {
        $room = Room::findOrFail($id);
        $room->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Room updated successfully',
            'data' => new RoomResource($room->fresh()),
        ]);
    }

    /**
     * Remove the specified room.
     * DELETE /rooms/{id}
     */
    public function destroy(string $id): JsonResponse
    {
        $room = Room::findOrFail($id);
        $room->delete();

        return response()->json([
            'success' => true,
            'message' => 'Room deleted successfully',
        ]);
    }
}
