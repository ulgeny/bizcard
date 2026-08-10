---
name: bizcard-conventions
description: Use when adding/editing React components in BizCard's index.html, or when wiring the "Kartı Kaydet" / "Toplantı Talep Et" buttons to a webhook — defines component file/style rules and the JSON payload contract for those two events.
---

# BizCard Conventions

## Overview

BizCard is a build-free React app (React + ReactDOM + Babel Standalone via CDN, no npm). This skill fixes two things future work must follow: how components are structured, and the exact JSON shape sent to the "Kartı Kaydet" (save card) and "Toplantı Talep Et" (request meeting) webhooks.

## Component rules

- **One file per component.** Each component (`Avatar`, `ContactList`, `ProfileCard`, ...) lives in its own `.js` file under `src/components/`, e.g. `src/components/Avatar.js`.
- **Function components only.** No class components. Use hooks (`useState`, etc.) for state.
- **Demo data lives in `src/data/card.js`.** Never hardcode sample name/phone/email/etc. inside a component. The component receives data via props; `src/data/card.js` exports the demo/default record consumed by the top-level `App`.
- **No bundler, no imports/exports.** Load scripts with plain `<script type="text/babel" src="...">` tags in dependency order (data → leaf components → composed components → `App`). Classic (non-module) `<script>` tags share one global scope, so a top-level `const Avatar = (...) => {...}` in one file is directly usable by a script loaded after it — no `import`/`export`, no build step.
- **Load order in `index.html`:**
  1. `src/data/card.js`
  2. `src/components/Avatar.js`
  3. `src/components/ContactList.js`
  4. `src/components/ProfileCard.js`
  5. inline `App` bootstrap (`ReactDOM.createRoot(...).render(...)`)

## Webhook data contract

Both events: `POST`, `Content-Type: application/json`, ISO 8601 timestamps (with offset), expect a `2xx` response. Endpoint/tooling (Zapier, Make, n8n, custom) not yet decided — this schema is the stable contract regardless of destination.

### `card.save` — "Kartı Kaydet"

Fires when a visitor saves/downloads the card. `visitor` fields are `null` when not collected (no capture form present yet).

```json
{
  "event": "card.save",
  "timestamp": "2026-07-28T14:32:00+03:00",
  "card": {
    "id": "ulgen-benli",
    "name": "Ülgen Benli",
    "url": "https://example.com/"
  },
  "visitor": {
    "name": null,
    "email": null,
    "phone": null
  },
  "context": {
    "source": "web",
    "referrer": null
  }
}
```

| Field | Type | Required |
|---|---|---|
| `event` | `"card.save"` | yes |
| `timestamp` | ISO 8601 string | yes |
| `card.id` | string (slug) | yes |
| `card.name` | string | yes |
| `card.url` | string (URL) | yes |
| `visitor.name` / `.email` / `.phone` | string \| `null` | yes (nullable) |
| `context.source` | string, e.g. `"web"` | yes |
| `context.referrer` | string \| `null` | yes (nullable) |

### `meeting.request` — "Toplantı Talep Et"

Fires when a visitor requests a meeting. `requester.name` and `requester.email` are required (form must validate before sending); `phone`, `message`, `preferredTime` are optional.

```json
{
  "event": "meeting.request",
  "timestamp": "2026-07-28T14:35:00+03:00",
  "card": {
    "id": "ulgen-benli",
    "name": "Ülgen Benli"
  },
  "requester": {
    "name": "Ayşe Yılmaz",
    "email": "ayse@example.com",
    "phone": null
  },
  "message": null,
  "preferredTime": null,
  "context": {
    "source": "web",
    "referrer": null
  }
}
```

| Field | Type | Required |
|---|---|---|
| `event` | `"meeting.request"` | yes |
| `timestamp` | ISO 8601 string | yes |
| `card.id` / `card.name` | string | yes |
| `requester.name` | string | yes |
| `requester.email` | string | yes |
| `requester.phone` | string \| `null` | yes (nullable) |
| `message` | string \| `null` | yes (nullable) |
| `preferredTime` | ISO 8601 string \| `null` | yes (nullable) |
| `context.source` | string | yes |
| `context.referrer` | string \| `null` | yes (nullable) |

## Common mistakes

- Adding `import`/`export` to a component file — breaks, since files run as classic scripts, not ES modules.
- Putting the demo name/phone/email literal inside `ProfileCard.js` instead of `src/data/card.js`.
- Sending `undefined` instead of `null` for missing optional fields — always include the key with `null`.
- Loading a component's `<script>` tag before the data file or before a component it depends on.
