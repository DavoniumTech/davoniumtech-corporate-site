# Davonium V69 backend setup and admin access

## Enquiry endpoint
Website forms call the Supabase Edge Function `submit-enquiry`. It is intentionally public (`verify_jwt=false`) and performs origin checks, method/body limits, field validation, required privacy consent, a honeypot and hashed-IP rate limiting. It stores lead, activity and notification rows using the server-side service-role client; it does not return lead data.

## Admin dashboard
Visit `/admin/`. Sign-in uses Supabase Auth and then verifies active membership in `public.admin_users`. Browser code uses only the publishable key; database RLS policies restrict access.

### Create the owner account (required before dashboard tests)
1. Supabase Authentication → Users → create a verified owner account with a strong password. Enable MFA where available.
2. Copy the UUID.
3. SQL Editor, replace the UUID and run:
```sql
insert into public.admin_users(user_id,role,is_active)
values ('YOUR-AUTH-USER-UUID','owner',true);
```
4. Sign in at `/admin/`. Only active membership is authorised.
5. Never expose service-role keys in frontend code or GitHub.

## Optional owner email
No sender is configured. To enable email, add secrets in Supabase Edge Function secrets only: `RESEND_API_KEY`, `OWNER_NOTIFICATION_EMAIL`, `RESEND_FROM_EMAIL`, optionally `RATE_LIMIT_HASH_SALT`.
## Current scope
Admin supports leads, status, follow-up notes, notifications and a basic project list. Customer conversion and milestone editing are not implemented yet. Legal notices remain drafts for legal/provider review.
