@component('mail::message')
# You've been invited!

Hello {{ $name }},

You have been invited to join our team. Please accept this invitation by clicking the button below or by using the invitation token.

<!-- **Invitation Token:** {{ $token }} -->

**Email:** {{ $email }}

@component('mail::button', ['url' => $acceptUrl])
Accept Invitation
@endcomponent

After accepting the invitation, you will be able to set your password and access your account.

This invitation will expire in 1 day.

If you did not expect this invitation, you can safely ignore this email.

Thanks,<br>
{{ config('app.name') }}
@endcomponent


