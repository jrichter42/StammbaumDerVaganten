# Shared Data Concepts

This document captures the domain concepts used by the current PHP/JSON web app.
It is intentionally implementation-light: the concepts should stay stable even if
storage, UI, serialization, or synchronization details change.

## Core Idea

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

## Data Quality Needs

Historical data is often incomplete or uncertain. The model should support:

- partial dates, such as year-only or month-only dates;
- uncertain or estimated dates;
- notes/comments on most domain objects;
- stable references that survive renames;
- object revision history;
- future migration path for better provenance/source tracking.

## Group Types

The app seeds scout-specific group types as normal `group-types` records while
allowing user-defined extensions.

Common examples:

```text
Stamm
Meute
Rudel
Gilde
Sippe
Runde
Kreis
```

These are UUID-backed records, not enum values. New group kinds should be added
as normal `group-types` objects so relationships do not depend on copied strings.

## Roles

The app treats roles as reusable definitions, not as one-off text fields on
activities.

Common examples:

```text
Stammesfuehrung
StellvStammesfuehrung
Kassenwart
StellvKassenwart
Handkasse
Meutenfuehrung
Meutenassistenz
Rudelfuehrung
Sippenfuehrung
Gildensprecher
Rundensprecher
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

## Not Domain Model

These implementation details are intentionally not part of the shared domain
model:

- PHP API routes;
- JSON file layout;
- browser offline queue shape;
- object lock files;
- auth/users/roles for application access;
- generated cache/index files.
