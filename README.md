# Stammbaum der Vaganten

Web app for preserving and exploring the history of
[Stamm der Vaganten](http://stammdervaganten.de).

The project is fully focused on the PHP/JSON web application in `web/`. There
is no separate desktop/WPF app in this repository.

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

## Data Model

The app stores scout-group history as JSON objects. People, groups, roles, group
types, and timepoints are independent objects linked by UUIDs; memberships,
activities, group phases, periods, and dates are embedded value objects.

Goals:

- Keep domain data readable, diffable, and easy to repair.
- Preserve object history through revisions.
- Use stable UUID references instead of copied names.
- Model incomplete historical data with notes, sources, partial dates, and
  certainty values.

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
`+` -> Property is public (visible without login)
`-` -> Property is private (visible only to logged-in users with read access)
`#` -> Property is protected (visible only to logged-in users with the 'sensitive data' permission)

## Storage

Each instance of an object type is stored in a folder (according to the plural of its type name in kebab-case) under `web/data/`.
Folder names are usable as REST resource collections.

```text
web/data/
  people/{uuid}.json
  groups/{uuid}.json
  group-types/{uuid}.json
  roles/{uuid}.json
  timepoints/{uuid}.json
```

JSON files contain the type's fields directly, including inherited base fields.
Runtime state (such as auth files, generated cache data, change queues, and locks) lives under `web/var/` and is not canonical domain data.

## Versioning and Concurrency
Updates change the revision; if the stored object changed meanwhile, the API returns `409 Conflict`.
Previous versions are saved as `<id>_<revision>.json` before `<id>.json` is replaced.
Deletes are soft deletes using `_deleted: true`.
Objects use optimistic concurrency.

## Default Data
Default group types and roles are normal full UUID-backed objects
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
