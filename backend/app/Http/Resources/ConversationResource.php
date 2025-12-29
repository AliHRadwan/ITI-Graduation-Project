<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConversationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
          'id' => $this->id,
          'guest_identity_id' => $this->guest_identity_id,
          'room_id' => $this->room_id,
          'status' => $this->status,
          'started_at' => optional($this->started_at)->toISOString(),
          'last_seen_at' => optional($this->last_seen_at)->toISOString(),
          'guest' => $this->whenLoaded('guestIdentity')
              ? (new GuestIdentityResource($this->guestIdentity))->resolve()
              : null,
          'room' => $this->whenLoaded('room') ? [
              'id' => $this->room->id,
              'room_number' => $this->room->room_number,
              'status' => $this->room->status,
          ] : null,
        ];

    }
}
