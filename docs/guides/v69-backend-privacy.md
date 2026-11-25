# Davonium Technologies — Website Backend & Privacy

This backend stores contact enquiries submitted through the website. The website requests consent to its privacy notice before sending a message. Essential local storage is used to remember the visitor's cookie choice. Analytics and marketing options are currently off and no tracking scripts are enabled.

## Enquiries
Public requests are accepted only through the submit-enquiry Edge Function. Server-side validation, a honeypot, bounded fields, IP-derived rate limits and origin checks are used. Email notification is optional and only works after the owner configures a verified provider and sender secrets. The function never returns stored lead data.

## Admin
No admin user has been created yet. Owner must create the first account through Supabase Auth and then insert that user's UUID into public.admin_users with role owner. Do not open admin membership to the public.

## Required secrets for optional email
Set in Supabase Edge Functions secrets (never commit them):
- RESEND_API_KEY
- OWNER_NOTIFICATION_EMAIL
- RESEND_FROM_EMAIL (verified sender/domain)
Optional RATE_LIMIT_HASH_SALT is a random secret to strengthen IP hashing.
