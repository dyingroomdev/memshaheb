# Deployment Guide

## 1. Prepare environment files

```bash
cd deploy
cp backend.env.example backend.env
cp frontend.env.example frontend.env
```

Update secrets and hostnames inside `backend.env` and `frontend.env`. In particular:

- `DATABASE_URL` should target your PostgreSQL instance on `pg-network`.
- `MEDIA_BASE_URL` points to `https://backend.memshaheb.com/media` so static assets render over HTTPS.
- `NEXT_PUBLIC_API_BASE_URL` is already set to `https://backend.memshaheb.com` for frontend API calls.

## 2. Build and run the containers

```bash
docker compose -f docker-compose.yml up -d --build
```

By default the backend is published on host port `5010` and the frontend on `5011`. Override these with `BACKEND_PORT` / `FRONTEND_PORT` environment variables when invoking `docker compose` if needed.

Both services join the existing `pg-network` Docker network. Ensure the network already exists and the PostgreSQL container is reachable from it.

## 3. Verify media delivery with curl

Use `curl` from the VPS to confirm static media is served via the backend container:

```bash
# Replace <server-host> with the machine hostname or public IP
curl -I http://<server-host>:5010/media/sample.jpg
curl -I http://<server-host>:5010/media/Ambient.mp3
```

Each request should return `HTTP/1.1 200 OK` and the correct `Content-Type`.

To check the frontend service:

```bash
curl -I http://<server-host>:5011
```

If you terminate TLS in a reverse proxy, point it at the same ports and update `MEDIA_BASE_URL` / `NEXT_PUBLIC_API_BASE_URL` to the HTTPS endpoints.

## 4. Wire into Nginx Proxy Manager (NPM)

1. In NPM, create a proxy host for `backend.memshaheb.com` that forwards to the VPS host on port `5010`. Enable Websockets, set the SSL certificate, and force SSL.
2. Create a second proxy host for `memshaheb.com` forwarding to port `5011` with the same SSL settings.
3. After NPM is provisioned, re-run the `curl` checks against the public HTTPS URLs to confirm certificates and media delivery:

```bash
curl -I https://backend.memshaheb.com/media/sample.jpg
curl -I https://backend.memshaheb.com/media/Ambient.mp3
curl -I https://memshaheb.com
```
