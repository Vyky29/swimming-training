from __future__ import annotations

from pathlib import Path
import re
import shutil


PROJECT_ROOT = Path(__file__).resolve().parent
DIST_DIR = PROJECT_ROOT / "dist"
PORTAL_ROOT = PROJECT_ROOT / "portal"
COMMON_ROOT = PROJECT_ROOT / "common"
TRAINING_ONE_ROOT = PROJECT_ROOT / "training-i"
TRAINING_TWO_ROOT = PROJECT_ROOT / "training-ii"
CONCEPT_STAGE_CSS_VERSION = "20260603"
CONCEPT_STAGE_CSS_FILE = COMMON_ROOT / "assets" / "concept-stage-system.css"
CONCEPT_STAGE_ORIGIN = "https://swimming-training.vercel.app"
CONCEPT_STAGE_STYLE_MARKER = "/* concept-stage-system: injected at build */"


def dist_paths(*relative_paths: str) -> list[Path]:
    return [DIST_DIR / relative_path for relative_path in relative_paths]


PORTAL_PAGES = [
    (
        PORTAL_ROOT / "index.html",
        dist_paths("index.html", "portal/index.html"),
        "portal",
    ),
    (
        PORTAL_ROOT / "induction" / "index.html",
        dist_paths("portal/induction/index.html"),
        "portal_induction",
    ),
]

TRAINING_ONE_PAGES = [
    (
        TRAINING_ONE_ROOT / "dashboard" / "index.html",
        dist_paths(
            "training-i/index.html",
            "swimming-portal/index.html",
            "swimming-training-i/index.html",
        ),
        "training1_hub",
    ),
    (
        TRAINING_ONE_ROOT / "modules" / "module-1" / "index.html",
        dist_paths("training-i/modules/module-1/index.html", "modules/module-1/index.html"),
        "training1_module1",
    ),
    (
        TRAINING_ONE_ROOT / "modules" / "module-2" / "index.html",
        dist_paths("training-i/modules/module-2/index.html", "modules/module-2/index.html"),
        "training1_module2",
    ),
    (
        TRAINING_ONE_ROOT / "modules" / "module-3" / "index.html",
        dist_paths("training-i/modules/module-3/index.html", "modules/module-3/index.html"),
        "training1_module3",
    ),
    (
        TRAINING_ONE_ROOT / "modules" / "module-4" / "index.html",
        dist_paths("training-i/modules/module-4/index.html", "modules/module-4/index.html"),
        "training1_module4",
    ),
    (
        TRAINING_ONE_ROOT / "modules" / "module-5" / "index.html",
        dist_paths("training-i/modules/module-5/index.html", "modules/module-5/index.html"),
        "training1_module5",
    ),
    (
        TRAINING_ONE_ROOT / "quizzes" / "module-1" / "index.html",
        dist_paths("training-i/quizzes/module-1/index.html", "quizzes/module-1/index.html"),
        "training1_quiz1",
    ),
    (
        TRAINING_ONE_ROOT / "quizzes" / "module-2" / "index.html",
        dist_paths("training-i/quizzes/module-2/index.html", "quizzes/module-2/index.html"),
        "training1_quiz2",
    ),
    (
        TRAINING_ONE_ROOT / "quizzes" / "module-3" / "index.html",
        dist_paths("training-i/quizzes/module-3/index.html", "quizzes/module-3/index.html"),
        "training1_quiz3",
    ),
    (
        TRAINING_ONE_ROOT / "quizzes" / "module-4" / "index.html",
        dist_paths("training-i/quizzes/module-4/index.html", "quizzes/module-4/index.html"),
        "training1_quiz4",
    ),
    (
        TRAINING_ONE_ROOT / "quizzes" / "module-5" / "index.html",
        dist_paths("training-i/quizzes/module-5/index.html", "quizzes/module-5/index.html"),
        "training1_quiz5",
    ),
]

