<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AttachmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'message_id' => $this->message_id,
            'type' => $this->type,
            'storage_url' => $this->storage_url,
            'mime_type' => $this->mime_type,
            'size_bytes' => $this->size_bytes,
            'transcript' => $this->transcript,
        ];
    }
}
