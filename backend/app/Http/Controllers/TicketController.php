<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Ticket;
use App\Models\TicketEvent;

class TicketController extends Controller
{
    public function getTickets()
    {
        $tickets = Ticket::latest()->paginate(10);
        return response()->json(['tickets' => $tickets], 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'room_id' => 'required|uuid',
            'department_id' => 'required|uuid',
            'conversation_id' => 'required|uuid',
            'category' => 'required|string|max:255',
            'status' => 'required|string|max:50',
            'priority' => 'required|string|max:50',
            'description' => 'required|string',
        ]);

        Ticket::create($validated);
        return response()->json(['message' => 'Ticket created successfully'], 201);
    }

    public function show(Ticket $ticket)
    {
        return response()->json(['ticket' => $ticket], 200);
    }

    public function update(Request $request, Ticket $ticket)
    {
        $ticket->update($request->all());
        return response()->json(['message' => 'Ticket updated successfully'], 200);
    }

    public function updateStatus(Request $request, Ticket $ticket)
    {
        $ticket->status = $request->status;
        $ticket->save();
        return response()->json(['message' => 'Ticket status updated successfully'], 200);
    }

    public function assignStaff(Request $request, Ticket $ticket)
    {
        TicketEvent::create([
            'ticket_id' => $ticket->id,
            'actor_staff_user_id' => $request->actor_staff_user_id,
            'event_type' => 'assigned',
            'note' => 'Ticket assigned to staff ID: ' . $request->actor_staff_user_id . ', ' . $request->note,
        ]);

        $ticket->update(['actor_staff_user_id' => $request->actor_staff_user_id]);
        
        return response()->json(['message' => 'Staff assigned to ticket successfully'], 200);
    }

    public function addNote(Request $request, Ticket $ticket)
    {
        TicketEvent::create([
            'ticket_id' => $ticket->id,
            'actor_staff_user_id' => $request->actor_staff_user_id,
            'event_type' => 'note',
            'note' => $request->note,
        ]);

        $ticket->update(['actor_staff_user_id' => $request->actor_staff_user_id]);

        return response()->json(['message' => 'Note added to ticket successfully'], 200);
    }

    public function escalate(Request $request, Ticket $ticket)
    {
        TicketEvent::create([
            'ticket_id' => $ticket->id,
            'actor_staff_user_id' => $request->actor_staff_user_id,
            'event_type' => 'escalated',
            'note' => 'Ticket escalated, ' . $request->note,
        ]);

        $ticket->update(['actor_staff_user_id' => $request->actor_staff_user_id]);

        return response()->json(['message' => 'Ticket escalated successfully'], 200);
    }

    public function getEvents(Ticket $ticket)
    {
        $ticketEvents = $ticket->events()->latest()->paginate(10);
        return response()->json(['events' => $ticketEvents], 200);
    }

    public function rateTicket(Request $request, Ticket $ticket)
    {
        $ticket->ratings()->updateOrCreate(
            ['ticket_id' => $ticket->id],
            [
                'stars' => $request->stars,
                'comment' => $request->comment,
            ]
        );

        return response()->json(['message' => 'Rating submitted successfully'], 200);
    }

    public function getRating(Ticket $ticket)
    {
        return response()->json(['rating' => $ticket->rating], 200);
    }
}