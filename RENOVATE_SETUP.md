# Renovate Setup Guide

This repository is configured to automatically update `@audi2014/npmjs-test` package using Renovate with webhook triggers.

## What Was Configured

### 1. Renovate Configuration (`renovate.json`)
- **Beta branch**: Automatically updates to latest beta versions with pinned versions (no `^`)
- **Master branch**: Only updates to stable versions, requires manual merge
- **All dependencies**: Use pinned versions (strict versioning)

### 2. GitHub Actions Workflows

#### In App Repo (draft-semantic-release-app)
- `.github/workflows/renovate.yml` - Runs Renovate when triggered by webhook or on schedule

#### In Package Repo (draft-semantic-release)
- `.github/workflows/trigger-renovate.yml` - Triggers Renovate in app repo after version bump

## Setup Steps

### 1. Create GitHub Personal Access Tokens (PATs)

You need to create two PATs with the following scopes:

#### Token 1: `RENOVATE_TOKEN` (for app repo)
- Go to: https://github.com/settings/tokens/new
- Token name: `Renovate Bot Token`
- Scopes needed:
  - ✅ `repo` (Full control of private repositories)
  - ✅ `workflow` (Update GitHub Action workflows)
- Generate token and copy it

#### Token 2: `RENOVATE_TRIGGER_TOKEN` (for package repo)
- Go to: https://github.com/settings/tokens/new
- Token name: `Renovate Trigger Token`
- Scopes needed:
  - ✅ `repo` (Full control of private repositories)
- Generate token and copy it

### 2. Add Secrets to Repositories

#### In App Repo (draft-semantic-release-app)
1. Go to: `https://github.com/audi2014/draft-semantic-release-app/settings/secrets/actions`
2. Click "New repository secret"
3. Name: `RENOVATE_TOKEN`
4. Value: Paste Token 1
5. Click "Add secret"

#### In Package Repo (draft-semantic-release)
1. Go to: `https://github.com/audi2014/draft-semantic-release/settings/secrets/actions`
2. Click "New repository secret"
3. Name: `RENOVATE_TRIGGER_TOKEN`
4. Value: Paste Token 2
5. Click "Add secret"

### 3. Push Changes to Repositories

#### In App Repo (draft-semantic-release-app)
```bash
cd /Users/apiko827/Documents/pet-projects/draft-semantic-release-app
git add .
git commit -m "chore: setup Renovate with webhook triggers"
git push origin beta
git push origin master  # if you want it on master too
```

#### In Package Repo (draft-semantic-release)
```bash
cd /Users/apiko827/Documents/pet-projects/draft-semantic-release
git add .
git commit -m "chore: add Renovate trigger workflow"
git push origin beta
git push origin master  # if you want it on master too
```

### 4. Enable GitHub Actions (if not already enabled)
- Go to both repositories' Actions tab
- Enable Actions if prompted

## How It Works

### Automatic Flow (Beta Branch)
1. You commit changes to `@audi2014/npmjs-test` package on beta branch
2. GitHub Actions runs the "Release" workflow
3. Semantic-release publishes new version to npm (e.g., `1.8.0-beta.4`)
4. After Release workflow completes successfully, triggers Renovate via webhook
5. Renovate runs in app repo and detects new beta version
6. Creates PR with pinned version (`"@audi2014/npmjs-test": "1.8.0-beta.4"`)
7. **Auto-merges** if tests pass
8. Your app now uses the exact latest beta version

### Manual Flow (Master Branch)
1. You release stable version (e.g., `1.8.0`)
2. Release workflow completes and triggers Renovate
3. Renovate creates PR with pinned version
4. **Requires manual review and merge**

**Note**: The trigger queries the npm registry to get the actual published version using dist-tags:
- Beta branch → queries `npm view @audi2014/npmjs-test@beta`
- Master branch → queries `npm view @audi2014/npmjs-test@latest`

This ensures we're always using the version that was actually published to npm, not just what's in package.json.

## Testing the Setup

### Test Webhook Trigger
1. Go to package repo: `https://github.com/audi2014/draft-semantic-release/actions`
2. Select "Trigger Renovate on App" workflow
3. Click "Run workflow" on beta branch
4. Should trigger Renovate in app repo within seconds

### Test Renovate Manually
1. Go to app repo: `https://github.com/audi2014/draft-semantic-release-app/actions`
2. Select "Renovate" workflow
3. Click "Run workflow" on beta branch
4. Check if it creates/updates PRs for dependency updates

## Dependency Dashboard

Renovate will create an issue called "Dependency Dashboard" in your app repo. You can:
- View all pending updates
- Manually trigger updates by checking boxes
- See rate limit status

## How Version Detection Works

The trigger workflow uses **npm registry dist-tags** instead of reading package.json:

```bash
npm view @audi2014/npmjs-test@beta version  # for beta branch
npm view @audi2014/npmjs-test@latest version  # for master branch
```

**Why this approach?**
- ✅ Gets the actual version published to npm (source of truth)
- ✅ Works even if version isn't committed to git (like beta branch)
- ✅ Prevents false triggers if semantic-release fails before publish
- ✅ Handles dist-tags correctly (beta, latest, devel)

## Troubleshooting

### Renovate Not Triggering
- Check that secrets are set correctly
- Verify workflow files are on the correct branches
- Check Actions tab for failed workflows
- Look at workflow logs for error messages
- Verify package was actually published to npm with correct dist-tag: `npm view @audi2014/npmjs-test dist-tags`

### Auto-merge Not Working
- Ensure branch protection rules allow auto-merge
- Check that tests are passing
- Verify `automerge: true` in renovate.json

### Wrong Versions Being Suggested
- Check `ignoreUnstable` setting for master branch
- Verify branch-specific rules in renovate.json
- Check if package was published with correct prerelease tag

## Configuration Files

- `renovate.json` - Main Renovate configuration
- `.github/workflows/renovate.yml` - Runs Renovate in app repo
- `.github/workflows/trigger-renovate.yml` - Triggers from package repo

## Benefits of This Setup

✅ **Immediate updates** - No waiting for scheduled runs
✅ **Strict versioning** - No version range surprises
✅ **Branch-specific behavior** - Beta auto-merges, master requires review
✅ **Zero maintenance** - Fully automated for beta branch

## Next Steps

After setup is complete:
1. Test by publishing a new beta version
2. Watch the automated workflow in action
3. Adjust `renovate.json` settings as needed
4. Consider adding branch protection rules
