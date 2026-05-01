# Runtime Directory

This directory contains private application runtime state that is not part of
the domain object model:

- `auth/` for user records;
- `cache/` for generated files;
- `changes/` for append-only change logs;
- `locks/` for temporary object locks.

It is protected from direct web access by `.htaccess` and the root rewrite rule.
