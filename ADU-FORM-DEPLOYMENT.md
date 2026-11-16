# ADU form deployment

The new endpoint is independent of the existing five landing forms.

1. Install `public/api/submit-adu.php` as `/api/submit-adu.php` on the PHP website. Requires PHP 7.4+ with cURL and writable system temp storage.
2. Set `ZAP_WEBHOOK_ADU` to the ADU webhook supplied by the owner, and `ADU_FORM_SECRET` to a random secret of at least 32 characters. Alternatively install the private `adu-form-config.php` one directory above `public_html`, never inside it. Set private file permissions to 0600.
3. Verify CORS, validation, signature expiry, replay rejection, honeypot, and request limits before enabling the public form. No test leads should be sent without permission.
4. Build the GitHub demo with `PUBLIC_ADU_LEADS_ENABLED=true` only once the backend is installed and verified. Localhost remains a simulation even with this flag. Default builds stay in preview mode.
5. Successful real submissions redirect to `https://theabcpro.com/thank-you/`. Errors keep the form visible and offer the phone number.

Payload matches the existing proxy: first_name, last_name, name, phone, email, zip, message, areas, landing_key, landing_title, submission_date_time, submission_date_iso, full_url, client_ip, user_agent. Adds project_type for ADU. Dates use America/Los_Angeles.

Security: webhook kept server-side outside the repository, allowed origins, signed short-lived IP-bound token, one-use token checks, hidden honeypot, minimum completion time, server-side field validation, bounded body size, hourly request limits with file locking, TLS verification, and generic upstream errors. These reduce spam; a public form cannot be made invisible to all bots.

Status: source prepared. Activation blocked because the saved SSH login is rejected. GitHub Pages alone cannot run the PHP endpoint.
