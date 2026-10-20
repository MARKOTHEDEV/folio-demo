# Folio — simple invoicing (demo app)

An API-heavy demo for TestBrick: sign up with an emailed 6-digit code, then
every call carries a Bearer token. Clients and invoices live in one signed
cookie — no database, nothing to clean up, every visitor gets their own.

API: `POST /api/auth/start` → `POST /api/auth/verify` (returns `token`) →
`/api/clients`, `/api/invoices` (`?q=` search), `/api/invoices/:id`
(PATCH tax), `/items`, `/send`, `/pay`.

Set `RESEND_API_KEY`, `FOLIO_EMAIL_FROM`, `FOLIO_SECRET` (see `.env.example`).
Invoice emails only go to `@inbox.testbrick.com` addresses.
`FOLIO_BREAK=totals|pay|search` breaks one thing on purpose, for honest reds.

## Passwords and reset

Sign-up sets a password (plus the emailed code to confirm the address). Sign in with it at `/signin`,
or ask for a code at `/signin/code`. **Forgot password?** (`/forgot`) emails a link to `/reset?token=…`
that works for 30 minutes; the reset page takes the new password. Like the books, the account lives in
a signed cookie: no database, every visitor (and every test run) has their own.
