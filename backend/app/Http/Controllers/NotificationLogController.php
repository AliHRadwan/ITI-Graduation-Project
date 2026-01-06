<?php

namespace App\Http\Controllers;

use App\Models\NotificationLog;
use Illuminate\Http\Request;

class NotificationLogController extends Controller
{
    public function createLog(Request $request)
    {
        $validated = $request->validate([
            'ticket_id' => 'nullable|uuid|exists:tickets,id',
            'conversation_id' => 'required|uuid|exists:conversations,id',
            'channel_type' => 'required|in:web,telegram,whatsapp',
            'message_type' => 'required|in:confirm,eta,delay,status,rating',
            'payload' => 'required|string|max:64000',
            'sent_at' => 'nullable|date',
            'status' => 'required|in:sent,failed,pending',
        ]);

        NotificationLog::create($validated);
        return response()->json(['message' => 'Notification log created successfully'], 201);
    }

    public function getLogs(Request $request)
    {

        $logs = NotificationLog::query()
            ->when($request->conversation_id, function ($query, $value) {
                $query->where('conversation_id', $value);
            })
            ->when($request->ticket_id, function ($query, $value) {
                $query->where('ticket_id', $value);
            })
            ->when($request->status, function ($query, $value) {
                $query->where('status', $value);
            })
            ->latest()
            ->paginate(10);

        return response()->json(['data' => $logs], 200);
    }

    public function markFailed(NotificationLog $notificationLog)
    {
        $notificationLog->update(['status' => 'failed']);
        return response()->json(['message' => 'Notification log marked as failed'], 200);
    }

    public function markSent(NotificationLog $notificationLog)
    {
        $notificationLog->update([
            'status' => 'sent',
            'sent_at' => $notificationLog->sent_at ?? now(),
        ]);
        
        return response()->json(['message' => 'Notification log marked as sent'], 200);
    }
}
