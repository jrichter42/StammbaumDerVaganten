# Stammbaum der Vaganten

Web app for preserving and exploring the history of
[Stamm der Vaganten](http://stammdervaganten.de).

The project is now fully focused on the PHP/JSON web application in `web/`.
There is no separate desktop/WPF app in this repository.

## What It Tracks

- People, scout names, contact details, notes, and certainty.
- Groups and their historical group-type phases.
- Roles, memberships, and activities over time.
- Named timepoints that can anchor date ranges.
- Revision history for each stored object.

The data model is documented in [docs/data_model.md](docs/data_model.md).

## Web App

- Plain HTML, CSS, and JavaScript.
- PHP 8 JSON API.
- Passkey-based authentication.
- Permission-aware public, private, and sensitive fields.
- Human-readable domain object JSON storage under `web/data/`.
- Runtime auth, cache, change, and lock files under `web/var/`.

## Deploy

Upload `web/` to a PHP 8 shared host and keep the included `.htaccess` files.
The app does not require Composer, a database, or a build step.

Configuration lives in `web/config/app.json`. See [web/README.md](web/README.md)
for passkey setup and hosting details.

## Current Gaps

- The main tree visualization is not implemented yet.
- Automated tests are still missing.
- Search, validation, import/export, duplicate handling, and source tracking
  need more work.
- Partial dates and certainty need deeper UI support.
