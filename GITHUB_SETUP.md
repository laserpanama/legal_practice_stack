# GitHub Setup Guide - Legal Practice Stack

This guide provides step-by-step instructions for setting up and managing the Legal Practice Stack repository on GitHub.

## Initial Repository Setup

### Option 1: Using GitHub Web Interface (Recommended)

1. **Create a New Repository**
   - Go to https://github.com/new
   - Repository name: `legal_practice_stack`
   - Description: "A comprehensive law firm automation hub for Panama with Ley 81 compliance"
   - Choose visibility: Public or Private
   - Do NOT initialize with README, .gitignore, or license (we already have these)
   - Click "Create repository"

2. **Push Existing Code**
   - After creating the repository, GitHub will show you commands to push existing code
   - Run these commands in your local repository:

```bash
cd /home/ubuntu/legal_practice_stack

# Add the remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/legal_practice_stack.git

# Rename branch if needed
git branch -M main

# Push to GitHub
git push -u origin main
```

### Option 2: Using GitHub CLI

```bash
# Authenticate with GitHub
gh auth login

# Create repository
gh repo create legal_practice_stack \
  --public \
  --source=. \
  --remote=origin \
  --push \
  --description "A comprehensive law firm automation hub for Panama with Ley 81 compliance"
```

## Repository Structure

The repository is organized as follows:

```
legal_practice_stack/
├── client/                    # Frontend React application
├── server/                    # Backend Node.js/Express
├── drizzle/                   # Database schema and migrations
├── shared/                    # Shared types and constants
├── storage/                   # S3 storage helpers
├── .github/                   # GitHub configuration
│   ├── workflows/            # CI/CD workflows
│   └── ISSUE_TEMPLATE/       # Issue templates
├── docs/                      # Documentation
├── README.md                  # Project overview
├── DEPLOYMENT.md              # Deployment guide
├── GITHUB_SETUP.md            # This file
├── LICENSE                    # MIT License
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
├── vite.config.ts             # Vite config
└── todo.md                    # Project tracking
```

## Important Files to Include

Make sure these files are in your repository:

- ✅ `README.md` - Project overview and features
- ✅ `DEPLOYMENT.md` - Deployment instructions
- ✅ `LICENSE` - MIT License
- ✅ `.gitignore` - Files to exclude from git
- ✅ `package.json` - Dependencies and scripts
- ✅ `tsconfig.json` - TypeScript configuration
- ✅ All source code in `client/`, `server/`, `drizzle/`, etc.

## Files to Exclude from Git

Create a `.gitignore` file with:

```
# Dependencies
node_modules/
pnpm-lock.yaml
package-lock.json
yarn.lock

# Build outputs
dist/
build/
.next/

# Environment variables
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Temp files
tmp/
temp/
.cache/

# OS
Thumbs.db
.DS_Store

# Testing
coverage/
.nyc_output/

# Database
*.db
*.sqlite
*.sqlite3
```

## GitHub Features to Enable

### 1. Branch Protection Rules

1. Go to Settings → Branches
2. Add rule for `main` branch:
   - Require pull request reviews before merging
   - Require status checks to pass
   - Require branches to be up to date
   - Include administrators in restrictions

### 2. Code Owners

Create `.github/CODEOWNERS` file:

```
# Global owners
* @YOUR_USERNAME

# Specific areas
/client/ @YOUR_USERNAME
/server/ @YOUR_USERNAME
/drizzle/ @YOUR_USERNAME
```

### 3. Issue Templates

Create `.github/ISSUE_TEMPLATE/bug_report.md`:

```markdown
---
name: Bug Report
about: Report a bug to help us improve
title: '[BUG] '
labels: bug
assignees: ''
---

## Description
Brief description of the bug.

## Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

## Expected Behavior
What should happen?

## Actual Behavior
What actually happens?

## Environment
- OS: [e.g., Windows, macOS, Linux]
- Node version: [e.g., 22.13.0]
- Browser: [e.g., Chrome, Firefox]

## Screenshots
If applicable, add screenshots.

## Additional Context
Any other context?
```

### 4. Pull Request Template

Create `.github/pull_request_template.md`:

```markdown
## Description
Brief description of changes.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Fixes #(issue number)

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] No new warnings generated

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new console errors
```

