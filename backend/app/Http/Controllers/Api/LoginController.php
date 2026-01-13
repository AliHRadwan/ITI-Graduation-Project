<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Requests\LoginFormRequest;
use App\Models\StaffUser;
use App\Models\StaffMembership;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Illuminate\Support\Facades\Mail;
use App\Mail\PasswordResetMail; 
use App\Mail\StaffInviteMail; 
class LoginController extends Controller
{
    /* =========================
        Helpers
    ========================= */

    private function membershipsPayload(StaffUser $user)
    {
        return $user->memberships()
            ->with(['department:id,name', 'role:id,name'])
            ->get()
            ->map(fn ($m) => [
                'department' => $m->department->name ?? null,
                'role'       => $m->role->name ?? null,
            ]);
    }

    private function invalidCredentials()
    {
        return response()->json([
            'message' => 'Invalid credentials.'
        ], 401);
    }

    /* =========================
        Auth
    ========================= */

    public function login(LoginFormRequest $request)
    {
        $user = StaffUser::where('email', $request->email)->first();

        if (
            !$user ||
            !$user->is_active ||
            !Hash::check($request->password, $user->password)
        ) {
            return $this->invalidCredentials();
        }

        $token = $user->createToken('staff-token')->plainTextToken;

        return response()->json([
            'user' => [
                'id'          => $user->id,
                'name'        => $user->name,
                'email'       => $user->email,
                'memberships' => $this->membershipsPayload($user),
            ],
            'token' => $token
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Logged out successfully.'
        ]);
    }

    public function me(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'user' => [
                'id'          => $user->id,
                'name'        => $user->name,
                'email'       => $user->email,
                'memberships' => $this->membershipsPayload($user),
            ]
        ]);
    }

    /* =========================
        Password Reset
    ========================= */

    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = StaffUser::where('email', $request->email)->first();

        if ($user) {
            $token = Str::random(64);

            DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $user->email],
                [
                    'token'      => Hash::make($token),
                    'created_at' => now(),
                ]
            );

            // TODO: send email with $token
            Mail::to($user->email)->send(new PasswordResetMail($token, $user->email));
        }

        // response موحد عشان مفيش enumeration
        return response()->json([
            'message' => 'If the email exists, a reset link has been sent.'
        ]);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email'    => 'required|email|exists:staff_users,email',
            'token'    => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $record = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$record) {
            return response()->json([
                'message' => 'Invalid or expired reset token.'
            ], 400);
        }

        if (Carbon::parse($record->created_at)->diffInMinutes(now()) > 60) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();

            return response()->json([
                'message' => 'Reset token has expired.'
            ], 400);
        }

        if (!Hash::check($request->token, $record->token)) {
            return response()->json([
                'message' => 'Invalid or expired reset token.'
            ], 400);
        }

        StaffUser::where('email', $request->email)
            ->update(['password' => Hash::make($request->password)]);

        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json([
            'message' => 'Password reset successfully.'
        ]);
    }

    /* =========================
        Invitation
    ========================= */

    public function invite(Request $request)
    {
        // المفروض middleware admin موجود
        $request->validate([
            'name'          => 'required|string',
            'email'         => 'required|email|unique:staff_users,email',
            'role_id'       => 'required|exists:staff_roles,id',
            'department_id' => 'required|uuid|exists:departments,id',
        ]);

        $inviteToken = Str::random(64);

        DB::beginTransaction();
        try {
            $user = StaffUser::create([
                'name'                    => $request->name,
                'email'                   => $request->email,
                'password'                => Hash::make(Str::random(32)),
                'is_active'               => false,
                'invite_token'            => Hash::make($inviteToken),
                'invite_token_expires_at' => now()->addDays(1),
            ]);

            // Create membership with role and department
            StaffMembership::create([
                'staff_user_id'  => $user->id,
                'staff_role_id'  => $request->role_id,
                'department_id'  => $request->department_id,
            ]);

            DB::commit();

            // Send invite email
            Mail::to($request->email)->send(new StaffInviteMail($inviteToken, $request->email, $request->name));

            return response()->json([
                'message' => 'Invitation created successfully.',
                'user_id' => $user->id,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to create invitation.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function acceptInvite(Request $request)
    {
        $request->validate([
            'email'    => 'required|email|exists:staff_users,email',
            'token'    => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = StaffUser::where('email', $request->email)->first();

        if (
            !$user ||
            !$user->invite_token ||
            ($user->invite_token_expires_at && now()->isAfter($user->invite_token_expires_at)) ||
            !Hash::check($request->token, $user->invite_token)
        ) {
            return response()->json([
                'message' => 'Invalid or expired invitation token.'
            ], 400);
        }

        $user->update([
            'password'                => Hash::make($request->password),
            'is_active'               => true,
            'invite_token'            => null,
            'invite_token_expires_at' => null,
        ]);

        $token = $user->createToken('staff-token')->plainTextToken;

        return response()->json([
            'message' => 'Invitation accepted successfully.',
            'token'   => $token
        ]);
    }
}
