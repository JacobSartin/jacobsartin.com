# Dependency updates

Use Renovate for this repository. It understands the npm dependencies in
`frontend/package.json`, the pinned pnpm version, the aliases in the pnpm catalog,
and the action references in all four GitHub workflows.

## Renovate or Dependabot?

Both can update npm packages and GitHub Actions, group related updates, and delay
new releases. Dependabot is built into GitHub and has fewer setup steps. Renovate
fits this project better because of its pnpm catalog support, configurable
package groups, dependency dashboard, and periodic lockfile maintenance.

This project uses pnpm 12's two-document lockfile. GitHub currently documents that
Dependabot version updates can work with that format, but its built-in dependency
graph parser does not detect the dependencies. Switching update bots alone does
not fix that: Renovate's vulnerability alert integration also relies on GitHub's
graph and alerts.

The Dependency graph workflow works around the parser limitation by submitting
the resolved dependency graph directly through GitHub's dependency submission
API. GitHub can generate Dependabot alerts for submitted npm dependencies. The
workflow runs on every push to `main` and can also be dispatched manually on
`main`. Enable Dependabot alerts in the repository settings; Renovate can then
use those alerts to propose security fixes outside its regular schedule.

The workflow uses the GitHub-maintained Component Detection submission action.
Its current scanner release, Component Detection 8.0.5, explicitly supports both
pnpm lockfile documents, including package-manager dependencies. The action
fetches the current scanner release. `fail-on-empty` prevents a successful empty
submission from silently hiding dependencies. Scanning does not install packages
or execute their scripts. Only the submission job gets `contents: write`; PR CI
keeps read access. The weekly `pnpm audit` remains an independent check.

References: [Renovate's npm manager](https://docs.renovatebot.com/modules/manager/npm/),
[Renovate's GitHub Actions manager](https://docs.renovatebot.com/modules/manager/github-actions/),
[Dependabot grouping and cooldowns](https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference),
[GitHub's pnpm lockfile limitation](https://docs.github.com/en/code-security/reference/supply-chain-security/supported-ecosystems-and-repositories#pnpm),
and [Renovate's vulnerability alert integration](https://docs.renovatebot.com/configuration-options/#vulnerabilityalerts).

Submission references: [GitHub's dependency submission API](https://docs.github.com/en/rest/dependency-graph/dependency-submission),
[Component Detection 8.0.5](https://github.com/microsoft/component-detection/releases/tag/v8.0.5),
and the [submission action](https://github.com/advanced-security/component-detection-dependency-submission-action).

## Update policy

The repository's `renovate.json` configures:

- New update branches on Mondays before 07:00 in America/Chicago. Hosted bot runs
  are queued, so this is a permitted window rather than an exact start time.
- A three-day release cooldown. `minimumReleaseAge: 4320` in
  `frontend/pnpm-workspace.yaml` applies the same delay to indirect dependencies
  during installation.
- Weekly lockfile maintenance to refresh indirect dependencies without waiting
  for a change to `package.json`.
- Separate groups for React and its types, TanStack Router/Start, and the Vite+
  toolchain. Other npm minor/patch updates form a shared group. GitHub Actions
  minor/patch and commit updates form another group.
- Major upgrades separated from minor/patch updates. Redact gets its own PR,
  including its potentially breaking 0.x minor releases.
- Node and its types restricted to version 24. Upgrade the CI runtime, types, and
  this rule together when deliberately changing Node major versions.
- At most five open update PRs and no automatic merging.
- Actions pinned to release commits, with readable version comments. Renovate
  maintains both the commits and the version comments.

The Vite+ catalog aliases `vite` to `@voidzero-dev/vite-plus-core`; that package and
`vite-plus` must remain aligned. They belong to one update group. Router, Start,
and their devtools have independent version numbers, so grouping them does not
mean forcing them to the same version.

## Activate Renovate

1. Install or enable the [Renovate GitHub App](https://github.com/apps/renovate)
   for `JacobSartin/jacobsartin.com`. Grant access to this repository only if you
   do not want it scanning your other repositories. This is the hosted app; no
   bot token or scheduled Renovate workflow is needed in this repository.
2. Merge `renovate.json` onto `main`. The app needs both repository access and a
   configuration on the default branch before this policy takes effect.
3. Check the Dependency Dashboard issue and the first update PR. Confirm the PR
   includes the lockfile, the artifact update check passes, and `CI / build`
   succeeds. The first live PR is the final check of the hosted bot's pnpm 12
   environment.

Use only one bot for version update PRs to avoid duplicate branches. Keep
Dependabot alerts enabled: the submitted graph restores their npm dependency
coverage. After merging, confirm the Dependency graph workflow succeeds and
`frontend/pnpm-lock.yaml` lists React and the other resolved packages under
Insights > Dependency graph. The submission and weekly audit run independently
of the Renovate app.

## Review and verify

Review changelogs and the version ranges, then run from `frontend/`:

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm typecheck
pnpm audit --audit-level=high
pnpm build
```

Also build with `VITE_BASE_PATH=/jacobsartin.com/` for the GitHub Pages mirror.
The build's post-processing verifies all nine prerendered routes, unique page
metadata, and the 404 fallback. Preview the site when a runtime package changes;
static checks cannot prove interactive behavior.

The October refresh passed formatting, linting, both type checks, the audit, and
both production builds. Renovate's strict repository config validation passed,
and its extractors detected both npm manifests, the Vite+ catalog alias, the pnpm
pin, and all four workflows. Component Detection 8.0.5 found all 287 packages in
both lockfile documents from a clean fixture with no installed dependencies,
including React 19.3.1 and pnpm 12.15.0. Actual submission and alert ingestion run
after merging to `main`. Local install and frozen-lockfile verification used the
compatible JavaScript pnpm 11.28.8 CLI because this Windows session cannot write
the native pnpm 12 lock directory. Linux PR CI also passed the native pnpm
12.15.0 frozen installation, formatting/lint/type checks, audit, and production
build. The committed package-manager pin remains 12.15.0.

CI runs for pull requests, every Monday at 13:00 UTC, and on manual dispatch. A
high or critical advisory fails the audit. Scheduled runs catch new advisories in
an unchanged lockfile; normal Renovate updates and lockfile maintenance provide
fix proposals. Review an urgent security fix directly if waiting for the weekly
window or release cooldown would be inappropriate. The schedule and cooldown
reduce routine update churn; they do not replace advisory review.

Automatic merging is intentionally disabled. If enabled later, require a
successful `CI / build` check in a GitHub ruleset before allowing the bot to merge.
Merging to `main` triggers the production and Pages deployments.

## October 2026 update

The dependency refresh moves React/React DOM to 19.3.1, Vite+ and its core to 1.4.0,
pnpm to 12.15.0, TypeScript to 7.0.2, the React Vite plugin to 6.1.2, and
react-colorful to 5.8.1. React types follow 19.3; Node types follow 24.19.2 for CI.
The other direct packages were already current.

Redact stays at 0.1.4. Version 0.2.0 was published on October 25 in America/Chicago
(October 26 UTC), inside the release cooldown, and changes the alternative React
runtime. Renovate will propose it separately once eligible.

The workflows use checkout 7.0.1, setup-vp 1.22.0, configure-pages 6.0.0,
upload-pages-artifact 5.0.0, deploy-pages 5.0.1, and the Component Detection
submission action 0.2.0. The Pages upload includes hidden files so the generated
`.nojekyll` is retained.
