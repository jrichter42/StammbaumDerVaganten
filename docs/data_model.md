# Data Model

The web app stores scout-group history as JSON objects under `web/data/`.
People, groups, roles, group types, and timepoints are independent objects linked
by UUIDs; memberships, activities, group phases, periods, and dates are embedded
value objects.

## Goals

- Keep domain data readable, diffable, and easy to repair.
- Preserve object history through revisions.
- Use stable UUID references instead of copied names.
- Model incomplete historical data with notes, sources, partial dates, and
  certainty values.

## Diagram

```mermaid
%% https://mermaid.ai/open-source/syntax/classDiagram.html

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
  and activities instead of stored as duplicate canonical data.

## Visibility
`+` -> Property is public (visible without login)
`-` -> Property is private (visible only to logged-in users with read access)
`#` -> Property is protected (visible only to logged-in users with the 'sensitive data' permission)

## Storage

Each instance of an object type is stored in a folder (according to the plural of its type name in kebab-case) under `web/data/`.
Folder names need to be usable as REST resource collection.

```text
web/data/
  people/{uuid}.json
  groups/{uuid}.json
  group-types/{uuid}.json
  roles/{uuid}.json
  timepoints/{uuid}.json
```

The content of each JSON file is the type's properties exactly as defined in the
diagram. Base-class fields are written directly on the object.

Runtime state (such as auth files, generated cache data, change queues, and locks)
lives under `web/var/` and is not canonical domain data.

# Versioning
Every class that implements `Object` (within the class diagram) is stored as a JSON object.

The latest version of an object is stored in a json file `<id>.json`.
Previous versions are stored next to the latest file as `<id>_<revision>.json`
So, on update, the revision increases by one. Before replacing the latest `<id>.json`, the previous/existing version is saved next to it as `<id>_<revision>.json`.

The `_modified` property should reflect the timestamp of the latest change, the `_created` property reflects the timestamp of creation of the data object, while `_modifiedBy` and `_createdby` store the respective users.

## Concurrency
Updates use optimistic concurrency.
The client submits the revision it edited; if the object changed meanwhile, the API returns `409 Conflict` with the current object.

## Deletion
Deletes are soft deletes: the latest `<id>.json` remains present with `_deleted: true`, while normal list responses hide it.
The delete timestamp and user are stored in `_modified` and `_modifiedBy`.

# Default (built-in) data
Default group types and roles are normal UUID-backed objects, not enum values, which are available as a starting point.
This default dataset can be deleted on a fresh install without causing problems.

## Group Types

- Stamm
- Meute
- Rudel
- Gilde
- Sippe
- Runde
- Kreis

## Roles

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
