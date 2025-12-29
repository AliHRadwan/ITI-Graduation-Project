<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GuestIdentityResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'channel_type' => $this->channel_type,
            'channel_user_id' => $this->channel_user_id,
            'preferred_language' => $this->preferred_language,
            'first_seen_at' => optional($this->first_seen_at)->toISOString(),
        ];
    }
}
