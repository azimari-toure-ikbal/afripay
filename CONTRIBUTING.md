# Contributing to Afripay

First off, thank you for your interest in contributing to Afripay! We welcome contributions of all kinds: bug reports, feature requests, documentation improvements, tests, fixes, and new payment-processor integrations. This document explains how to get your changes merged smoothly.

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [How to Report Bugs](#how-to-report-bugs)
3. [How to Request New Features](#how-to-request-new-features)
4. [Getting Started Locally](#getting-started-locally)
5. [Branching & Workflow](#branching--workflow)
6. [Commit Message Guidelines](#commit-message-guidelines)
7. [Running Tests](#running-tests)
8. [Pull Request Process](#pull-request-process)
9. [Coding Standards](#coding-standards)
10. [License](#license)

---

### 1. Code of Conduct

Afripay follows the [Contributor Covenant v2.1](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). Please take a moment to read it. By participating, you agree to respect its guidelines.

---

### 2. How to Report Bugs

If you encounter a bug, please open an issue and include:

- **Title**: A short summary of the problem.
- **Description**: What you were trying to do, and what went wrong.
- **Steps to Reproduce**:
  1. Environment (Node version, OS, etc.)
  2. Exact code snippet you ran
  3. Full error message or unexpected behavior
- **Expected vs. Actual**: What you expected versus what actually happened.
- **Screenshots / Logs** (if applicable): Attach any relevant console output, stack trace, or screenshots.

That will help maintainers reproduce and fix the issue quickly.

---

### 3. How to Request New Features

Before opening a feature request, verify that it doesn’t already exist:

1. Search the issue tracker for keywords.
2. If nothing matches, open a new issue with:
   - **Title**: “Feature request: …”
   - **Description**: Explain the use case, why it matters, and any relevant context (URLs, examples, etc.).
   - **Possible Implementation**: (Optional) If you have ideas on how to implement, share them.

Maintainers will review and either accept, ask for clarification, or sometimes suggest alternative approaches.

---

### 4. Getting Started Locally

1. **Fork the repository**  
   Click “Fork” in the top-right corner of the GitHub page to create your own copy.

2. **Clone your fork**

   ```bash
   git clone git@github.com:<azimari-toure-ikbal>/afripay.git
   cd afripay
   ```

3. **Install dependencies**
   Afripay uses TypeScript and runs tests with Vitest. Make sure you have **Node.js ≥ 20** installed.

   ```bash
   npm install
   # or
   yarn install
   # or
   bun install
   # or
   pnpm install
   ```

4. **Set up environment variables**
   Create a `.env.local` (or `.env.test`) at project root:

```dotenv
# Wave
WAVE_API_KEY=your_wave_api_key

# Paydunya
PAYDUNYA_MASTER_KEY=your_master_key
PAYDUNYA_PRIVATE_KEY=your_private_key
PAYDUNYA_TOKEN=your_token

# Paytech
PAYTECH_API_KEY=your_paytech_api_key
PAYTECH_API_SECRET=your_paytech_secret

# Orange Money
OM_CLIENT_ID=your_orangemoney_client_id
OM_CLIENT_SECRET=your_orangemoney_client_secret
```

Adjust or omit variables for the providers you’re testing.

5. **Build the project**

```bash
npm install afripay
# or
yarn add afripay
# or
bun add afripay
# or
pnpm add afripay
```

---

### 5. Branching & Workflow

We use a simple branching strategy:

- **`main`** (branch): Always contains the latest stable release.
- **Feature branches**: Branch off from `main`, named `feature/<short-name>`.
- **Bugfix branches**: Branch off from `main`, named `bugfix/<short-description>`.

When your work is ready, push your branch to your fork and open a pull request against `main`.

---

### 6. Commit Message Guidelines

Please write clear, concise commit messages. We follow the [AngularJS commit message convention](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#commit) (a lightweight variant):

```
<type>(<scope>): <subject>

<body>           # optional, but encouraged
<footer>         # e.g., “Closes #123” to auto-link issues/PRs
```

- **type**: one of `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.
- **scope**: a short tag—e.g. `wave`, `paydunya`, `orange-money`, `core`.
- **subject**: brief summary in imperative mood, lowercase.

Examples:

```
feat(wave): add payWithWave timeout option
fix(paydunya): properly handle 401 unauthorized errors
docs(readme): update installation instructions
test: add Paytech integration tests
```

---

### 7. Running Tests

Afripay’s test suite uses [Vitest](https://vitest.dev/). To run all tests:

```bash
npm run test
# or
yarn test
# or
bun run test
# or
pnpm run test
```

If you add new functionality, please include corresponding unit tests under the `tests` directory (or next to your source file) and ensure they pass before submitting.

---

### 8. Pull Request Process

1. **Sync with upstream**
   Before opening a PR, pull from `main` (our upstream) to keep your branch up-to-date:

   ```bash
   git checkout main
   git pull origin main
   git checkout feature/my-feature
   git merge main
   ```

   Fix any merge conflicts locally.

2. **Push your branch**

   ```bash
   git push origin feature/my-feature
   ```

3. **Open a Pull Request** on GitHub from `azimari-toure-ikbal/afripay:feature/my-feature` → `afripay:main`.

4. **Fill the PR template** (if provided) or at minimum:

   - Describe the problem you fixed or the feature you added.
   - Show examples or code snippets if relevant.
   - Reference issue numbers (e.g., “Closes #45”).

5. **Review & feedback**

   - Maintainers will review and may request changes.
   - Address feedback by pushing commits to the same branch.

6. **Merge**
   Once approved and CI passes, a maintainer will merge your PR.

---

### 9. Coding Standards

- **TypeScript**: All new code must be written in TypeScript.

- **Directory Structure**:

  ```
  /src
    ├── orange-money/
    │     ├── index.ts
    │     └── types.ts
    ├── wave/
    │     ├── payWithWave.ts
    │     └── types.ts
    ├── paytech/
    │     ├── payWithPaytech.ts
    │     └── types.ts
    ├── paydunya/
    │     ├── payWithPaydunya.ts
    │     └── types.ts
    └── index.ts       # Re-exports all methods
  /tests          # All unit tests
  README.md
  CONTRIBUTING.md
  LICENSE
  package.json
  tsconfig.json
  tsdown.config.ts
  ...
  ```

  When adding a new provider (e.g., a new subdirectory under `src/`), follow the pattern:

  - `<provider>/index.ts` (exports the function(s) and types)
  - `<provider>/payWith<Provider>.ts` (contains the main logic)
  - `<provider>/types.ts` (contains request/response interfaces)
  - Tests go into `test/<provider>.test.ts`.

- **Error handling**:

  - If required environment variables are missing, throw a clear `Error('<VAR_NAME> is not set')`.
  - If the fetch response is not OK, throw `Error('Failed to create <Provider> payment request')`.

---

### 10. License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE). If a PR is accepted, you grant us the right to use your code under the same terms.

---

Thank you again for helping make Afripay better! If you have any questions, feel free to open an issue or reach out on our discussion board.
