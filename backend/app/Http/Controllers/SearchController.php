<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Ticket;
use App\Models\Conversation;
use App\Models\Room;
use Illuminate\Support\Facades\DB;

class SearchController extends Controller
{
    public function search(Request $request)
    {
        try {
            $q = $request->query('q');

            if (!$q) {
                return response()->json([
                    'success' => false,
                    'message' => 'Query parameter "q" is required',
                    'data' => null
                ], 400);
            }

            // Simple search across tickets/conversations/rooms
            $tickets = Ticket::where('description', 'like', "%{$q}%")
                ->orWhere('category', 'like', "%{$q}%")
                ->limit(10)
                ->get();

            $conversations = Conversation::where('status', 'like', "%{$q}%")
                ->limit(10)
                ->get();

            $rooms = Room::where('room_number', 'like', "%{$q}%")
                ->limit(10)
                ->get();

            $results = [
                'tickets' => $tickets,
                'conversations' => $conversations,
                'rooms' => $rooms,
            ];

            return response()->json([
                'success' => true,
                'message' => 'Search completed successfully',
                'data' => [
                    'results' => $results,
                    'query' => $q
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Search failed: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }
}