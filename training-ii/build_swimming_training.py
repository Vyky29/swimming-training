from pathlib import Path
import shutil


ROOT = Path(__file__).parent
DIST = ROOT / "dist"

SOURCE_ROUTES = {
    "swimming-training-portal2.html": [
        DIST / "index.html",
        DIST / "swimming-training-ii" / "index.html",
    ],
    "swimming-training-introduction.html": [
        DIST / "introduction" / "index.html",
    ],
    "Javier-module1.html": [
        DIST / "modules" / "module-1" / "index.html",
    ],
    "Javier-module2.html": [
        DIST / "modules" / "module-2" / "index.html",
    ],
    "Javier-module3.html": [
        DIST / "modules" / "module-3" / "index.html",
    ],
    "Javier-module4.html": [
        DIST / "modules" / "module-4" / "index.html",
    ],
    "Javier-module5.html": [
        DIST / "modules" / "module-5" / "index.html",
    ],
    "Javier-module6.html": [
        DIST / "modules" / "module-6" / "index.html",
    ],
}

STATIC_FILES = [
    "course-navigation.css",
    "course-navigation.js",
    "training2-portal.css",
    "training2-workspace.css",
    "training2-hub.js",
    "training2-module-shell.js",
]

REPLACEMENTS = [
    ('href="assets/training-content-containment.css"', 'href="/assets/training-content-containment.css"'),
    ('href="course-navigation.css"', 'href="/course-navigation.css"'),
    ('href="training2-portal.css"', 'href="/training2-portal.css"'),
    ('src="course-navigation.js"', 'src="/course-navigation.js"'),
    ('href="training2-workspace.css"', 'href="/training2-workspace.css"'),
    ('src="training2-hub.js"', 'src="/training2-hub.js"'),
    ('src="training2-module-shell.js"', 'src="/training2-module-shell.js"'),
    ("swimming-training-portal2.html", "/swimming-training-ii/"),
    ("swimming-training-introduction.html", "/introduction/"),
    ("Javier-module1.html", "/modules/module-1/"),
    ("Javier-module2.html", "/modules/module-2/"),
    ("Javier-module3.html", "/modules/module-3/"),
    ("Javier-module4.html", "/modules/module-4/"),
    ("Javier-module5.html", "/modules/module-5/"),
    ("Javier-module6.html", "/modules/module-6/"),
]


def reset_dist() -> None:
    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir(parents=True, exist_ok=True)


def transform_text(text: str) -> str:
    for old, new in REPLACEMENTS:
        text = text.replace(old, new)
    return text


def write_text(target: Path, content: str) -> None:
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(content, encoding="utf-8")


def copy_source_routes() -> None:
    for source_name, targets in SOURCE_ROUTES.items():
        source_path = ROOT / source_name
        content = transform_text(source_path.read_text(encoding="utf-8"))
        for target in targets:
            write_text(target, content)


def copy_static_files() -> None:
    for file_name in STATIC_FILES:
        source_path = ROOT / file_name
        content = transform_text(source_path.read_text(encoding="utf-8"))
        write_text(DIST / file_name, content)


def copy_directory(name: str) -> None:
    source_dir = ROOT / name
    if not source_dir.exists():
        return
    target_dir = DIST / name
    shutil.copytree(source_dir, target_dir, dirs_exist_ok=True)


def write_404() -> None:
    content = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="refresh" content="0; url=/swimming-training-ii/" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Redirecting</title>
</head>
<body>
  <p><a href="/swimming-training-ii/">Open Swimming Training II dashboard</a></p>
</body>
</html>
"""
    write_text(DIST / "404.html", content)


def main() -> None:
    reset_dist()
    copy_source_routes()
    copy_static_files()
    copy_directory("assets")
    copy_directory("shared")
    write_404()
    print("Built Swimming Training II to", DIST)


if __name__ == "__main__":
    main()
