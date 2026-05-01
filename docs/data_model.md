# Data model
```mermaid
classDiagram
direction LR

class Object {
  +UUID _id
  -int _revision
  -DateTime _created
  -DateTime _modified
}

class Datapoint {
  +CertaintyLevel _certainty
  -String _sources
}

class Person {
  -String forename
  -String lastname
  -String scoutname
  -Date birthdate
  -String contactInfo
  -String notes
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
  %% roleType
  +UUID type
  +UUID groupType
  -String notes
}
Role ..|> Object
Role ..|> Datapoint

class RoleType {
  +String label
}
RoleType ..|> Object

class Group {
  +String name
  +GroupPhase mainPhase
  +GroupPhase[] additionalPhases
  -String notes
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
  -String notes
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
Role "0..*" --> "1" RoleType
Role "0..*" --> "0..1" GroupType
Membership "1" *-- "1" Period
Activity "1" *-- "1" Period
GroupPhase "1" *-- "1" Period
Period "0..*" --> "0..2" Timepoint
Timepoint "1" *-- "1" Date
Period "1" *-- "0..2" Date
```
## Visibility
`+` -> Property is public (visible to all users)
`-` -> Property is private (visible only to users who are allowed to see sensitive data)

# Versioning
Every class that implements `Object` is stored as a json object.
When a change to an object is getting commited, the revision number needs to be incremented by one.
The `modified` property should reflect the timestamp of the latest change, the `created` property reflects the timestamp of creation of the data object.
The latest version of an object is stored in a json file `<id>.json`.
If no version control software is used, then previous versions can be stored as `<id>_<revision>.json`.

# JSON
The content of the object's JSON file will be the types properties exactly as deinfed in the class diagram.
Properties from base classes will be part of the objec's properties as if they would have been defined as part of the class itself.

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

## Role Types (label)
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