TRAINING_TWO_PAGES = [
    (
        TRAINING_TWO_ROOT / "dashboard" / "index.html",
        dist_paths("training-ii/index.html", "swimming-training-ii/index.html"),
        "training2_hub",
    ),
    (
        TRAINING_TWO_ROOT / "introduction" / "index.html",
        dist_paths("training-ii/introduction/index.html"),
        "training2_introduction",
    ),
    (
        TRAINING_TWO_ROOT / "modules" / "module-1" / "index.html",
        dist_paths("training-ii/modules/module-1/index.html"),
        "training2_module1",
    ),
    (
        TRAINING_TWO_ROOT / "modules" / "module-2" / "index.html",
        dist_paths("training-ii/modules/module-2/index.html"),
        "training2_module2",
    ),
    (
        TRAINING_TWO_ROOT / "modules" / "module-3" / "index.html",
        dist_paths("training-ii/modules/module-3/index.html"),
        "training2_module3",
    ),
    (
        TRAINING_TWO_ROOT / "modules" / "module-4" / "index.html",
        dist_paths("training-ii/modules/module-4/index.html"),
        "training2_module4",
    ),
    (
        TRAINING_TWO_ROOT / "modules" / "module-5" / "index.html",
        dist_paths("training-ii/modules/module-5/index.html"),
        "training2_module5",
    ),
    (
        TRAINING_TWO_ROOT / "modules" / "module-6" / "index.html",
        dist_paths("training-ii/modules/module-6/index.html"),
        "training2_module6",
    ),
]

PORTAL_COMMON_REPLACEMENTS = [
    ('href="../assets/training-content-containment.css"', 'href="/assets/training-content-containment.css"'),
    ('href="https://www.clubsensational.org/swimmingtraining_modules1/"', 'href="/training-i/"'),
    ('href="../../Swimming Training II/index.html"', 'href="/training-ii/"'),
    ('href="https://www.clubsensational.org/swimmingtrainingmodules"', 'href="/training-i/"'),
    ('href="https://www.clubsensational.org/"', 'href="/portal/"'),
]

TRAINING_ONE_COMMON_REPLACEMENTS = [
    (
        'src="/shared/module-completion-flow.js"',
        'src="/shared/module-completion-flow.js?v=20260512"',
    ),
    (
        'src="/shared/concept-insight-content.js',
        'src="/shared/tts-controls.js?v=20260612"></script>\n<script src="/shared/concept-insight-content.js',
    ),
    (
        "@import url('/assets/module-completion-flow.css');",
        "@import url('/assets/module-completion-flow.css?v=20260512');",
    ),
    ('href="../assets/training-content-containment.css"', 'href="/assets/training-content-containment.css"'),
    ('href="assets/training-content-containment.css"', 'href="/assets/training-content-containment.css"'),
    ('href="https://www.clubsensational.org/swimmingtrainingmodules"', 'href="/training-i/"'),
    ('href="https://www.clubsensational.org/"', 'href="/portal/"'),
    ('href="../Training Portal/index.html"', 'href="/portal/"'),
    ('src="shared/parent-subconcept-layout.js"', 'src="/shared/parent-subconcept-layout.js"'),
]

TRAINING_ONE_PAGE_REPLACEMENTS = {
    "training1_hub": [
        ('href="https://www.clubsensational.org/trainingportal"', 'href="/portal/"'),
        ('href="https://www.clubsensational.org/module1-understanding-water/"', 'href="/training-i/modules/module-1/"'),
        ('href="https://www.clubsensational.org/emotionalstates-2-2-2/"', 'href="/training-i/modules/module-2/"'),
        (
            'href="https://www.clubsensational.org/module3-building-engagement-and-connection-in-the-water/"',
            'href="/training-i/modules/module-3/"',
        ),
        (
            'href="https://www.clubsensational.org/module4-the-clubsensational-swimming-programme/"',
            'href="/training-i/modules/module-4/"',
        ),
        (
            'href="https://www.clubsensational.org/module-5-using-visual-aids-effectively-pixtoleaern-in-action/"',
            'href="/training-i/modules/module-5/"',
        ),
    ],
    "training1_module1": [
        ('href="https://www.clubsensational.org/emotionalstates-2-2-2/"', 'href="/training-i/modules/module-2/"'),
        ('href="../Module 2/module 2. html"', 'href="/training-i/modules/module-2/"'),
    ],
    "training1_module2": [
        (
            'href="https://www.clubsensational.org/module3-building-engagement-and-connection-in-the-water/"',
            'href="/training-i/modules/module-3/"',
        ),
        (
            'href="../Module3/Module 3. Building engagement and connection in the water.html"',
            'href="/training-i/modules/module-3/"',
        ),
    ],
    "training1_module3": [
        (
            'href="../Module 4/Module 4. The clubSENsational Swimming Programme.html"',
            'href="/training-i/modules/module-4/"',
        ),
    ],
    "training1_module4": [
        ('href="../Module_5_Visual_Aids.html"', 'href="/training-i/modules/module-5/"'),
    ],
    "training1_quiz1": [
        ('href="../Module 2/module 2. html"', 'href="/training-i/modules/module-2/"'),
    ],
    "training1_quiz2": [
        (
            'href="../Module3/Module 3. Building engagement and connection in the water.html"',
            'href="/training-i/modules/module-3/"',
        ),
    ],
    "training1_quiz3": [
        (
            'href="../Module 4/Module 4. The clubSENsational Swimming Programme.html"',
            'href="/training-i/modules/module-4/"',
        ),
    ],
    "training1_quiz4": [
        ('href="../Module 5"', 'href="/training-i/modules/module-5/"'),
    ],
}

