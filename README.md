# Swimming Training Unified Repo

This repo now combines:

- the main Swimming Training portal
- `Swimming Training I`
- `Swimming Training II`

`Swimming Training II` lives inside `training-ii/` and was imported with Git history preserved. The top-level `build_swimming_training.py` is the only build script that should be used for deployment.

## How it works

- Edit the source files in this repo.
- Run `python3 build_swimming_training.py`.
- The script generates a deployable site in `dist/`.
- Vercel should deploy `dist/`, not the raw source files.

## Source layout

- `portal/` -> main portal source
- `common/` -> shared assets and shared scripts used by portal + `Training I`
- `training-i/` -> `Swimming Training I` source
- `training-ii/` -> `Swimming Training II` source

## Source conventions

- Every editable page now lives as an `index.html` inside its own folder.
- `Training I` modules live in `training-i/modules/module-x/index.html`.
- `Training II` modules live in `training-ii/modules/module-x/index.html`.
- `Training II` scripts and styles are separated into `training-ii/scripts/` and `training-ii/styles/`.
- Old duplicated source files such as `swimmingportal`, the nested `training-ii` build script, and the nested `training-ii/vercel.json` were removed from the repo.

## Generated routes

- `/` and `/portal/` -> Swimming Training Portal
- `/training-i/` -> Swimming Training I dashboard
- `/training-i/modules/module-1/` -> Training I Module 1
- `/training-i/modules/module-2/` -> Training I Module 2
- `/training-i/modules/module-3/` -> Training I Module 3
- `/training-i/modules/module-4/` -> Training I Module 4
- `/training-i/modules/module-5/` -> Training I Module 5
- `/training-i/quizzes/module-1/` -> Training I Quiz 1
- `/training-i/quizzes/module-2/` -> Training I Quiz 2
- `/training-i/quizzes/module-3/` -> Training I Quiz 3
- `/training-i/quizzes/module-4/` -> Training I Quiz 4
- `/training-i/quizzes/module-5/` -> Training I Quiz 5
- `/training-ii/` -> Swimming Training II dashboard
- `/training-ii/introduction/` -> Training II introduction
- `/training-ii/modules/module-1/` -> Training II Module 1
- `/training-ii/modules/module-2/` -> Training II Module 2
- `/training-ii/modules/module-3/` -> Training II Module 3
- `/training-ii/modules/module-4/` -> Training II Module 4
- `/training-ii/modules/module-5/` -> Training II Module 5
- `/training-ii/modules/module-6/` -> Training II Module 6

Legacy aliases for older Training I routes are still generated in `dist/` so older links do not immediately break.

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

- Root Directory: repository root
- Build Command: `python3 build_swimming_training.py`
- Output Directory: `dist`

## GitHub flow

Recommended workflow:

1. Keep this folder as the source repo.
2. Create a branch for each change.
3. Merge into `main`.
4. Let Vercel redeploy automatically from GitHub.

Production deploys for this repo have been reliable when commits use the GitHub noreply identity for `Vyky29` (`275041081+Vyky29@users.noreply.github.com`). Commits authored with the local machine email have previously produced failed production deployments in Vercel.

## Notes

- The standalone Training I quiz pages are still available, even though the modules already include inline quizzes.
- `common/assets/` is copied into `dist/assets/`.
- `common/shared/` is copied into `dist/shared/`.
- `Training II` assets, scripts, styles, and shared files are namespaced into `dist/training-ii/` to avoid collisions with `Training I`.
- Do not create separate deployment config inside `training-i/` or `training-ii/`; the repo deploys from the root only.

## Local images

You can now keep project images inside this repo and deploy them with Vercel.

Recommended structure:

- `common/assets/images/module-1/`
- `common/assets/images/module-2/`
- `common/assets/images/module-3/`
- `common/assets/images/module-4/`
- `common/assets/images/module-5/`

How to use them:

1. Drop the image file into `common/assets/images/...`
2. Reference it in the HTML with an absolute path from the site root

Example:

```html
<img src="/assets/images/module-4/example-photo.jpg" alt="Example photo">
```

For replacements, just keep the same file name and overwrite it, or change the `src` to the new file.
