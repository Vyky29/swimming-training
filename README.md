# Swimming Training Deployment

This folder now works as the source project for the Swimming Training Portal, modules 1-5, and the standalone quiz pages.

## How it works

- Keep editing the original source files in this folder.
- Run `python3 build_swimming_training.py`.
- The script generates a deployable site in `dist/`.
- Vercel should deploy `dist/`, not the raw source files.

## Generated routes

- `/` and `/portal/` -> Swimming Training Portal
- `/modules/module-1/` -> Module 1
- `/modules/module-2/` -> Module 2
- `/modules/module-3/` -> Module 3
- `/modules/module-4/` -> Module 4
- `/modules/module-5/` -> Module 5
- `/quizzes/module-1/` -> Quiz 1
- `/quizzes/module-2/` -> Quiz 2
- `/quizzes/module-3/` -> Quiz 3
- `/quizzes/module-4/` -> Quiz 4
- `/quizzes/module-5/` -> Quiz 5

## Local preview

From this folder:

```bash
python3 build_swimming_training.py
cd dist
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Local CLI tools

I installed local copies of Node.js, GitHub CLI, and Vercel CLI in the workspace so this project does not depend on system-wide installs.

From this folder you can enable them with:

```bash
source ./use-local-tools.sh
```

That exposes:

- `node`
- `npm`
- `gh`
- `vercel`

## Vercel settings

When you create the Vercel project:

- Root Directory: `Swimming Training : Modules`
- Build Command: `python3 build_swimming_training.py`
- Output Directory: `dist`

## GitHub flow

Recommended workflow:

1. Keep this folder as the source repo.
2. Create a branch for each change.
3. Merge into `main`.
4. Let Vercel redeploy automatically from GitHub.

## Notes

- The standalone quiz pages are still available, even though the modules already include inline quizzes.
- The shared stylesheet is copied into `dist/assets/`.
- The shared JS file is copied into `dist/shared/`.
