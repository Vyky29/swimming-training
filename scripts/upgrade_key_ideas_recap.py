#!/usr/bin/env python3
"""Upgrade Key Ideas / recap section markup. Idempotent."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

INTRO = (
    '<p class="key-ideas-recap__intro">'
    "A quick recap of the principles that guide safe, structured and individual progression."
    "</p>"
)


def transform_one_card(raw: str) -> str:
    raw = raw.strip()
    m = re.match(r"<(div|article)(\s+[^>]+)>([\s\S]*)</\1>\s*$", raw, re.IGNORECASE)
    if not m:
        return raw
    attrs, inner = m.group(2), m.group(3)
    cm = re.search(r'class="([^"]*)"', attrs)
    classes = cm.group(1) if cm else ""
    if "recap-takeaway-card" in classes:
        return raw
    if "recap-card" not in classes:
        return raw
    classes = classes.replace("recap-card", "recap-card recap-takeaway-card", 1)
    attrs2 = re.sub(r'class="[^"]*"', f'class="{classes}"', attrs, count=1)
    hm = re.search(r"<h4[^>]*>([\s\S]*?)</h4>", inner, re.IGNORECASE)
    pm = re.search(r"<p[^>]*>([\s\S]*?)</p>", inner, re.IGNORECASE)
    h4_inner = hm.group(1).strip() if hm else ""
    p_block = ""
    if pm:
        p_block = f'<p class="recap-takeaway-card__text">{pm.group(1).strip()}</p>'
    return (
        f"<article{attrs2}>"
        f'<div class="recap-takeaway-card__body">'
        f'<h4 class="recap-takeaway-card__title">{h4_inner}</h4>{p_block}'
        f"</div></article>"
    )


def close_section_body_div(s: str, open_pos: int) -> int | None:
    """open_pos at '<' of <div class="section-body">; return index after its closing </div>."""
    if not s.startswith("<div", open_pos):
        return None
    depth = 1
    i = open_pos + 4
    n = len(s)
    while i < n and s[i] != ">":
        i += 1
    i += 1
    while i < n:
        if s.startswith("<div", i) and (i + 4 >= n or s[i + 4] in " \t\n>/"):
            depth += 1
            i += 4
            continue
        if s.startswith("</div>", i):
            depth -= 1
            i += len("</div>")
            if depth == 0:
                return i
            continue
        i += 1
    return None


def upgrade_section_body_content(body_inner: str) -> str | None:
    """body_inner is inside <div class="section-body">...</div> (not including outer tags)."""
    if "key-ideas-recap__intro" in body_inner and "recap-takeaway-card" in body_inner:
        return None
    m = re.search(
        r'(<div class="section-title-row[^"]*">[\s\S]*?</div>\s*)'
        r'(<p class="key-ideas-recap__intro">[\s\S]*?</p>\s*)?'
        r'(<p class="lead">[\s\S]*?</p>\s*)?'
        r'(<div class="recap-stack)([^>]*>)([\s\S]*?)(</div>\s*)(<label\b[\s\S]*?</label>)',
        body_inner,
        re.DOTALL | re.IGNORECASE,
    )
    if not m:
        return None
    prefix = body_inner[: m.start()]
    suffix = body_inner[m.end() :]
    title_block, intro_opt, lead_opt, stack_a, stack_rest, stack_inner, stack_close, label = m.groups()
    cards = re.findall(
        r"<(?:div|article)\s+class=\"[^\"]*recap-card[^\"]*\"[^>]*>[\s\S]*?</(?:div|article)>",
        stack_inner,
        re.DOTALL | re.IGNORECASE,
    )
    if not cards:
        return None
    new_cards = "\n".join(transform_one_card(c) for c in cards)
    stack_open_full = stack_a + stack_rest
    if "recap-stack--key-ideas" not in stack_open_full:
        stack_open_full = stack_open_full.replace(
            'class="recap-stack"',
            'class="recap-stack recap-stack--key-ideas"',
            1,
        )
    footer = f'<div class="key-ideas-recap__footer">\n            {label.strip()}\n          </div>'
    stack_html = f"{stack_open_full}{new_cards}\n          {stack_close.strip()}\n          "
    intro_block = (intro_opt or "").strip()
    if not intro_block:
        intro_block = INTRO
    lead_part = lead_opt or ""
    middle = f"{title_block}{intro_block}\n            {lead_part}{stack_html}{footer}"
    return f"{prefix}{middle}{suffix}"


def process_html(text: str) -> tuple[str, bool]:
    changed = False
    for sid in ("recap", "keyideas"):
        search_from = 0
        while True:
            needle = f'id="{sid}"'
            i = text.find(needle, search_from)
            if i == -1:
                break
            sec_open = text.rfind("<section", 0, i)
            if sec_open == -1:
                search_from = i + 1
                continue
            sec_close = text.find("</section>", i)
            if sec_close == -1:
                break
            sec_close += len("</section>")
            section = text[sec_open:sec_close]
            body_open = section.find('<div class="section-body">')
            if body_open == -1:
                search_from = i + 1
                continue
            abs_body_open = sec_open + body_open
            first_gt = text.find(">", abs_body_open) + 1
            close_end = close_section_body_div(text, abs_body_open)
            if close_end is None:
                search_from = i + 1
                continue
            inner_end = close_end - len("</div>")
            body_inner = text[first_gt:inner_end]
            new_inner = upgrade_section_body_content(body_inner)
            if new_inner:
                text = text[:first_gt] + new_inner + text[inner_end:]
                changed = True
                search_from = first_gt + len(new_inner)
            else:
                search_from = i + 1
    return text, changed


def main() -> None:
    paths = sorted(ROOT.glob("training-i/modules/module-*/index.html")) + sorted(
        ROOT.glob("training-ii/modules/module-*/index.html")
    )
    for p in paths:
        raw = p.read_text(encoding="utf-8")
        new_raw, ok = process_html(raw)
        if ok:
            p.write_text(new_raw, encoding="utf-8")
        print(f"{'OK ' if ok else 'SKIP '}{p.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
