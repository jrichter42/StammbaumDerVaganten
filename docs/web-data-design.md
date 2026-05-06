# Web Data Design

This document describes the current PHP/JSON web app data model.

## Goals

- Run on ordinary PHP hosting.
- Keep domain data in readable JSON files.
- Make backups, diffs, and manual repair straightforward.
- Support safe editing through object revisions and conflict checks.
- Keep the domain model close to the scout-group history problem.

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

## Editing And Conflicts

Updates use optimistic concurrency:

1. The client loads an object at revision `A`.
2. The client submits a change with `base_revision: A`.
3. PHP locks the object briefly.
4. If the current revision is still `A`, PHP writes a revision snapshot and the
   updated latest object.
5. If the current revision changed, the API returns `409 Conflict` with the
   current object.

## Future Extensions

- Better partial-date precision.
- Source/provenance records.
- Import/export workflows.
- Search indexes and generated read models.
- Offline read/edit queue.
