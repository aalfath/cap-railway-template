# Changelog

Each entry lists breaking changes first. Railway shows an "update available" notice to everyone who deployed the template when a change lands on `main`. Read the entry before you apply it.

## 2026-11-16: first release

- Cap Web: official image `ghcr.io/capsoftware/cap-web`, build of commit `f415c09c5` (2026-11-16), digest `sha256:b93679f183fa5ce417e03d0b59dd9bdf094d5491cacf291dbada3fc024b82718`.
- Media server: official image `ghcr.io/capsoftware/cap-media-server`, build of commit `ca4e8a74a` (2026-11-16), digest `sha256:f510bd041e7cc3cb4fcb2f89bef76967639f4e6af714553d439927f818ac76d8`.
- Railway MySQL for data, a Railway Bucket for recordings, generated secrets, health checks on both services.
- `cap-web` sets the bucket's CORS rule for its own origin on start, so browser uploads work.
