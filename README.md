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