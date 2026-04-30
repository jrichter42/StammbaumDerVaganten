# Data model
```mermaid
classDiagram
direction LR

class CertaintyLevel <<Enumeration>> {
  None
  NoIdea
  EstimationBad
  EstimationMedium
  EstimationGood
  Confident
  SetInStone
}

class Version~T~ {
  DateTime timestamp
  T value
}

class VersionedData~T~ {
  Version~T~ versions
}

class Date {
  %% sentinel value '0' is used for 'unset' components (day / month / year), precision can be year, month, day
  DateTime rawValue
}

class Datapoint~T~ {
  VersionedData~T~[] versions
  VersionedData~CertaintyLevel~ certainty
}

class Person {
  UUID id
  VersionedData~CertaintyLevel~ Certainty
  VersionedData~String~ forename
  VersionedData~String~ lastname
  VersionedData~String~ scoutname
  VersionedData~Date~ birthdate
  VersionedData~String~ contactInfo
  VersionedData~String~ notes
  Membership[] memberships
  Activity[] activities
}

class GroupType {
  UUID id
  String label
}

class GroupPhase {
  VersionedData<GroupType> groupType
  Period period
}

class Group {
  UUID id
  VersionedData~CertaintyLevel~ Certainty
  VersionedData~String~ name
  GroupPhase mainPhase
  GroupPhase[] additionalPhases
  VersionedData~String~ notes
}

class RoleType {
  UUID id
  String label
}

class Role {
  UUID id
  VersionedData~CertaintyLevel~ Certainty
  %% roleType
  VersionedData~UUID~ type
  VersionedData~UUID~ groupType
  VersionedData~String~ notes
}

class Timepoint {
  UUID id
  VersionedData~CertaintyLevel~ Certainty
  VersionedData~String~ name
  VersionedData~Date~ date
  VersionedData~String~ notes
}

class Membership {
  VersionedData~CertaintyLevel~ Certainty
  VersionedData~UUID~ group
  Period period
}

class Activity {
  VersionedData~CertaintyLevel~ Certainty
  VersionedData~UUID~ role
  VersionedData~UUID~ group
  Period period
}

class Period {
  VersionedData~UUID~ startTimepoint
  %% only valid when no startTimepoint is set
  VersionedData~Date~ customStart
  VersionedData~UUID~ endTimepoint
  %% only valid when no endTimepoint is set
  VersionedData~Date~ customEnd
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

# Default (built-in) data
## Group Types
- Stamm
- Meute
- Rudel
- Gilde
- Sippe
- Runde
- Kreis

## Role Types
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
