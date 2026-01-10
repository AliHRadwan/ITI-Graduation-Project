<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConversationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $guest = $this->whenLoaded('guestIdentity') ? $this->guestIdentity : null;
        $lastMessage = $this->whenLoaded('lastMessage') ? $this->lastMessage : null;

        return [
          'id' => $this->id,
          'guest_identity_id' => $this->guest_identity_id,
          'room_id' => $this->room_id,
          'status' => $this->status ? strtoupper($this->status) : null,
          'started_at' => optional($this->started_at)->toISOString(),
          'last_seen_at' => optional($this->last_seen_at)->toISOString(),
          'created_at' => optional($this->started_at)->toISOString(),
          'updated_at' => optional($this->last_seen_at)->toISOString(),
          'guest' => $guest ? (new GuestIdentityResource($guest))->resolve() : null,
          'participant' => $guest ? [
              'id' => $guest->id,
              'name' => $guest->channel_user_id,
              'email' => null,
          ] : null,
          'last_message' => $lastMessage ? [
              'id' => $lastMessage->id,
              'body' => $lastMessage->content,
              'created_at' => optional($lastMessage->created_at)->toISOString(),
          ] : null,
          'unread_count' => 0,
          'room' => $this->whenLoaded('room') ? [
              'id' => $this->room->id,
              'room_number' => $this->room->room_number,
              'status' => $this->room->status,
          ] : null,
        ];

    }
}
