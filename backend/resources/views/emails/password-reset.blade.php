@component('mail::message')
# Password Reset Request

Hello,

You are receiving this email because we received a password reset request for your account.

<!-- **Reset Token:** {{ $token }} -->

**Email:** {{ $email }}

You can reset your password by clicking the button below or by using the token above in the reset password form.

@component('mail::button', ['url' => $resetUrl])
Reset Password
@endcomponent

If you did not request a password reset, no further action is required.

This password reset link will expire in 60 minutes.

Thanks,<br>
{{ config('app.name') }}
@endcomponent


