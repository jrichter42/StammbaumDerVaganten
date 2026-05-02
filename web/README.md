# Stammbaum Web App

Plain PHP web application for shared hosting.

## Requirements

- PHP 8.0 or newer.
- Apache-compatible `.htaccess` support for direct access protection.
- Write permissions for `data/` and `var/` once editing is enabled.

No Composer install, database, build step, or host-level config is required.

## Local Run

```powershell
php -S 127.0.0.1:8080 -t web
```

Open `http://127.0.0.1:8080/`.

## Shared Hosting Deploy

Upload the contents of this `web/` directory to the hosting package's document
root. Keep the included `.htaccess` files.

The application reads its display name, display timezone, and warning visibility from
`config/app.json`, object data from `data/`, and private runtime state from
`var/`. Timestamps stored in data files should stay in UTC; the configured
timezone is for frontend display.

## Auth

Login uses passkeys only. Users and passkey public keys are stored in
`var/auth/users.json`; setup tokens, login challenges, and audit logs stay below
`var/auth/`. These files must not be web-readable. The included `.htaccess`
blocks direct access on Apache-compatible hosts.

On the first run with an empty `var/auth/users.json`, the app creates one admin
account and writes its one-time setup path and setup code to
`var/auth/bootstrap_setup.txt`. Open that path on the deployed site or enter the
setup code on the sign-in screen. The token is single-use.

For production, set a stable passkey relying-party configuration in
`config/app.json` if automatic host detection is not exact:

```json
{
  "auth": {
    "rp_id": "stammbaumdervaganten.de",
    "origin": "https://stammbaumdervaganten.de"
  }
}
```

Passkeys require HTTPS except on local development origins such as `localhost`.

## Data Object Folders

Each object class defined in `docs/data_model.md` has one direct collection
folder below `data/`. Every JSON file in those collection folders represents one
data object and must use the object UUID as its filename:

```text
data/groups/018f2b5a-7d90-7c3b-9b74-b96a1e0e1b5a.json
```

The object's `_id` field must match the filename without `.json`. Object JSON
content follows `docs/data_model.md`: base-class fields are written directly on
the root object, not wrapped in a separate envelope.

Runtime-only files such as users, caches, change logs, and locks live under
`var/`, not `data/`.
