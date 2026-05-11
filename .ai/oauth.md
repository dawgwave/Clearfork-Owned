Google OAuth (NextAuth)

1.
Use **one Google Cloud project** (same Console login—e.g. SIG-Unifi / david@protectdfw.com) and **one OAuth 2.0 Web client** for Clearfork on **both** local dev and production. Same client produces **one** `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`; reuse those variables everywhere (`.env.local` for dev, production env for prod).

2.
Open Google Cloud Console  
https://console.cloud.google.com/

→ Select SIG-Unifi project (or whichever hosts Clearfork OAuth).

APIs & Services → OAuth consent screen  
https://console.cloud.google.com/auth/overview?authuser=7&project=sig-unifi

- Audience: User type: External (see step 3).
- Branding: Fill app name, support email, developer contact.
- Data Access: Scopes: 
  openid, 
  email https://www.googleapis.com/auth/userinfo.email
  profile https://www.googleapis.com/auth/userinfo.profile

3. Make user external

Make external?
Please choose the publishing status of your external app.

Publishing status


Testing
Apps still in development. Your app will only be available to users you add to the list of test users.

In production
Apps ready for the public. Your app will be available to anyone with a Google Account.


- **Testing vs Production**: While publishing stays optional for external testers, use **Test users** for emails that must sign in before consent screen is “In production”—same consent screen serves dev and prod when redirect URIs are registered below.

4.
APIs & Services → Credentials → + Create credentials → OAuth client ID

- Application type: **Web application**.
- Name: **one name**, e.g. `Clearfork Insurance Web` (do **not** create separate clients for “local” vs “prod”).
- **Authorized JavaScript origins** — put **both** on this single client:
  - `http://localhost:3000`
  - `https://clearforkinsurance.com`
- **Authorized redirect URIs** — same client must include **every** callback Google might redirect to (no trailing slash on the path):
  - `http://localhost:3000/api/auth/callback/google`
  - `https://clearforkinsurance.com/api/auth/callback/google`

Create → copy Client ID and Client secret once — use in **all** environments:

5.
```env
GOOGLE_CLIENT_ID=....apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...
```

**`NEXTAUTH_URL`** must still match how users reach the app (dev: `http://localhost:3000`, prod: `https://clearforkinsurance.com`). Only that variable changes per deployment; Google credentials stay identical.

If sign-in fails: consent screen state / test users, and redirect URI **exact** match (scheme, host, port, path).


Apple Sign in with Apple (NextAuth)

Use **one Apple Developer account**, **one App ID**, **one Services ID**, and **one Sign in with Apple key (.p8)** for Clearfork everywhere. Same `APPLE_ID` (Services ID) and the same key material across environments; **`APPLE_SECRET`** is always the JWT signed with that key (regenerate before expiry—typically same script/process for dev and prod).

A. App ID (container for the capability)

Certificates, Identifiers & Profiles → Identifiers → +  
App IDs → App → create an App ID, enable Sign in with Apple.

B. Services ID (this is `APPLE_ID` / web client id)

Identifiers → + → Services IDs  
Identifier: e.g. `com.sig.clearforkinsurance.web` (reverse-DNS; unique).  
Enable Sign in with Apple → Configure  
Primary App ID: pick (A).  

**Domains and subdomains** — same Services ID can serve prod (and tunnel domain if you test locally):

- Production: `clearforkinsurance.com` (no `https://`).
- Local Apple web login cannot use plain `http://localhost` as Return URL in Apple’s portal; either test Sign in with Apple against **production** `NEXTAUTH_URL`, or add an **HTTPS tunnel** domain (e.g. ngrok) here when you need local Apple flows.

**Return URLs** — register **all** callbacks this Services ID will use on **one** configuration:

- `https://clearforkinsurance.com/api/auth/callback/apple`
- `https://www.clearforkinsurance.com/api/auth/callback/apple` if needed
- Optionally a tunnel: `https://<your-subdomain>.ngrok-free.app/api/auth/callback/apple`

Save. **`APPLE_ID`** = this Services ID string.

C. Key (.p8) for the client secret JWT

Keys → + → enable Sign in with Apple → Primary App ID (A) → Register → download `.p8` once. Keep **Key ID**.  
Team ID: Membership → **Team ID**.

Do **not** paste raw `.p8` into `APPLE_SECRET`. **`APPLE_SECRET`** = short-lived **JWT** (ES256), signed with that `.p8`:

- `iss` = Team ID  
- `iat` / `exp` = now / expiry (≤ ~6 months per Apple)  
- `aud` = `https://appleid.apple.com`  
- `sub` = Services ID (same as `APPLE_ID`)

Use a generator or small script; rotate before `exp`. Same JWT can be used on dev and prod hosts **only when** both use the same Services ID and callback hosts Apple knows—usually you regenerate when deploying if secrets differ per env file.

D. Env summary (one identity, deployment-specific URL only)

```env
NEXTAUTH_URL=http://localhost:3000   # or https://clearforkinsurance.com in prod
NEXTAUTH_SECRET=...                   # can differ per env or stay one secret—your choice
APPLE_ID=<Services ID>
APPLE_SECRET=<client secret JWT>
```

Redirect must always be `{NEXTAUTH_URL}/api/auth/callback/apple` and that URL must appear in Return URLs for this Services ID.


Quick checklist (single account model)

| Item | Google | Apple |
|------|--------|--------|
| Accounts | One GCP project, **one** Web OAuth client | One Developer account, **one** Services ID + **one** key |
| Env vars | Same `GOOGLE_*` in `.env.local` and prod | Same `APPLE_ID`; same key → regenerate JWT → update `APPLE_SECRET` wherever needed |
| Per deployment | Only `NEXTAUTH_URL` (and optionally `NEXTAUTH_SECRET`) changes | Same; `NEXTAUTH_URL` must match a registered Return URL |
| Redirect path | `/api/auth/callback/google` | `/api/auth/callback/apple` |
