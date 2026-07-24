# Switchboard Plus Static Deployment

This folder contains a **router-free static site**. Each public route is an independent HTML document:

| Public URL | File |
|---|---|
| `/` | `index.html` |
| `/about/` | `about/index.html` |
| `/services/` | `services/index.html` |
| `/contact/` | `contact/index.html` |

## Form endpoint and CORS

The quote form posts `FormData` by JavaScript fetch to:

```text
https://cgnew.wpengine.com/apis/sb/home/
```

The PHP handler currently permits only this browser origin:

```text
https://switchboard-plus.com
```

For an in-page success message to work, publish the site on that exact custom domain or update the PHP handler’s `Access-Control-Allow-Origin` value to the final site origin. A direct `github.io` domain will be rejected by the currently supplied CORS policy.

## Security headers

The included `_headers` file defines a nonce-aware Content Security Policy and the related browser security headers. It is suitable for hosts that support `_headers` files, such as Cloudflare Pages and Netlify.

GitHub Pages does **not** apply custom response headers from `_headers`. If the site must remain on GitHub Pages and requires the configured CSP/HSTS/anti-framing policy, place a CDN or reverse proxy that supports response-header rules in front of the custom domain.

## Publishing

Upload the contents of this folder—not the folder itself—to the static host’s public root. Retain `_headers`, `.well-known/security.txt`, `robots.txt`, and `sitemap.xml` when the selected host supports them.
