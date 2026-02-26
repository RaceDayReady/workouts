# @rdr/workouts

Shared workout schemas, types and utilities used by RDR and benchmarking tools.

## Releasing

This repo publishes from GitHub Actions when a new version is released.

### Release steps

1. Run checks locally:

- `npm ci`
- `npm run release:check`

2. Bump version and create a tag:

- `npm version patch` (or `minor` / `major`)

3. Update the `CHANGELOG.md`
4. Open a PR with the changes and merge
5. Create a new release

- Tag version `vX.Y.Z`
- Release title `Workouts vX.Y.Z`
- Paste the content from `CHANGELOG.md` into the description

The `publish.yml` workflow will automatically publish the new version to npm upon new release publish.
