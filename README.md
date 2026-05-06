# Stammbaum der Vaganten

Tool written by and for [Stamm der Vaganten](http://stammdervaganten.de).

## Purpose

Stammbaum der Vaganten is meant to preserve and explore the history of a scout
group as a living, time-aware "family tree": groups, people in roles,
events, leadership and changes over time.

The main user is Stamm der Vaganten. The broader target is other scout
groups, especially BdP groups, and potentially other kinds of non-profit social groups that need to track
people, internal groups, offices, activities, and historical change.

The project is not just a member database. Its core value is answering questions
like:

- Which groups existed when, and how did they develop and mature?
- Who belonged to which group at a given time?
- Who held which role in which group, and during which period?
- Which known dates or events anchor the history?
- Where is the data certain, estimated, incomplete, or only known from memory?
- How can this history be visualized as a useful tree?

This project aims to enable interesting and useful data analysis, like: How did the age range of certain roles change over time and how did that influence certain other aspects?

## Domain Model

The current web app contains the main domain vocabulary:

- **Person**: forename, lastname, scout name, birthdate, contact info, notes,
  memberships, and activities.
- **Group**: named organizational unit with a main phase and optional additional
  phases. Seeded group types include `Stamm`, `Meute`, `Rudel`, `Gilde`,
  `Sippe`, `Runde`, and `Kreis`.
- **Group phase**: a group type plus a period. This allows one historical group
  to change type over time, for example from `Rudel` to `Sippe` to `Runde`.
- **Role**: reusable office or responsibility. Seeded roles include
  Stammesfuehrung, Kassenwart, Meutenfuehrung, Sippenfuehrung, Rundensprecher,
  and Kreisleitung. A role can be tied to one or more group types.
- **Membership**: a person belongs to a group for a period.
- **Activity**: a person holds a role in a group for a period.
- **Timepoint**: a named date such as Stammesgruendung, Pfingstlager, or
  Nikofahrt. Periods can reference timepoints instead of duplicating dates.
- **Period**: start and end can be custom dates or references to timepoints.
- **Reference IDs**: objects have stable UUID references so relationships survive
  editing and serialization.
- **Certainty**: records can distinguish known facts from estimates.

## Current Web App

The repository now contains the PHP/JSON web application:

- Plain HTML, CSS, and JavaScript modules in `web/`.
- PHP 8 JSON API in `web/api.php` and `web/app/`.
- Human-readable JSON object storage under `web/data/`.
- One file per object, with revision snapshots on update.
- Session/passkey authentication and permission-based access.
- Public overview plus authenticated editor views.
- Basic and advanced workflows for editing groups, people, roles, timepoints,
  and group types.

Implemented editing surfaces:

- Create, edit, and delete people.
- Create, edit, and delete groups and phases.
- Create, edit, and delete roles.
- Create, edit, and delete named timepoints.
- Create, edit, and delete group types.
- Edit memberships and activities on a person.
- Pick groups, roles, group types, and timepoints through reference controls.

Implemented behavior worth keeping conceptually:

- Shared object IDs and references instead of copying relationship data.
- Named timepoints can drive multiple date ranges.
- Group type changes are represented as phases instead of forcing a group to be
  only one type forever.
- The UI separates a simpler entry flow from a more complete advanced view.

## Known Gaps

Important missing or incomplete areas:

- The actual Stammbaum visualization is not implemented.
- There are no automated tests.
- Partial dates, source tracking, and certainty need deeper UI support.
- Merging, deduplicating, validation, search, and import/export are incomplete.
- Offline support is not implemented.
- The data schema should stay documented and migration-friendly as it evolves.

## Eventual Feature Set

A mature version could provide:

- **Structured history capture**: people, groups, group phases, roles,
  memberships, activities, named events, comments, sources, and attachments.
- **Time-aware exploration**: filter by date, event, person, group, role, or
  generation; reconstruct the group structure at a chosen point in time.
- **Stammbaum visualization**: show group lineage, phase changes, splits,
  merges, leaders, and memberships over time; support print and export.
- **Fast data entry**: forms and table views, bulk import from spreadsheets,
  validation, duplicate detection, and low-friction correction workflows.
- **Uncertainty and provenance**: partial dates, certainty levels, source notes,
  edit history, and conflicting claims where needed.
- **Configurability for other groups**: editable group types, role types,
  naming conventions, and templates for BdP/scout groups.
- **Privacy-aware operation**: hide or redact sensitive fields, separate public
  history from internal contact data, and support local/offline use.
- **Portable data**: documented schema, backups, CSV/JSON export, printable
  reports, and future migration paths.
- **Collaboration path**: eventually allow more than one maintainer to contribute
  safely, whether through files, a shared local database, or a hosted app.

## Web Architecture

The app uses a boring, portable web stack that works on a normal PHP webhosting
plan:

- **Frontend**: plain HTML, CSS, and JavaScript modules.
- **Backend**: small PHP 8 JSON API.
- **Authentication**: PHP sessions and passkeys.
- **Authorization**: permissions such as `read`, `write`, `sensitive`, and
  `manage_users`.
- **Primary storage**: human-readable JSON files, one file per object.
- **Change history**: per-object revision snapshots.

This keeps hosting requirements low, makes backups trivial, and keeps the data
easy to inspect, diff, repair, and migrate.

### Storage Layout

The canonical data lives in one folder per collection:

```text
web/data/
  people/{uuid}.json
  groups/{uuid}.json
  group-types/{uuid}.json
  roles/{uuid}.json
  timepoints/{uuid}.json
web/var/
  auth/
  cache/
  changes/
  locks/
```

Every stored object should have stable metadata:

```json
{
  "_id": "uuid",
  "_revision": 1,
  "_created": "2026-04-28T12:00:00Z",
  "_modified": "2026-04-28T12:00:00Z",
  "_modifiedBy": "user-id"
}
```

Object-per-file storage makes Git diffs and manual review practical. It also
limits merge conflicts to individual people, groups, roles, or timepoints
instead of turning every edit into a conflict in one large file.

### Editing And Conflicts

Use optimistic concurrency as the main correctness mechanism:

1. The client loads an object at revision `A`.
2. The user edits the object.
3. The client submits the change with `base_revision: A`.
4. PHP briefly locks the object file with `flock()`.
5. The server checks whether the current revision is still `A`.
6. If yes, the server writes the new object and revision snapshot.
7. If no, the server returns `409 Conflict` with the current object and the
   user's draft.

Optional object leases can improve the editing experience:

```json
{
  "object": "people/abc",
  "locked_by": "user-id",
  "expires_at": "2026-04-28T12:05:00Z"
}
```

These leases should be treated as warnings, not as the only protection. The
revision check is still the real protection against lost updates.

### Future Offline Mode

The browser app should cache its HTML, CSS, JavaScript, and icons through a
service worker. Data should be stored locally in IndexedDB.

When offline:

- users can browse the last synced data snapshot;
- edits are stored as queued local mutations;
- the UI clearly shows unsynced changes.

When online again:

- queued mutations are sent to the PHP API;
- clean changes are applied automatically;
- conflicting changes are shown to the user for manual resolution.

For event usage, the simplest reliable mode is one laptop acting as the local
authority. Multiple fully disconnected laptops can be supported later through
exported change packages, but that should be treated as a real conflict
resolution feature, not as an MVP assumption.

### SQLite Escape Hatch

If file locking is unreliable on a host, or if concurrent editing becomes too
painful with files alone, use SQLite as the canonical write store:

- one SQLite database file;
- objects stored as JSON text rows;
- append-only `changes` table;
- generated JSON export after each commit for review, backup, and diffing.

SQLite gives stronger transaction behavior. JSON files give better direct human
readability. The preferred starting point is JSON files plus revision checks,
with SQLite available later if operational reality demands it.

### Avoid For Now

- one giant `data.json`;
- realtime collaborative editing;
- Git as the live application backend;
- MySQL-first design unless hosting constraints require it;
- a large PHP framework before the domain model is stable.

## Next Steps

Recommended next steps:

1. Build the first useful Stammbaum visualization.
2. Add tests around dates, references, memberships, activities, and persistence.
3. Improve validation, search, import/export, and duplicate handling.
4. Treat privacy and source/certainty handling as core requirements, not later
   polish.