TRAINING_TWO_COMMON_REPLACEMENTS = [
    (
        'src="/shared/module-completion-flow.js"',
        'src="/shared/tts-controls.js?v=20260612"></script>\n<script src="/shared/module-completion-flow.js"',
    ),
    (
        "@import url('/assets/module-completion-flow.css');",
        "@import url('/assets/module-completion-flow.css?v=20260512');",
    ),
    ('href="assets/training-content-containment.css"', 'href="/training-ii/assets/training-content-containment.css"'),
    ('src="shared/parent-subconcept-layout.js"', 'src="/training-ii/shared/parent-subconcept-layout.js"'),
    ('href="course-navigation.css"', 'href="/training-ii/styles/course-navigation.css"'),
    ('href="training2-portal.css"', 'href="/training-ii/styles/training2-portal.css"'),
    ('href="training2-workspace.css"', 'href="/training-ii/styles/training2-workspace.css"'),
    ('src="course-navigation.js"', 'src="/training-ii/scripts/course-navigation.js"'),
    ('src="training2-hub.js"', 'src="/training-ii/scripts/training2-hub.js"'),
    ('src="training2-module-shell.js"', 'src="/training-ii/scripts/training2-module-shell.js"'),
    ('https://swimming-training-fresh-deploy.vercel.app/portal/', '/portal/'),
    ('https://www.clubsensational.org/swimmingtrainingmodules', '/training-ii/'),
    ("swimming-training-portal2.html", "/training-ii/"),
    ("swimming-training-introduction.html", "/training-ii/introduction/"),
    ("Javier-module1.html", "/training-ii/modules/module-1/"),
    ("Javier-module2.html", "/training-ii/modules/module-2/"),
    ("Javier-module3.html", "/training-ii/modules/module-3/"),
    ("Javier-module4.html", "/training-ii/modules/module-4/"),
    ("Javier-module5.html", "/training-ii/modules/module-5/"),
    ("Javier-module6.html", "/training-ii/modules/module-6/"),
]

STATIC_DIRECTORIES = [
    (COMMON_ROOT / "assets", DIST_DIR / "assets"),
    (COMMON_ROOT / "shared", DIST_DIR / "shared"),
    (TRAINING_TWO_ROOT / "assets", DIST_DIR / "training-ii" / "assets"),
    (TRAINING_TWO_ROOT / "shared", DIST_DIR / "training-ii" / "shared"),
]

TRAINING_TWO_STATIC_FILES = [
    (
        TRAINING_TWO_ROOT / "styles" / "course-navigation.css",
        DIST_DIR / "training-ii" / "styles" / "course-navigation.css",
    ),
    (
        TRAINING_TWO_ROOT / "styles" / "training2-portal.css",
        DIST_DIR / "training-ii" / "styles" / "training2-portal.css",
    ),
    (
        TRAINING_TWO_ROOT / "styles" / "training2-workspace.css",
        DIST_DIR / "training-ii" / "styles" / "training2-workspace.css",
    ),
    (
        TRAINING_TWO_ROOT / "styles" / "training2-module-template.css",
        DIST_DIR / "training-ii" / "styles" / "training2-module-template.css",
    ),
    (
        TRAINING_TWO_ROOT / "scripts" / "course-navigation.js",
        DIST_DIR / "training-ii" / "scripts" / "course-navigation.js",
    ),
    (
        TRAINING_TWO_ROOT / "scripts" / "training2-hub.js",
        DIST_DIR / "training-ii" / "scripts" / "training2-hub.js",
    ),
    (
        TRAINING_TWO_ROOT / "scripts" / "training2-module-shell.js",
        DIST_DIR / "training-ii" / "scripts" / "training2-module-shell.js",
    ),
]

