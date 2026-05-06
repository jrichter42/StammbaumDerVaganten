# Web Data Design

This document describes the current PHP/JSON web app data model. It combines
the stable domain concepts with the current storage layout so there is one
place to update when the web data model changes.

## Goals

- Run on ordinary PHP hosting.
- Keep domain data in readable JSON files.
- Make backups, diffs, and manual repair straightforward.
- Support safe editing through object revisions and conflict checks.
- Keep the domain model close to the scout-group history problem.
- Keep domain concepts stable even if storage, UI, serialization, or
  synchronization details change.

## Core Model

The project models the history of a scout group as a time-aware graph:

- people exist independently from their memberships and responsibilities;
- groups exist independently from their type at any one time;
- roles describe reusable offices or responsibilities;
- timepoints anchor historical facts to named events;
- memberships and activities connect people to groups and roles over time;
- dates can be exact, partial, estimated, or uncertain.

## Vocabulary

| Concept | Web data shape | Meaning |
| --- | --- | --- |
| Person | `people` object | A person/scout known to the group history. |
| Group | `groups` object | A named organizational unit. |
| Group type | `group-types` object | A reusable classification for group phases. |
| Group phase | embedded `groupPhase` value | A group's type during a period. |
| Role | `roles` object | A reusable office or responsibility. |
| Timepoint | `timepoints` object | A named event/date usable as a time anchor. |
| Membership | embedded membership value on a person | A person belongs to a group for a period. |
| Activity | embedded activity value on a person | A person holds a role in a group for a period. |
| Period | embedded `period` value | Start/end range using dates or timepoints. |
| Date | date value object | A date value, currently stored as a raw value. |
| Reference | UUID string | Stable link between objects. |
| Certainty | lowercase `_certainty` IDs | Confidence in historical data. |
| History | object revisions | Ability to preserve changes over time. |

## Domain Rules

- A person can have zero or more memberships.
- A person can have zero or more activities.
- A membership links exactly one person to exactly one group.
- An activity links exactly one person, one group, and one role.
- A group can have one main phase and optional additional phases.
- A group phase references one group type for a period.
- A role is a reusable reference object and can be restricted to one or more
  group types.
- A role without group type restrictions can be treated as valid for any group
  type.
- A period can use custom dates, named timepoints, or a mix of both.
- Named timepoints prevent duplicating important dates across many records.
- Relationships should use stable IDs/references rather than copied names.
- Reverse views such as "all members of a group" should be derived from
  membership/activity records instead of stored as duplicate canonical data.

## Data Quality

Historical data is often incomplete or uncertain. The model should support:

- partial dates, such as year-only or month-only dates;
- uncertain or estimated dates;
- notes/comments on most domain objects;
- stable references that survive renames;
- object revision history;
- future migration path for better provenance/source tracking.

## Storage Layout

Canonical domain objects live under `web/data/`, one folder per collection:

```text
web/data/
  people/{uuid}.json
  groups/{uuid}.json
  group-types/{uuid}.json
  roles/{uuid}.json
  timepoints/{uuid}.json
```

Runtime state lives under `web/var/`:

```text
web/var/
  auth/
  cache/
  changes/
  locks/
```

Object revision snapshots are stored next to the latest object as
`{uuid}_{revision}.json` before the latest `{uuid}.json` is replaced. Deleted
objects stay as latest JSON files with `_deleted: true`; normal list responses
hide them.

## Object Metadata

Every domain object has shared metadata:

```json
{
  "_id": "uuid",
  "_revision": 1,
  "_created": "2026-04-28T12:00:00Z",
  "_modified": "2026-04-28T12:00:00Z",
  "_modifiedBy": "user-id"
}
```

## Visibility

Fields are grouped into public, private, and protected visibility:

- Public fields can be shown without login.
- Private fields are visible to users with read or write access.
- Protected fields require the `sensitive` permission.

Current protected fields are person birthdate and contact information.

## Collections

### `people`

```json
{
  "description": "",
  "notes": "",
  "_certainty": "none",
  "_sources": "",
  "forename": "",
  "lastname": "",
  "scoutname": "",
  "birthdate": null,
  "contactInfo": "",
  "memberships": [],
  "activities": []
}
```

Memberships are embedded values:

```json
{
  "group": "group-uuid",
  "period": {}
}
```

Activities are embedded values:

```json
{
  "group": "group-uuid",
  "role": "role-uuid",
  "period": {}
}
```

### `groups`

```json
{
  "description": "",
  "notes": "",
  "_certainty": "none",
  "_sources": "",
  "name": "",
  "mainPhase": null,
  "additionalPhases": []
}
```

Group phases are embedded values:

```json
{
  "groupType": "group-type-uuid",
  "period": {}
}
```

### `group-types`

```json
{
  "description": "",
  "notes": "",
  "label": ""
}
```

These records are shown as "Gruppenarten" in the German UI.

### `roles`

```json
{
  "description": "",
  "notes": "",
  "_certainty": "none",
  "_sources": "",
  "label": "",
  "groupTypes": []
}
```

`groupTypes` contains zero or more `group-types` UUIDs. An empty list means the
role is unrestricted.

### `timepoints`

```json
{
  "description": "",
  "notes": "",
  "_certainty": "none",
  "_sources": "",
  "name": "",
  "date": null
}
```

## Value Objects

### Date

Dates are currently stored as raw values:

```json
{
  "rawValue": "2008-05-06"
}
```

Future schema versions can add explicit precision, display text, and per-date
certainty.

### Period

Periods can use named timepoints, custom dates, or a mix:

```json
{
  "startTimepoint": "timepoint-uuid",
  "customStart": null,
  "endTimepoint": "",
  "customEnd": {
    "rawValue": "2020-01-01"
  }
}
```

When a boundary uses a timepoint, the matching custom date should be `null`.
When it uses a custom date, the matching timepoint should be an empty string.

## Default Data

The repository seeds common group types and roles as normal objects.

Seeded group types:

```text
Stamm
Meute
Rudel
Gilde
Sippe
Runde
Kreis
```

These are UUID-backed records, not enum values. New group types should be added
as normal `group-types` objects so relationships do not depend on copied
strings.

Seeded roles:

```text
Stammesführung
Stellv. Stammesführung
Kassenwart
Stellv. Kassenwart*in
Handkasse
Meutenführung
Meutenassistenz
Rudelführung
Sippenführung
Gildensprecher*in
Rundensprecher*in
Kreisleitung
```

Roles are UUID-backed records with labels and optional allowed group type
references. User-defined roles are normal `roles` objects.

## Certainty

The app stores certainty as lowercase `_certainty` IDs on supported domain
objects.

Conceptual certainty scale:

```text
none
unknown
bad estimate
medium estimate
good estimate
confident
set in stone
```

Certainty should eventually be usable on dates, periods, and possibly individual
claims.

## Editing And Conflicts

Updates use optimistic concurrency:

1. The client loads an object at revision `A`.
2. The client submits a change with `base_revision: A`.
3. PHP locks the object briefly.
4. If the current revision is still `A`, PHP writes a revision snapshot and the
   updated latest object.
5. If the current revision changed, the API returns `409 Conflict` with the
   current object.

## Outside The Domain Model

These implementation details are intentionally not part of the stable domain
model:

- PHP API routes;
- JSON file layout;
- browser offline queue shape;
- object lock files;
- auth/users/roles for application access;
- generated cache/index files.

They are documented here only where they affect the current web data design.

## Future Extensions

- Better partial-date precision.
- Source/provenance records.
- Import/export workflows.
- Search indexes and generated read models.
- Offline read/edit queue.
