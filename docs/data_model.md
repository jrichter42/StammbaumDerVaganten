# Data model
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
  %% GroupTypes in & for which this role can be held, empty means unrestricted/none
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
  +GroupType groupType
  +Period period
}

class GroupType {
  +String label
}
GroupType ..|> Object

class Period {
  +UUID startTimepoint
  %% only valid when no startTimepoint is set
  +Date customStart
  +UUID endTimepoint
  %% only valid when no endTimepoint is set
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
## Visibility
`+` -> Property is public (visible to anyone)
`-` -> Property is private (visible only to users who are allowed to read data)
`#` -> Property is protected (visible only to users who are allowed to read senstive data)

Everyone can read public fields - this data can potentially be shown publicly (e.g. on a website).
Users with either read or write permission can receive public and private fields.
Sensitive fields are only included when the user also has the sensitive permission.

## Deletion
Deleted objects are hidden from normal object list responses and will be private (they are only accessible for users who are allowed to read data);
`_deleted` is written on the latest object JSON when an object is deleted.
The deletion timestamp and deleting user are represented by `_modified` and `_modifiedBy` on that delete revision.

# Versioning
Every class that implements `Object` is stored as a JSON object.
When a change to an object is committed, the revision number needs to be incremented by one.
The `_modified` property should reflect the timestamp of the latest change, the `_created` property reflects the timestamp of creation of the data object.
The latest version of an object is stored in a json file `<id>.json`.
Previous versions are stored next to the latest file as `<id>_<revision>.json`
before the latest file is replaced. Delete is implemented as a soft-delete
revision: the latest `<id>.json` remains present with `_deleted` set, while
normal list responses hide the object. The delete time and deleting user are the
delete revision's `_modified` and `_modifiedBy` values.

# JSON
The content of the object's JSON file will be the type's properties exactly as defined in the class diagram.
Properties from base classes will be part of the object's properties as if they would have been defined as part of the class itself.

# Folders
One folder per object child class type in kebab-case and plural of the type name (folder name should be usable as REST resource collection).
Object JSON files within those folders, see [Versioning](#versioning).

# Default (built-in) data
This data is available as a starting point.
Each of the listed item is a full object as defined by the class diagram.
Each object will use the respective value for the property mentioned in the header (in parantheses).

## Group Types (label)
- Stamm
- Meute
- Rudel
- Gilde
- Sippe
- Runde
- Kreis

## Roles (label)
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