NOT_FOUND_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page not found</title>
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 24px;
      font-family: Arial, sans-serif;
      background: #f3f8fb;
      color: #163247;
      text-align: center;
    }
    .card {
      max-width: 560px;
      padding: 32px;
      border-radius: 20px;
      background: #ffffff;
      box-shadow: 0 18px 40px rgba(18, 50, 71, 0.08);
    }
    a {
      color: #2d84b3;
      font-weight: 700;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <main class="card">
    <h1>Page not found</h1>
    <p>The page you requested is not available in the Swimming Training portal.</p>
    <p><a href=\"/portal/\">Return to the portal</a></p>
  </main>
</body>
</html>
"""


def reset_dist() -> None:
    if DIST_DIR.exists():
        shutil.rmtree(DIST_DIR)
    DIST_DIR.mkdir(parents=True, exist_ok=True)


def apply_replacements(text: str, replacements: list[tuple[str, str]]) -> str:
    updated = text
    for old, new in replacements:
        updated = updated.replace(old, new)
    return updated


def concept_stage_stylesheet_href() -> str:
    return f"/assets/concept-stage-system.css?v={CONCEPT_STAGE_CSS_VERSION}"


def enhance_training_html(html: str) -> str:
    """Inject concept-stage CSS inline and add cache-busted stylesheet links (relative + Vercel absolute fallback)."""
    if not CONCEPT_STAGE_CSS_FILE.exists() or '<div class="portal">' not in html:
        return html

    css = CONCEPT_STAGE_CSS_FILE.read_text(encoding="utf-8")
    css_href = concept_stage_stylesheet_href()
    abs_href = f"{CONCEPT_STAGE_ORIGIN}{css_href}"

    html = re.sub(
        r'href="/assets/concept-stage-system\.css(?:\?v=[^"]*)?"',
        f'href="{css_href}"',
        html,
    )
    html = re.sub(
        rf'href="{re.escape(CONCEPT_STAGE_ORIGIN)}/assets/concept-stage-system\.css(?:\?v=[^"]*)?"',
        f'href="{abs_href}"',
        html,
    )

    if CONCEPT_STAGE_STYLE_MARKER not in html:
        portal_idx = html.find('<div class="portal">')
        style_end = html.rfind('</style>', 0, portal_idx)
        if style_end != -1:
            html = html[:style_end] + f"\n{CONCEPT_STAGE_STYLE_MARKER}\n{css}\n" + html[style_end:]

    rel_link = f'<link rel="stylesheet" href="{css_href}" />'
    abs_link = f'<link rel="stylesheet" href="{abs_href}" crossorigin="anonymous" />'
    inline_block = f'<style data-concept-stage-system>{css}</style>'

    if rel_link not in html:
        html = html.replace('<div class="portal">', rel_link + "\n" + abs_link + "\n" + inline_block + "\n<div class=\"portal\">", 1)
    else:
        if abs_href not in html:
            html = html.replace(rel_link, rel_link + "\n" + abs_link, 1)
        if 'data-concept-stage-system' not in html:
            html = html.replace(rel_link, rel_link + "\n" + inline_block, 1)

    return html


def write_text(destination_path: Path, content: str) -> None:
    destination_path.parent.mkdir(parents=True, exist_ok=True)
    destination_path.write_text(content, encoding="utf-8")


def build_pages(
    pages: list[tuple[Path, list[Path], str]],
    common_replacements: list[tuple[str, str]],
    page_replacements: dict[str, list[tuple[str, str]]] | None = None,
) -> None:
    page_replacements = page_replacements or {}
    for source_path, destination_paths, page_key in pages:
        html = source_path.read_text(encoding="utf-8")
        html = apply_replacements(html, common_replacements)
        html = apply_replacements(html, page_replacements.get(page_key, []))
        html = enhance_training_html(html)
        for destination_path in destination_paths:
            write_text(destination_path, html)


def copy_static_directories(directories: list[tuple[Path, Path]]) -> None:
    for source_path, destination_path in directories:
        if not source_path.exists():
            continue
        shutil.copytree(source_path, destination_path, dirs_exist_ok=True)


def copy_training_two_static_files() -> None:
    for source_path, destination_path in TRAINING_TWO_STATIC_FILES:
        content = source_path.read_text(encoding="utf-8")
        content = apply_replacements(content, TRAINING_TWO_COMMON_REPLACEMENTS)
        write_text(destination_path, content)


def write_supporting_pages() -> None:
    write_text(DIST_DIR / "404.html", NOT_FOUND_HTML)


def main() -> None:
    reset_dist()
    copy_static_directories(STATIC_DIRECTORIES)
    copy_training_two_static_files()
    build_pages(PORTAL_PAGES, PORTAL_COMMON_REPLACEMENTS)
    build_pages(
        TRAINING_ONE_PAGES,
        TRAINING_ONE_COMMON_REPLACEMENTS,
        TRAINING_ONE_PAGE_REPLACEMENTS,
    )
    build_pages(TRAINING_TWO_PAGES, TRAINING_TWO_COMMON_REPLACEMENTS)
    write_supporting_pages()
    print(f"Built unified Swimming Training site into {DIST_DIR}")


if __name__ == "__main__":
    main()
