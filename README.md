# Stammbaum der Vaganten

Web app for preserving and exploring the history of
[Stamm der Vaganten](http://stammdervaganten.de).

The project is fully focused on the PHP/JSON web application in `web/`. There
is no separate desktop/WPF app in this repository.

## Web App

- Plain HTML, CSS, and JavaScript.
- PHP 8.0 or newer.
- Passkey-based authentication.
- Permission-aware public, private, and sensitive fields.
- Human-readable JSON object storage (domain objects) under `web/data/`.
- Private runtime state (auth, cache, change, lock files) under `web/var/`.

No Composer install, database, build step, or host-level config is required.

## Deploy

Upload the contents of `web/` to a PHP 8 shared host and keep the included
`.htaccess` files.
Apache-compatible `.htaccess` support is needed for direct access protection.
Once editing is enabled, the app needs write permissions for `data/` and `var/`.

Configuration lives in `config/app.json`.
Data timestamps should stay in UTC; the configured timezone is only for frontend display.

## Auth

Login uses passkeys only.
Users and passkey public keys are stored in `var/auth/users.json`; setup tokens, login challenges, and audit logs stay below `var/auth/`.
These files must not be web-readable.

On first run with no users, the app creates one admin account and writes a single-use setup URL to `web/bootstrap_setup.txt`.
Open that URL on the deployed site to register the initial passkey.

For production, set a stable passkey relying-party configuration in `config/app.json` if automatic host detection is not exact:
```json
{
  "auth": {
    "base_url": "https://stammbaumdervaganten.de",
    "rp_id": "stammbaumdervaganten.de",
    "origin": "https://stammbaumdervaganten.de",
    "initial_admin_username": "admin"
  }
}
```

Passkeys require HTTPS except on local development origins such as `localhost`.
`base_url` is used for generated setup links and should be the public URL without a trailing slash.
The initial admin user is only generated when `var/auth/users.json` has no users.

## Data Model

The app stores scout-group history as JSON objects.
People, groups, roles, group types, and timepoints are independent objects linked by UUIDs.
Memberships, activities, group phases, periods, and dates are embedded value objects.

Goals:
- Keep domain data readable, diffable, and easy to repair.
- Preserve object history through revisions.
- Use stable UUID references instead of copied names.
- Model incomplete historical data with notes, sources, partial dates, and certainty values.

```mermaid
classDiagram
direction LR

class Object {
  +UUID _id
  -int _revision
  -DateTime _created
  -DateTime _modified
  -String _modifiedBy
  -Boolean _deleted
  +String description
  -String notes
}

class Datapoint {
  +CertaintyLevel _certainty
  -String _sources
}

class Person {
  -String forename
  -String lastname
  -String scoutname
  #Date birthdate
  #String contactInfo
  +Membership[] memberships
  +Activity[] activities
}
Person ..|> Object
Person ..|> Datapoint

class Membership {
  +UUID group
  +Period period
}
Membership ..|> Datapoint

class Activity {
  +UUID role
  +UUID group
  +Period period
}
Activity ..|> Datapoint

class Role {
  +String label
  %% Group types in and for which this role can be held; empty means unrestricted.
  +UUID[] groupTypes
}
Role ..|> Object
Role ..|> Datapoint

class Group {
  +String name
  +GroupPhase mainPhase
  +GroupPhase[] additionalPhases
}
Group ..|> Object
Group ..|> Datapoint

class GroupPhase {
  +UUID groupType
  +Period period
}

class GroupType {
  +String label
}
GroupType ..|> Object

class Period {
  +UUID startTimepoint
  %% Only valid when no startTimepoint is set
  +Date customStart
  +UUID endTimepoint
  %% Only valid when no endTimepoint is set
  +Date customEnd
}

class Timepoint {
  +String name
  +Date date
}
Timepoint ..|> Object
Timepoint ..|> Datapoint

class Date {
  %% sentinel value '0' is used for 'unset' components (day / month / year), precision can be year, month, day
  +DateTime rawValue
}

class CertaintyLevel <<Enumeration>> {
  None
  NoIdea
  EstimationBad
  EstimationMedium
  EstimationGood
  Confident
  SetInStone
}

Person "1" *-- "0..*" Membership
Membership "0..*" --> "1" Group
Person "1" *-- "0..*" Activity
Activity "0..*" --> "1" Group
Activity "0..*" --> "1" Role
Group "1" *-- "1" GroupPhase
Group "1" *-- "0..*" GroupPhase
GroupPhase "0..*" --> "1" GroupType
Role "0..*" --> "0..*" GroupType
Membership "1" *-- "1" Period
Activity "1" *-- "1" Period
GroupPhase "1" *-- "1" Period
Period "0..*" --> "0..2" Timepoint
Timepoint "1" *-- "1" Date
Period "1" *-- "0..2" Date
```

## Domain Rules

- A person can have memberships in groups and activities with roles.
- A membership links one person to one group for a period.
- An activity links one person, one group, and one role for a period.
- A group has one main phase and can have additional phases.
- A group phase references one group type for a period.
- A role can be restricted to group types; an empty `groupTypes` list means
  unrestricted.
- Period boundaries can use named timepoints or custom dates.
- Reverse views, such as all members of a group, are derived from memberships
  and activities.

## Visibility
- `+`: public - visible without login.
- `-`: private - visible to logged-in users with read access.
- `#`: protected - visible to logged-in users with the sensitive data permission.

## Storage

Each object class has one direct collection folder below `data/`.
The folder name is the plural of its class name in kebab-case.
Folder names are usable as REST resource collections.

Every JSON file in those collection folders represents one data object and uses the object UUID as its filename:

```text
web/data/
  people/{uuid}.json
  groups/{uuid}.json
  group-types/{uuid}.json
  roles/{uuid}.json
  timepoints/{uuid}.json
```

Each objects JSON contains the type's fields directly, including inherited base fields.
Runtime state files (such as auth files, generated cache data, change queues, and locks) live under `web/var/`.

## Versioning

Updates change `_revision`; if the stored object changed in the meantime, the API returns `409 Conflict`.
Previous versions are saved as `<id>_<revision>.json` before `<id>.json` is replaced.
Deletes are soft deletes using `_deleted: true`.

## Concurrency

Objects use optimistic concurrency for multi-user editing.

## Default Data

Default group types and roles are normal full UUID-backed objects.
They are starting data and can be removed on a fresh install.

Group types:

- Stamm
- Meute
- Rudel
- Gilde
- Sippe
- Runde
- Kreis

Roles:

- Stammesführung
- Stellv. Stammesführung
- Kassenwart
- Stellv. Kassenwart*in
- Handkasse
- Meutenführung
- Meutenassistenz
- Rudelführung
- Sippenführung
- Gildensprecher*in
- Rundensprecher*in
- Kreisleitung

## Current Gaps

- The main tree visualization is not implemented yet.
- Automated tests are still missing.
- Search, validation, import/export, duplicate handling, and source tracking
  need more work.
- Partial dates and certainty need deeper UI support.
