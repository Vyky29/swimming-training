from __future__ import annotations

from pathlib import Path
import shutil


PROJECT_ROOT = Path(__file__).resolve().parent
WORKSPACE_ROOT = PROJECT_ROOT.parent
DIST_DIR = PROJECT_ROOT / "dist"

PORTAL_SOURCE = PROJECT_ROOT / "Training Portal" / "swimming-training-portal.html"

PAGES = [
    (
        PORTAL_SOURCE,
        [
            DIST_DIR / "index.html",
            DIST_DIR / "portal" / "index.html",
        ],
        "portal",
    ),
    (
        PROJECT_ROOT / "module 1. understanding water",
        [DIST_DIR / "modules" / "module-1" / "index.html"],
        "module1",
    ),
    (
        PROJECT_ROOT / "module 2. html",
        [DIST_DIR / "modules" / "module-2" / "index.html"],
        "module2",
    ),
    (
        PROJECT_ROOT / "Module 3. Building engagement and connection in the water.html",
        [DIST_DIR / "modules" / "module-3" / "index.html"],
        "module3",
    ),
    (
        PROJECT_ROOT / "Module 4. The clubSENsational Swimming Programme.html",
        [DIST_DIR / "modules" / "module-4" / "index.html"],
        "module4",
    ),
    (
        PROJECT_ROOT / "Module_5_Visual_Aids.html",
        [DIST_DIR / "modules" / "module-5" / "index.html"],
        "module5",
    ),
    (
        PROJECT_ROOT / "Quizzes" / "Quiz_Module_1_Understanding_Water.html",
        [DIST_DIR / "quizzes" / "module-1" / "index.html"],
        "quiz1",
    ),
    (
        PROJECT_ROOT / "Quizzes" / "Quiz_Module_2_Swimmers_Experience.html",
        [DIST_DIR / "quizzes" / "module-2" / "index.html"],
        "quiz2",
    ),
    (
        PROJECT_ROOT / "Quizzes" / "Quiz_Module_3_Engagement_Connection.html",
        [DIST_DIR / "quizzes" / "module-3" / "index.html"],
        "quiz3",
    ),
    (
        PROJECT_ROOT / "Quizzes" / "Quiz_Module_4_ClubSENsational_Programme.html",
        [DIST_DIR / "quizzes" / "module-4" / "index.html"],
        "quiz4",
    ),
    (
        PROJECT_ROOT / "Quizzes" / "Quiz_Module_5_Visual_Aids.html",
        [DIST_DIR / "quizzes" / "module-5" / "index.html"],
        "quiz5",
    ),
]

COMMON_REPLACEMENTS = [
    ('href="../assets/training-content-containment.css"', 'href="/assets/training-content-containment.css"'),
    ('href="assets/training-content-containment.css"', 'href="/assets/training-content-containment.css"'),
    ('href="https://www.clubsensational.org/swimmingtrainingmodules"', 'href="/portal/"'),
    ('href="https://www.clubsensational.org/"', 'href="/portal/"'),
    ('href="../Training Portal/index.html"', 'href="/portal/"'),
    ('src="shared/parent-subconcept-layout.js"', 'src="/shared/parent-subconcept-layout.js"'),
]

PAGE_REPLACEMENTS = {
    "portal": [
        ('href="https://www.clubsensational.org/swimmingtraining_modules1/"', 'href="/modules/module-1/"'),
        ('href="../../Swimming Training II/index.html"', 'href="#"'),
    ],
    "module1": [
        ('href="https://www.clubsensational.org/emotionalstates-2-2-2/"', 'href="/modules/module-2/"'),
        ('href="../Module 2/module 2. html"', 'href="/modules/module-2/"'),
    ],
    "module2": [
        (
            'href="https://www.clubsensational.org/module3-building-engagement-and-connection-in-the-water/"',
            'href="/modules/module-3/"',
        ),
        ('href="../Module3/Module 3. Building engagement and connection in the water.html"', 'href="/modules/module-3/"'),
    ],
    "module3": [
        ('href="../Module 4/Module 4. The clubSENsational Swimming Programme.html"', 'href="/modules/module-4/"'),
    ],
    "module4": [
        ('href="../Module_5_Visual_Aids.html"', 'href="/modules/module-5/"'),
    ],
    "quiz1": [
        ('href="../Module 2/module 2. html"', 'href="/modules/module-2/"'),
    ],
    "quiz2": [
        ('href="../Module3/Module 3. Building engagement and connection in the water.html"', 'href="/modules/module-3/"'),
    ],
    "quiz3": [
        ('href="../Module 4/Module 4. The clubSENsational Swimming Programme.html"', 'href="/modules/module-4/"'),
    ],
    "quiz4": [
        ('href="../Module 5"', 'href="/modules/module-5/"'),
    ],
}

STATIC_FILES = [
    (
        WORKSPACE_ROOT / "assets" / "training-content-containment.css",
        DIST_DIR / "assets" / "training-content-containment.css",
    ),
    (
        PROJECT_ROOT / "shared" / "parent-subconcept-layout.js",
        DIST_DIR / "shared" / "parent-subconcept-layout.js",
    ),
]


def reset_dist() -> None:
    if DIST_DIR.exists():
        shutil.rmtree(DIST_DIR)
    DIST_DIR.mkdir(parents=True, exist_ok=True)


def apply_replacements(text: str, replacements: list[tuple[str, str]]) -> str:
    updated = text
    for old, new in replacements:
        updated = updated.replace(old, new)
    return updated


def build_html(source_path: Path, destination_paths: list[Path], page_key: str) -> None:
    html = source_path.read_text(encoding="utf-8")
    html = apply_replacements(html, COMMON_REPLACEMENTS)
    html = apply_replacements(html, PAGE_REPLACEMENTS.get(page_key, []))

    for destination_path in destination_paths:
        destination_path.parent.mkdir(parents=True, exist_ok=True)
        destination_path.write_text(html, encoding="utf-8")


def copy_static_files() -> None:
    for source_path, destination_path in STATIC_FILES:
        destination_path.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source_path, destination_path)


def main() -> None:
    reset_dist()
    copy_static_files()
    for source_path, destination_paths, page_key in PAGES:
        build_html(source_path, destination_paths, page_key)
    print(f"Built Swimming Training site into {DIST_DIR}")


if __name__ == "__main__":
    main()
