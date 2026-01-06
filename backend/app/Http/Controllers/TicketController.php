<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Ticket;
use App\Models\TicketEvent;

class TicketController extends Controller
{
    public function getTickets()
    {
        $tickets = Ticket::with('department', 'room', 'conversation', 'staffUser')
            ->latest()
            ->paginate(10);

        return response()->json(['tickets' => $tickets], 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'room_id' => 'required|uuid|exists:rooms,id',
            'department_id' => 'required|uuid|exists:departments,id',
            'conversation_id' => 'required|uuid|exists:conversations,id',
            'actor_staff_user_id' => 'sometimes|uuid|exists:staff_users,id',
            'category' => 'required|string|max:255',
            'status' => 'required|in:new,doing,done,canceled',
            'priority' => 'required|in:low,med,high,urgent',
            'description' => 'required|string|max:500',
        ]);

        $ticket = Ticket::create($validated);

        TicketEvent::create([
            'ticket_id' => $ticket->id,
            'actor_staff_user_id' => $request->user()->id ?? null,
            'event_type' => 'created',
            'note' => 'Ticket created',
        ]);

        return response()->json(['message' => 'Ticket created successfully'], 201);
    }

    public function show(Ticket $ticket)
    {
        return response()->json([
            'ticket' => $ticket->load(['department', 'room', 'conversation', 'staffUser'])
        ],200);
    }

    public function update(Request $request, Ticket $ticket)
    {
        $validated = $request->validate([
            'room_id' => 'sometimes|uuid|exists:rooms,id',
            'department_id' => 'sometimes|uuid|exists:departments,id',
            'conversation_id' => 'sometimes|uuid|exists:conversations,id',
            'actor_staff_user_id' => 'sometimes|uuid|exists:staff_users,id',
            'category' => 'sometimes|string|max:255',
            'status' => 'sometimes|in:new,doing,done,canceled',
            'priority' => 'sometimes|in:low,med,high,urgent',
            'description' => 'sometimes|string|max:500',
        ]);

        $ticket->update($validated);

        TicketEvent::create([
            'ticket_id' => $ticket->id,
            'actor_staff_user_id' => $request->user()->id ?? null,
            'event_type' => 'note',
            'note' => 'Ticket updated',
        ]);

        return response()->json(['message' => 'Ticket updated successfully'], 200);
    }

    public function updateStatus(Request $request, Ticket $ticket)
    {
        $validated = $request->validate([
            'status' => 'required|in:new,doing,done,canceled',
            'note' => 'sometimes|string|max:500',
        ]);

        $oldStatus = $ticket->status;
        $ticket->status = $validated['status'];
        $ticket->save();

        if ($oldStatus !== $ticket->status) {
            TicketEvent::create([
                'ticket_id' => $ticket->id,
                'actor_staff_user_id' => $request->user()->id ?? null,
                'event_type' => 'status_changed',
                'note' => "Status changed from $oldStatus to {$ticket->status}" . ($request->input('note') ?? ''),
            ]);
        }

        return response()->json(['message' => 'Ticket status updated successfully'], 200);
    }

    public function assignStaff(Request $request, Ticket $ticket)
    {
        $validated = $request->validate([
            'actor_staff_user_id' => 'required|uuid|exists:staff_users,id',
            'note' => 'sometimes|string|max:500',
        ]);

        $ticket->update(['actor_staff_user_id' => $validated['actor_staff_user_id']]);

        TicketEvent::create([
            'ticket_id' => $ticket->id,
            'actor_staff_user_id' => $request->user()->id ?? null,
            'event_type' => 'assigned',
            'note' => 'Ticket assigned to staff ID: ' . $validated['actor_staff_user_id'] . ', ' . ($request->input('note') ?? ''),
        ]);

        return response()->json(['message' => 'Staff assigned to ticket successfully'], 200);
    }

    public function addNote(Request $request, Ticket $ticket)
    {
        $validated = $request->validate([
            'note' => 'required|string|max:500',
        ]);

        TicketEvent::create([
            'ticket_id' => $ticket->id,
            'actor_staff_user_id' => $request->user()->id ?? null,
            'event_type' => 'note',
            'note' => $validated['note'],
        ]);

        return response()->json(['message' => 'Note added to ticket successfully'], 200);
    }

    public function escalate(Request $request, Ticket $ticket)
    {
        $request->validate([
            'note' => 'sometimes|string|max:500',
        ]);

        $ticket->update(['priority' => 'Urgent']);

        TicketEvent::create([
            'ticket_id' => $ticket->id,
            'actor_staff_user_id' => $request->user()->id ?? null,
            'event_type' => 'escalated',
            'note' => 'Ticket escalated, ' . ($request->input('note') ?? ''),
        ]);

        return response()->json(['message' => 'Ticket escalated successfully'], 200);
    }

    public function getEvents(Ticket $ticket)
    {
        $ticketEvents = $ticket->events()
            ->with('staffUser:id,name,email')
            ->latest()
            ->paginate(10);
            
        return response()->json(['events' => $ticketEvents], 200);
    }

    public function rateTicket(Request $request, Ticket $ticket)
    {
        $validated = $request->validate([
            'stars'   => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:500',
        ]);

        $rating = $ticket->rating()->updateOrCreate(
            [],
            [
                'stars'   => $validated['stars'],
                'comment' => $validated['comment'] ?? null,
            ]
        );

        TicketEvent::create([
            'ticket_id' => $ticket->id,
            'actor_staff_user_id' => $request->user()->id ?? null,
            'event_type' => 'note',
            'note' => 'Ticket rated',
        ]);

        return response()->json([
            'message' => 'Rating submitted successfully',
            'data' => $rating
        ], 200);
    }

    public function getRating(Ticket $ticket)
    {
        return response()->json(['rating' => $ticket->rating], 200);
    }
}
