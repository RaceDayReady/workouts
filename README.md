# @rbrooks/workouts

TypeScript package for workout schemas, shared types, and utilities used by integrations and benchmarking tools.

## Purpose

This package is intended to be the reusable core for:

- Workout schemas and types (sourced from `../rdr/`, especially `workout.types.ts`).
- Transformation/export helpers for 3rd-party integrations.
- Shared scoring/metrics logic used by applications like `../workout-bench`.

## Project Layout

- `src/workout.types.ts`: canonical exported type surface for consumers.
- `src/utils/`: pure utility modules (integration export, scoring, formatters, etc.).
- `src/index.ts`: public API barrel for package consumers.
- `dist/`: generated build output (do not edit directly).

## Maintenance Standards

### `src/index.ts` standards

- Export only stable, intentional APIs.
- Re-export from leaf modules (`workout.types`, `utils/*`) instead of defining logic in `index.ts`.
- Keep exports grouped and predictable (types first, then utility functions).
- Avoid breaking consumers:
  - Removing/renaming an exported symbol is a breaking change.
  - Changing a symbol's runtime behavior can also be breaking.
- Prefer named exports over default exports for long-term API clarity.

### Module design standards

- Keep utility functions pure where possible (deterministic in/out, no hidden side effects).
- Split integration-specific logic into dedicated files under `src/utils/`.
- Add/update exported types when behavior or payload shapes change.
- Keep runtime validation decisions explicit (either validate here or document expected pre-validated inputs).

### Formatting and type safety

- Run format check: `npm run lint`
- Auto-format: `npm run lint:fix`
- Type-check: `npm run type-check`
- Build package: `npm run build`
- Run full release gate: `npm run release:check`

Before every PR/release, run:

1. `npm run lint`
2. `npm run type-check`
3. `npm run build`
4. `npm pack --dry-run` (or just run `npm run release:check`)

## Syncing Types From `../rdr/`

When `../rdr/workout.types.ts` changes:

1. Update `src/workout.types.ts` to match the canonical source.
2. Update exports in `src/index.ts` if new types were added.
3. Run lint, type-check, and build.
4. Publish a new version if public API changed.

If this sync becomes frequent, add an automated sync/generation script and run it in CI.

## Versioning and Release Rules

Use semver:

- Patch (`x.y.Z`): fixes/internal changes with no public API impact.
- Minor (`x.Y.z`): backward-compatible new exports or features.
- Major (`X.y.z`): breaking API/behavior changes.

Recommended release process:

1. Confirm clean branch and passing checks.
2. Bump version in `package.json` (`npm version patch|minor|major`).
3. Push commit + tag.
4. Publish from the tagged commit.

## NPM Publish Guide

### One-time setup

1. Ensure package is publishable:
   - Set `private` to `false` in `package.json`.
   - Ensure `name` is correct and available (or use your scoped package).
2. Authenticate with npm:
   - `npm login`
3. Confirm access (for scoped/private packages, if applicable):
   - `npm access ls-packages <npm-user>`

### Publish steps

1. Build and verify:
   - `npm run lint`
   - `npm run type-check`
   - `npm run build`
2. Preview publish contents:
   - `npm pack --dry-run`
3. Publish:
   - Public scoped package: `npm publish --access public`
   - Private package (if your org plan allows): `npm publish`

### Post-publish checks

1. Verify version exists on npm.
2. Smoke test install in another repo:
   - `npm i <package-name>@<version>`

## CI Recommendation

At minimum, run on every PR:

1. `npm ci`
2. `npm run lint`
3. `npm run type-check`
4. `npm run build`
