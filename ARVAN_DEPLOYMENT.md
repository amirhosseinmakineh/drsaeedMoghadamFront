# ArvanCloud container deployment

## Build the image

The application is deployed as Angular SSR, not as a static-only site. Build from the repository
root and use an immutable tag such as the Git commit SHA:

```bash
docker build --platform linux/amd64 \
  --build-arg ANGULAR_CONFIGURATION="production" \
  --build-arg WEBPUSH_VAPID_PUBLIC_KEY="YOUR_PUBLIC_KEY" \
  -t REGISTRY/dental-front:GIT_SHA .
docker push REGISTRY/dental-front:GIT_SHA
```

`WEBPUSH_VAPID_PUBLIC_KEY` is public configuration. Never pass the VAPID private key to the
frontend build.

## ArvanCloud application settings

- Container port: `3000`
- Environment variable: `PORT=3000`
- Environment variable: `HOST=0.0.0.0`
- Domain: `drsaeedmoghadam.com` (and `www` if required)
- Health path: `GET /healthz`

The production API URL is currently compiled as `https://api.drsaeedmoghadam.com/api`. Keep that
backend hostname unchanged or update the Angular production environment before building.

After deployment, verify SSR pages, authenticated dashboards, the service worker, Web Push, and
the SignalR connection to `https://api.drsaeedmoghadam.com/hubs/reservations` before switching
production traffic.

## Branch and build mapping

| Branch | Angular configuration | API |
| --- | --- | --- |
| `develop` | `development` | Local/integration API |
| `stage` | `stage` | `https://api-stage.drsaeedmoghadam.com/api` |
| `production` | `production` | `https://api.drsaeedmoghadam.com/api` |

Promote a reviewed commit from `develop` to `stage`, then from `stage` to
`production`. Production must never be built from an unreviewed branch.
