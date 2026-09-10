# Node.js SSR deployment

## Runtime requirements

- Node.js 20.19 or newer (Node.js 22 is recommended).
- The public process must receive the platform-provided `PORT` environment variable.
- The process binds to `HOST=0.0.0.0` by default.

## Build and start

```bash
npm ci
npm run build
npm start
```

`npm start` executes `dist/demo/server/server.mjs`. Deploy both `dist/demo/browser` and
`dist/demo/server`; the server bundle needs the production `node_modules` dependencies.

## Reverse proxy and host validation

The production domain and its `www` variant are allowlisted for Angular SSR. If the hosting
provider replaces the incoming `Host` header with another hostname, set the runtime variable
below to the explicit additional hostname(s):

```bash
NG_ALLOWED_HOSTS="internal-host.example.com,*.provider.example"
```

Do not use `NG_ALLOWED_HOSTS=*` unless a trusted reverse proxy validates the Host header.

The health endpoint is `GET /healthz` and does not invoke Angular rendering.

## Verification before switching traffic

```bash
npm run test:seo
npm run test:ssr
```

Public pages are server-rendered. Authentication and dashboard routes remain client-rendered
and return `X-Robots-Tag: noindex, nofollow, noarchive`.
