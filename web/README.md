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
timezone is for frontend display. The initial runtime directory contains an
empty `var/auth/users.json`; no default login exists.

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
