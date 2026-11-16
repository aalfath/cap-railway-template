[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/new/template/cap-2?utm_medium=integration&utm_source=button&utm_campaign=cap)

# Cap on Railway

A Railway template for [Cap](https://github.com/CapSoftware/Cap), the open-source Loom alternative. You record your screen with the Cap desktop app or in the browser, upload it and share a link. This repo holds the Dockerfiles the template builds. When we bump the version here, everyone who deployed the template gets Railway's "update available" notice.

## What it deploys

| Service | Source | Purpose |
|---|---|---|
| `cap-web` | [`web/`](web) | Cap Web: dashboard, share pages and upload API. Public, health check `/api/status` |
| `media-server` | [`media-server/`](media-server) | FFmpeg processing (thumbnails, faststart, imports). Private, health check `/health` |
| `MySQL` | Railway MySQL | Accounts, videos and settings, on a volume |
| `Bucket` | Railway Bucket | Recordings and images (S3-compatible, private; playback uses signed links) |

Versions: Cap Web build `f415c09c5` and media server build `ca4e8a74a`, both from upstream `main` on 2026-11-16 and pinned by digest. Upstream publishes the server images only under moving tags such as `latest`. The `cap-v*` releases are the desktop app.

## Variables

There's nothing to fill in. The template sets:

- `cap-web`:
  - `DATABASE_URL`, a reference to MySQL
  - `WEB_URL`, which is `https://` plus the Railway domain
  - `NEXTAUTH_SECRET` and `DATABASE_ENCRYPTION_KEY`, generated (64 hex characters)
  - the bucket credentials (`CAP_AWS_*`, `S3_PUBLIC_ENDPOINT`), taken from the Railway Bucket
  - the media server's private URL and the shared webhook secret
- `media-server`: `PORT=3456` and a generated `MEDIA_SERVER_WEBHOOK_SECRET`.

The start script also sets:

- `NEXTAUTH_URL`, the same as `WEB_URL`
- virtual-hosted bucket URLs (`S3_PATH_STYLE=false`; set it to `true` for MinIO)
- the Chrome Web Store extension ID (`CAP_CHROME_EXTENSION_ID`), so the Cap extension can sign in

On every start, `cap-web` also sets the bucket's CORS rule ([`web/bucket-cors.mjs`](web/bucket-cors.mjs)), so browsers on your Cap domain can upload recordings and read the `ETag` header, as Cap's docs require. Only your `WEB_URL` origin is allowed. Add more origins with `CAP_BUCKET_CORS_ORIGINS` (comma-separated), or turn it off with `CAP_SET_BUCKET_CORS=false` when you manage the bucket yourself.

Optional variables. Add them on `cap-web` when you need them (see the [self-hosting docs](https://cap.so/docs/self-hosting)):

- `RESEND_API_KEY` and `RESEND_FROM_DOMAIN`: send sign-in codes by email. Without them, codes appear in `cap-web`'s Deploy Logs.
- `CAP_ALLOWED_SIGNUP_DOMAINS`: only these email domains can create an account.
- `ASSEMBLY_API_KEY`, `GROQ_API_KEY`, `OPENAI_API_KEY`: transcription, AI titles and summaries.
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`, or `OIDC_ISSUER` / `OIDC_CLIENT_ID` / `OIDC_CLIENT_SECRET`: single sign-on.

If you add a custom domain, change `WEB_URL` to it and redeploy: sign-in links, share links and the bucket's CORS rule follow it.

Don't change `DATABASE_ENCRYPTION_KEY` after the first start, because encrypted fields can't be read without it.

## After deploying

1. Open the `cap-web` domain and sign in with your email.
2. Copy the 6-digit code from `cap-web` → Deployments → Deploy Logs (look for "VERIFICATION CODE").
3. In Cap Desktop, set Settings → "Cap Server URL" to your domain.

## Updates

We test each version bump on Railway before it lands here, with a `CHANGELOG.md` entry. Railway then shows an update notice in your project, and you apply it when you're ready. Cap runs its database migrations on start.

## Local build

```sh
docker build -t cap-web ./web
docker build -t cap-media-server ./media-server
```

Cap is licensed under AGPLv3 (see the [upstream licence](https://github.com/CapSoftware/Cap/blob/main/LICENSE)). This repo only holds the Railway packaging.
