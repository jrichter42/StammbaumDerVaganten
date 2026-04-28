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

The current prototype already contains the main domain vocabulary:

- **Scout / person**: forename, lastname, scout name, birthdate, contact info,
  comment, memberships, and activities.
- **Group**: named organizational unit with a main phase and optional additional
  phases. Built-in group types are `Stamm`, `Meute`, `Rudel`, `Gilde`, `Sippe`,
  `Runde`, `Kreis`, plus `Custom`.
- **Group phase**: a type plus a timespan. This allows one historical group to
  change type over time, for example from `Rudel` to `Sippe` to `Runde`.
- **Role**: reusable office or responsibility. Built-in role types include
  Stammesfuehrung, Kassenwart, Meutenfuehrung, Sippenfuehrung, Rundensprecher,
  Kreisleitung, and `Custom`. A role can be tied to a group type.
- **Membership**: a person belongs to a group for a timespan.
- **Activity**: a person holds a role in a group for a timespan.
- **Timepoint**: a named date such as Stammesgruendung, Pfingstlager, or
  Nikofahrt. Timespans can reference timepoints instead of duplicating dates.
- **Timespan**: start and end can be custom dates or references to timepoints.
- **Reference IDs**: objects have stable internal references so relationships can
  survive editing and serialization.
- **Versioned data and certainty**: many fields are modeled as historical values,
  and the code contains a `CertaintyLevel` enum. This suggests the intended model
  should preserve changes and distinguish known facts from estimates, although
  the current UI does not expose that fully for the sake of simplicity.

## Current Prototype

The repository currently contains a Windows desktop prototype:

- C# / WPF application targeting `net6.0-windows`.
- MahApps.Metro based UI.
- A solution with one app project: `StammbaumDerVaganten`.
- Data grids for direct editing.
- XML persistence through `DataContractSerializer`.
- Default data file: `./stammbaum.xml`.
- A basic log shown in the status bar and advanced tab.
- Debug startup creates hardcoded demo data and saves it immediately.

The UI is split into:

- **Basic tab**: timepoints, groups, and a placeholder area for visualization.
- **Advanced tab**: roles, timepoints, groups, scouts, nested memberships,
  nested activities, log, and another visualization placeholder.

Implemented editing surfaces:

- Create and edit scouts.
- Create and edit groups and additional group phases.
- Create and edit roles.
- Create and edit named timepoints.
- Create and edit memberships on a scout.
- Create and edit activities on a scout.
- Pick groups, roles, and timepoints through filtered combo boxes.
- Save and load the current database file.

Implemented behavior worth keeping conceptually:

- Shared object IDs and references instead of copying relationship data.
- Named timepoints can drive multiple date ranges.
- Activity group choices can be filtered by the selected role's group type.
- Group type changes are represented as phases instead of forcing a group to be
  only one type forever.
- The UI separates a simpler entry mode from a more complete advanced view.

Historical branches show two additional directions:

- `origin/Visualization_start` contains an early canvas-based visualization stub
  with a `TreeNode` concept: group, leaders, founding date.
- `origin/show-ids` experiments with showing or hiding IDs in the UI.

## Known Gaps

The current code should be treated as a requirements prototype, not as the final
architecture.

Important missing or incomplete areas:

- The actual Stammbaum visualization is not implemented.
- There are no automated tests.
- Persistence is not versioned, migrated, or documented as a stable file format.
- `FileExtension.JSON` exists, but current serialization writes XML.
- Partial dates, source tracking, and certainty are not usable in the UI.
- `Membership.ToString`, `Activity.ToString`, and `Timespan.ToString` are
  placeholders.
- Deleting, merging, deduplicating, validation, search, and import/export are not
  implemented.
- Privacy and access control are not modeled, even though birthdates and contact
  information are sensitive.
- The WPF prototype is Windows-only. The old README already noted that another
  toolkit or platform could be preferable for documentation, openness, and
  cross-platform use.
- Domain logic is mixed with view model and UI assumptions in several places,
  which will make a pivot easier if the domain model is separated first.

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

## Suggested Web Implementation

The next version should aim for a boring, portable web stack that works on a
normal PHP webhosting plan:

- **Frontend**: plain HTML, CSS, and JavaScript modules.
- **Backend**: small PHP 8 JSON API.
- **Offline support**: Progressive Web App with a service worker and IndexedDB.
- **Authentication**: PHP sessions with hashed passwords.
- **Authorization**: simple roles such as `admin`, `editor`, `viewer`, and
  optionally `private_data`.
- **Primary storage**: human-readable JSON files, one file per object.
- **Change history**: append-only JSONL logs and per-object revision snapshots.

This should keep hosting requirements low, make backups trivial, and keep the
data easy to inspect, diff, repair, and migrate.

### Storage Layout

Prefer many small JSON files over one large database file:

```text
data/
  objects/
    scouts/{uuid}.json
    groups/{uuid}.json
    roles/{uuid}.json
    timepoints/{uuid}.json
    memberships/{uuid}.json
    activities/{uuid}.json
  revisions/
    scouts/{uuid}/{rev}.json
  changes/
    2026-04.jsonl
  auth/
    users.json
  locks/
    {type}-{uuid}.json
```

Every stored object should have stable metadata:

```json
{
  "id": "uuid",
  "type": "scout",
  "schema_version": 1,
  "rev": "sha256-or-monotonic-revision",
  "updated_at": "2026-04-28T12:00:00Z",
  "updated_by": "user-id",
  "data": {}
}
```

Object-per-file storage makes Git diffs and manual review practical. It also
limits merge conflicts to individual scouts, groups, roles, or memberships
instead of turning every edit into a conflict in one large file.

### Editing And Conflicts

Use optimistic concurrency as the main correctness mechanism:

1. The client loads an object at revision `A`.
2. The user edits the object.
3. The client submits the change with `base_rev: A`.
4. PHP briefly locks the object file with `flock()`.
5. The server checks whether the current revision is still `A`.
6. If yes, the server writes the new object, revision snapshot, and change log.
7. If no, the server returns `409 Conflict` with the current object and the
   user's draft.

Optional object leases can improve the editing experience:

```json
{
  "object": "scouts/abc",
  "locked_by": "user-id",
  "expires_at": "2026-04-28T12:05:00Z"
}
```

These leases should be treated as warnings, not as the only protection. The
revision check is still the real protection against lost updates.

### Offline Mode

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

## Pivot Guidance

If the project is continued in a new stack, keep the current prototype as a map
of concepts and workflows, not as a constraint.

Recommended next steps:

1. Define the canonical domain schema independent of UI technology.
2. Decide whether the next app should be local-first desktop, web-based,
   self-hosted, or hybrid.
3. Build an MVP around data capture, import/export, and one useful visualization.
4. Add tests around dates, references, memberships, activities, and
   serialization before expanding the feature surface.
5. Treat privacy and source/certainty handling as core requirements, not later
   polish.