## GitHub Actions CI/CD

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [22.x]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
    
    - name: Install pnpm
      uses: pnpm/action-setup@v2
      with:
        version: 10
    
    - name: Get pnpm store directory
      id: pnpm-cache
      shell: bash
      run: |
        echo "STORE_PATH=$(pnpm store path)" >> $GITHUB_OUTPUT
    
    - name: Setup pnpm cache
      uses: actions/cache@v3
      with:
        path: ${{ steps.pnpm-cache.outputs.STORE_PATH }}
        key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
        restore-keys: |
          ${{ runner.os }}-pnpm-store-
    
    - name: Install dependencies
      run: pnpm install
    
    - name: Run type check
      run: pnpm check
    
    - name: Run tests
      run: pnpm test
```

Create `.github/workflows/build.yml`:

```yaml
name: Build

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '22.x'
    
    - name: Install pnpm
      uses: pnpm/action-setup@v2
      with:
        version: 10
    
    - name: Install dependencies
      run: pnpm install
    
    - name: Build
      run: pnpm build
    
    - name: Upload build artifacts
      uses: actions/upload-artifact@v3
      with:
        name: build
        path: dist/
```

## Collaboration Guidelines

### Branching Strategy

Use Git Flow branching model:

```
main              - Production-ready code
├── develop       - Integration branch
├── feature/*     - New features
├── bugfix/*      - Bug fixes
├── hotfix/*      - Emergency fixes
└── release/*     - Release preparation
```

### Commit Message Convention

Follow Conventional Commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
```
feat(clients): add cédula validation
fix(billing): correct Balboa currency formatting
docs(readme): update installation instructions
```

### Pull Request Process

1. Create feature branch from `develop`
2. Make changes and commit with conventional messages
3. Push to GitHub
4. Create Pull Request with description
5. Wait for CI/CD checks to pass
6. Request review from team members
7. Address feedback
8. Merge when approved

## Repository Secrets

For CI/CD and automated deployments, add these secrets:

1. Go to Settings → Secrets and variables → Actions
2. Add the following secrets:

| Secret Name | Description |
|-------------|-------------|
| `DATABASE_URL` | Production database URL |
| `JWT_SECRET` | Session signing secret |
| `VITE_APP_ID` | OAuth application ID |
| `OAUTH_SERVER_URL` | OAuth server URL |
| `VITE_OAUTH_PORTAL_URL` | OAuth portal URL |

## Releases and Versioning

### Creating a Release

1. Go to Releases → Draft a new release
2. Choose a tag (e.g., `v1.0.0`)
3. Set release title and description
4. Upload release notes
5. Publish release

### Version Numbering

Use Semantic Versioning: `MAJOR.MINOR.PATCH`

- MAJOR: Breaking changes
- MINOR: New features (backward compatible)
- PATCH: Bug fixes

Example progression:
- `v1.0.0` - Initial release
- `v1.1.0` - New features added
- `v1.1.1` - Bug fix
- `v2.0.0` - Major breaking changes

## Documentation

### README.md Structure

Your README should include:
- Project title and description
- Features overview
- Technology stack
- Quick start guide
- Project structure
- API documentation
- Deployment instructions
- Contributing guidelines
- License

### Additional Documentation

Create `docs/` folder with:
- `ARCHITECTURE.md` - System design
- `API.md` - API reference
- `DATABASE.md` - Database schema
- `TESTING.md` - Testing guide
- `CONTRIBUTING.md` - Contribution guidelines

## Maintenance

### Regular Tasks

**Weekly:**
- Review and merge pull requests
- Monitor CI/CD status
- Check for dependency updates

**Monthly:**
- Update dependencies: `pnpm update`
- Review security advisories
- Create release if needed

**Quarterly:**
- Major version planning
- Architecture review
- Performance optimization

### Keeping Fork Updated

If you fork from another repository:

```bash
# Add upstream remote
git remote add upstream https://github.com/original-owner/legal_practice_stack.git

# Fetch upstream changes
git fetch upstream

# Merge upstream into main
git checkout main
git merge upstream/main
git push origin main
```

## Troubleshooting

### Authentication Issues

```bash
# Configure Git credentials
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# For HTTPS with token
git config --global credential.helper store
git push origin main  # Will prompt for token
```

### Large Files

If you accidentally committed large files:

```bash
# Remove from history
git filter-branch --tree-filter 'rm -f large_file' HEAD

# Force push
git push origin main --force
```

## Resources

- [GitHub Docs](https://docs.github.com)
- [Git Documentation](https://git-scm.com/doc)
- [Conventional Commits](https://www.conventionalcommits.org)
- [Semantic Versioning](https://semver.org)
- [GitHub Actions](https://github.com/features/actions)

## Support

For GitHub-related questions:
- Check GitHub documentation
- Open an issue on the repository
- Contact support@legalpracticestack.com

---

**Last Updated:** December 2025
