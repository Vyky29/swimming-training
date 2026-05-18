#!/usr/bin/env python3
"""Move Module/Block labels outside journey circles in training module HTML."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CSS_LINK = '  <link rel="stylesheet" href="/assets/journey-node-layout.css" />\n'
CSS_MARKER = 'journey-editorial-hierarchy.css'

MODULE_RE = re.compile(
    r'<div class="journey-circle">\s*'
    r'<span class="journey-node__kicker">Module</span>\s*'
    r'<span class="journey-node__num">(\d+)</span>\s*'
    r'</div>',
    re.MULTILINE,
)

MODULE_COMPACT_RE = re.compile(
    r'<div class="journey-circle"><span class="journey-node__kicker">Module</span>'
    r'<span class="journey-node__num">(\d+)</span></div>'
)

BLOCK_RE = re.compile(
    r'<div class="journey-circle">\s*'
    r'<span class="module-roadmap__node-kicker">Block</span>\s*'
    r'<span class="module-roadmap__node-num">(\d+)</span>\s*'
    r'</div>',
    re.MULTILINE,
)


def patch_module_circle(match: re.Match[str]) -> str:
    n = match.group(1)
    return (
        '<div class="journey-node">'
        '<span class="journey-node__kicker">Module</span>'
        f'<div class="journey-circle"><span class="journey-node__num">{n}</span></div>'
        '</div>'
    )


def patch_block_circle(match: re.Match[str]) -> str:
    n = match.group(1)
    return (
        '<div class="journey-node">'
        '<span class="module-roadmap__node-kicker">Block</span>'
        f'<div class="journey-circle"><span class="module-roadmap__node-num">{n}</span></div>'
        '</div>'
    )


def ensure_css_link(text: str) -> str:
    if 'journey-node-layout.css' in text:
        return text
    if f'href="/assets/{CSS_MARKER}"' not in text:
        return text
    return text.replace(
        f'  <link rel="stylesheet" href="/assets/{CSS_MARKER}" />',
        f'  <link rel="stylesheet" href="/assets/{CSS_MARKER}" />\n{CSS_LINK.strip()}',
        1,
    )


def patch_file(path: Path) -> bool:
    original = path.read_text(encoding='utf-8')
    updated = MODULE_COMPACT_RE.sub(patch_module_circle, original)
    updated = MODULE_RE.sub(patch_module_circle, updated)
    updated = BLOCK_RE.sub(patch_block_circle, updated)
    updated = ensure_css_link(updated)
    if updated != original:
        path.write_text(updated, encoding='utf-8')
        return True
    return False


def main() -> None:
    changed = 0
    for pattern in ('training-i/modules/*/index.html', 'training-ii/modules/*/index.html'):
        for path in sorted(ROOT.glob(pattern)):
            if patch_file(path):
                print('patched', path.relative_to(ROOT))
                changed += 1
    print(f'done ({changed} files)')


if __name__ == '__main__':
    main()
