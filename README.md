# Testing-Automation

## GitHub connection

Set `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, and `GITHUB_REDIRECT_URI` in
`.env`. The callback URL registered in GitHub must exactly match:

```text
http://localhost:3000/api/github/callback
```

The app supports both OAuth App credentials and GitHub App user authorization.
For a GitHub App, grant read access to repository metadata and contents, make
the app installable by the account that will connect, and install it for the
repositories that should appear in the workspace.

After changing `.env`, restart the Next.js development server.

## Browserless test execution

Configure the Browserless and Gemini values shown in `.env.example`, then apply
the idempotent execution schema migration:

```bash
npm run db:migrate:browserless
```

Run the production build and the disposable end-to-end Browserless smoke test:

```bash
npm run build
npm run start -- -p 3001
npm run test:browserless-smoke
```

The runner always attempts to persist a screenshot, Playwright trace, console
logs, and the database result. WebM video is also attempted when
`BROWSERLESS_ENABLE_VIDEO` is enabled, but Browserless Screen Recording requires
an account/plan with that feature available.
