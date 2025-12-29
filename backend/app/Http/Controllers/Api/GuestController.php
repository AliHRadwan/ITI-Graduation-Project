<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Resources\GuestIdentityResource;
use App\Http\Resources\GuestIdentityDetailResource;
use App\Models\GuestIdentity;
use Illuminate\Http\Request;

class GuestController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $q = $request->query('q');
        $channelType = $request->query('channel_type');

        $guests = GuestIdentity::query()
            ->when($channelType, fn($qr) => $qr->where('channel_type', $channelType))
            ->when($q, fn($qr) => $qr->where('channel_user_id', 'like', "%{$q}%"))
            ->orderByDesc('first_seen_at')
            ->paginate($request->integer('per_page', 20));

        $items = GuestIdentityResource::collection($guests->items())->resolve();

        return $this->paginated($guests, $items);
    }

    public function show(GuestIdentity $guestIdentity)
    {
        $guestIdentity->load([
            'conversations' => fn($q) => $q->with('room')->orderByDesc('started_at')->limit(10),
        ]);

        $data = (new GuestIdentityDetailResource($guestIdentity))->resolve();

        return $this->success($data);
    }

}
