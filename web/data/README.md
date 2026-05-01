# Data Directory

This directory is the file-backed domain object store.

It is intentionally inside the deployable app folder so the application can run
on ordinary shared hosting without custom server configuration. The `.htaccess`
file denies direct web access on Apache hosts. If a non-Apache host is used,
protect this directory through that host's equivalent access rule.

Only object JSON collection folders belong here. Runtime-only files such as
users, caches, change logs, and locks live in `../var/`.
