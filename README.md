# Testing-Automation

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
