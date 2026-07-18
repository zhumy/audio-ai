#!/usr/bin/env python3
"""Report course-page navigation, anchor, and local-link integrity."""

from __future__ import annotations

import argparse
import json
import re
from dataclasses import dataclass, field
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit


@dataclass
class PageData:
    ids: list[str] = field(default_factory=list)
    links: list[str] = field(default_factory=list)
    outline_links: list[str] = field(default_factory=list)
    outline_count: int = 0
    session_route_count: int = 0
    session_route_nav_count: int = 0
    math_count: int = 0


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.data = PageData()
        self._outline_depth = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = {key: value or "" for key, value in attrs}
        element_id = values.get("id")
        if element_id:
            self.data.ids.append(element_id)

        if "data-session-route" in values:
            self.data.session_route_count += 1
        if tag == "nav" and "data-session-route-nav" in values:
            self.data.session_route_nav_count += 1
        if tag == "math":
            self.data.math_count += 1

        is_outline = tag == "nav" and (
            "data-course-outline" in values
            or values.get("aria-label") in {"本章主线", "章节主线"}
        )
        if is_outline:
            self.data.outline_count += 1
            self._outline_depth += 1
        elif self._outline_depth:
            self._outline_depth += 1

        if tag == "a" and values.get("href"):
            href = values["href"]
            self.data.links.append(href)
            if self._outline_depth:
                self.data.outline_links.append(href)

    def handle_endtag(self, tag: str) -> None:
        if self._outline_depth:
            self._outline_depth -= 1


def candidate_pages(root: Path) -> list[Path]:
    ignored_parts = {".git", "node_modules", "dist"}
    return sorted(
        page
        for page in root.rglob("*.html")
        if page.is_file() and not ignored_parts.intersection(page.relative_to(root).parts)
    )


def local_target(page: Path, href: str) -> Path | None:
    parts = urlsplit(href)
    if parts.scheme or parts.netloc or not parts.path:
        return None
    return (page.parent / unquote(parts.path)).resolve()


def html_ids(path: Path) -> set[str]:
    if path.is_dir():
        path = path / "index.html"
    if not path.is_file() or path.suffix.lower() != ".html":
        return set()
    parser = PageParser()
    parser.feed(path.read_text(encoding="utf-8"))
    return set(parser.data.ids)


def page_kind(root: Path, page: Path) -> str:
    relative = page.relative_to(root)
    if len(relative.parts) == 3 and relative.parts[0] == "chapters" and relative.name == "index.html":
        return "chapter"
    if len(relative.parts) == 3 and relative.parts[0] == "session" and relative.name == "index.html":
        return "session"
    return "other"


def css_declarations(body: str) -> dict[str, str]:
    declarations: dict[str, str] = {}
    for declaration in body.split(";"):
        if ":" not in declaration:
            continue
        name, value = declaration.split(":", 1)
        declarations[name.strip().lower()] = value.strip().lower()
    return declarations


def css_rule(text: str, selector: str) -> dict[str, str]:
    pattern = re.compile(
        rf"(?ms)^\s*{re.escape(selector)}\s*\{{(?P<body>[^{{}}]*)\}}"
    )
    match = pattern.search(text)
    return css_declarations(match.group("body")) if match else {}


def local_outline_conflicts(text: str) -> list[str]:
    protected_container = {
        "position",
        "top",
        "z-index",
        "background",
        "background-color",
        "box-shadow",
        "backdrop-filter",
        "-webkit-backdrop-filter",
        "color",
    }
    conflicts: set[str] = set()
    for match in re.finditer(r"(?ms)(?P<selectors>[^{}]+)\{(?P<body>[^{}]*)\}", text):
        selectors = [item.strip() for item in match.group("selectors").split(",")]
        declarations = css_declarations(match.group("body"))
        if any(selector.endswith(".chapter-outline") for selector in selectors):
            conflicts.update(
                f"container:{name}"
                for name in protected_container.intersection(declarations)
            )
        if any(".chapter-outline a" in selector for selector in selectors):
            conflicts.update(f"link:{name}" for name in declarations)
    return sorted(conflicts)


def local_design_conflicts(text: str) -> list[str]:
    conflicts: set[str] = set()
    duplicated_palette = {"--bg", "--surface", "--surface-2", "--ink", "--muted", "--cyan", "--gold", "--line"}
    for match in re.finditer(r"(?ms)(?P<selectors>[^{}]+)\{(?P<body>[^{}]*)\}", text):
        selectors = [item.strip() for item in match.group("selectors").split(",")]
        declarations = css_declarations(match.group("body"))
        if any(selector == "body" for selector in selectors):
            font_family = declarations.get("font-family", "")
            if font_family and "--course-font-sans" not in font_family:
                conflicts.add("page-local body font-family")
        if any("math" in selector and ("equation" in selector or "formula" in selector) for selector in selectors):
            font_size = declarations.get("font-size", "")
            if font_size and "--course-math-" not in font_size and font_size not in {"1em"}:
                conflicts.add(f"hardcoded formula font-size:{font_size}")
        duplicated = duplicated_palette.intersection(declarations)
        conflicts.update(f"duplicated palette token:{name}" for name in duplicated)
    return sorted(conflicts)


def audit_shared_chapter_outline(root: Path) -> list[str]:
    path = root / "assets" / "css" / "chapter.css"
    try:
        text = path.read_text(encoding="utf-8")
    except FileNotFoundError:
        return ["missing assets/css/chapter.css"]

    issues: list[str] = []
    base = css_rule(text, ".chapter-outline")
    if base.get("position") != "sticky":
        issues.append("shared .chapter-outline must use position: sticky")
    for property_name in ("top", "z-index", "background", "box-shadow"):
        if not base.get(property_name) or base[property_name] == "auto":
            issues.append(f"shared .chapter-outline missing protected {property_name}")
    if not (base.get("backdrop-filter") or base.get("-webkit-backdrop-filter")):
        issues.append("shared .chapter-outline missing backdrop-filter")

    light = css_rule(text, ':root[data-theme="light"] .chapter-outline')
    if not light.get("background"):
        issues.append("shared light-theme .chapter-outline missing background")
    if not css_rule(text, ':root[data-theme="light"] .chapter-outline a').get("color"):
        issues.append("shared light-theme outline links missing explicit color")
    if not css_rule(text, ':root[data-theme="dark"] .chapter-outline a').get("color"):
        issues.append("shared dark-theme outline links missing explicit color")

    link = css_rule(text, ".chapter-outline a")
    for property_name in (
        "padding",
        "color",
        "background",
        "border",
        "border-radius",
        "font-size",
        "font-weight",
        "line-height",
        "letter-spacing",
    ):
        if not link.get(property_name):
            issues.append(f"shared .chapter-outline links missing {property_name}")

    interaction = re.search(
        r"(?ms)\.chapter-outline\s+a:hover\s*,\s*"
        r"\.chapter-outline\s+a:focus-visible\s*\{(?P<body>[^{}]*)\}",
        text,
    )
    interaction_declarations = (
        css_declarations(interaction.group("body")) if interaction else {}
    )
    for property_name in ("color", "background", "border-color"):
        if not interaction_declarations.get(property_name):
            issues.append(
                f"shared outline hover/focus treatment missing {property_name}"
            )
    return issues


def audit_course_design_system(root: Path) -> list[str]:
    issues: list[str] = []
    paths = {
        "theme": root / "assets" / "css" / "theme.css",
        "chapter": root / "assets" / "css" / "chapter.css",
        "route": root / "assets" / "css" / "route.css",
    }
    try:
        texts = {name: path.read_text(encoding="utf-8") for name, path in paths.items()}
    except FileNotFoundError as error:
        return [f"design-system stylesheet missing: {error}"]

    required_tokens = {
        "--course-font-sans",
        "--course-font-math",
        "--course-bg",
        "--course-surface",
        "--course-surface-2",
        "--course-ink",
        "--course-muted",
        "--course-primary",
        "--course-secondary",
        "--course-alert",
        "--course-line",
        "--course-text-body-size",
        "--course-card-title-size",
        "--course-card-subtitle-size",
        "--course-math-display-size",
        "--course-math-compact-size",
    }
    base_tokens = css_rule(texts["theme"], ":root")
    missing_tokens = sorted(required_tokens.difference(base_tokens))
    if missing_tokens:
        issues.append("theme.css missing course tokens: " + ", ".join(missing_tokens))

    light_tokens = css_rule(texts["theme"], ':root[data-theme="light"]')
    light_required = {
        "--course-bg",
        "--course-surface",
        "--course-surface-2",
        "--course-ink",
        "--course-muted",
        "--course-primary",
        "--course-secondary",
        "--course-alert",
        "--course-line",
    }
    missing_light = sorted(light_required.difference(light_tokens))
    if missing_light:
        issues.append("light theme missing course tokens: " + ", ".join(missing_light))

    chapter_body = css_rule(texts["chapter"], "body")
    if "--course-font-sans" not in chapter_body.get("font-family", ""):
        issues.append("chapter body does not use --course-font-sans")
    if "--course-math-display-size" not in css_rule(texts["chapter"], ".equation math").get("font-size", ""):
        issues.append("shared display equations do not use --course-math-display-size")
    if "--course-math-display-size" not in css_rule(texts["chapter"], ".formula-display").get("font-size", ""):
        issues.append("formula-display does not use --course-math-display-size")

    frequency_page = root / "chapters" / "frequency-domain-processing" / "index.html"
    if frequency_page.exists():
        frequency_css = frequency_page.read_text(encoding="utf-8")
        frequency_equation = css_rule(frequency_css, ".fp-equation math")
        if "--course-font-math" not in frequency_equation.get("font-family", ""):
            issues.append("frequency .fp-equation math does not use --course-font-math")
        if "--course-math-display-size" not in frequency_equation.get("font-size", ""):
            issues.append("frequency .fp-equation math does not use --course-math-display-size")
        frequency_card_body = css_rule(frequency_css, ".fp-card p,\n      .fp-card li,\n      .fp-note p,\n      .fp-table")
        if "--course-text-body-size" not in frequency_card_body.get("font-size", ""):
            issues.append("frequency card text does not use --course-text-body-size")

    route_body = css_rule(texts["route"], "body.route-page")
    if "--course-font-sans" not in route_body.get("font-family", ""):
        issues.append("Session route body does not use --course-font-sans")
    route_root = css_rule(texts["route"], ":root")
    for route_name in ("--route-bg", "--route-panel", "--route-ink", "--route-accent", "--route-warm", "--route-line"):
        if "--course-" not in route_root.get(route_name, ""):
            issues.append(f"{route_name} is not derived from a shared course token")

    legacy_animation_colors = {"#e06c45", "#c98c00", "#167d86", "#82aeb1"}
    for svg in (root / "chapters").rglob("*.svg"):
        svg_text = svg.read_text(encoding="utf-8").lower()
        found = sorted(color for color in legacy_animation_colors if color in svg_text)
        if found:
            issues.append(
                f"legacy animation palette in {svg.relative_to(root)}: "
                + ", ".join(found)
            )
    return issues


def audit_page(root: Path, page: Path) -> list[str]:
    page_text = page.read_text(encoding="utf-8")
    parser = PageParser()
    parser.feed(page_text)
    data = parser.data
    issues: list[str] = []

    duplicates = sorted({item for item in data.ids if data.ids.count(item) > 1})
    if duplicates:
        issues.append(f"duplicate ids: {', '.join(duplicates)}")

    known_ids = set(data.ids)
    missing_anchors = sorted({
        href[1:] for href in data.links
        if href.startswith("#") and href[1:] not in known_ids
    })
    if missing_anchors:
        issues.append(f"missing anchors: {', '.join(missing_anchors)}")

    missing_files = []
    missing_cross_page_anchors = []
    for href in data.links:
        target = local_target(page, href)
        if target is not None and not target.exists():
            missing_files.append(href)
            continue
        parts = urlsplit(href)
        if target is not None and parts.fragment:
            if parts.fragment not in html_ids(target):
                missing_cross_page_anchors.append(href)
    if missing_files:
        issues.append(f"missing local files: {', '.join(sorted(set(missing_files)))}")
    if missing_cross_page_anchors:
        issues.append(
            "missing cross-page anchors: "
            + ", ".join(sorted(set(missing_cross_page_anchors)))
        )

    kind = page_kind(root, page)
    if kind == "chapter" and data.outline_count == 0:
        issues.append("missing chapter outline nav")
    elif kind == "chapter" and data.outline_count > 2:
        issues.append(f"too many chapter outlines: {data.outline_count}")
    if kind == "chapter" and "assets/css/chapter.css" not in page_text:
        issues.append("chapter does not load shared assets/css/chapter.css")
    if kind == "chapter" and "assets/css/theme.css" not in page_text:
        issues.append("chapter does not load shared assets/css/theme.css")
    if kind == "chapter":
        conflicts = local_outline_conflicts(page_text)
        if conflicts:
            issues.append(
                "page-local chapter-outline overrides protected properties: "
                + ", ".join(conflicts)
            )
        design_conflicts = local_design_conflicts(page_text)
        if design_conflicts:
            issues.append(
                "page-local design system drift: " + ", ".join(design_conflicts)
            )

    outline_anchors = [href[1:] for href in data.outline_links if href.startswith("#")]
    if kind == "chapter" and data.outline_count and not 5 <= len(outline_anchors) <= 8:
        issues.append(f"outline should contain 5-8 local anchors, found {len(outline_anchors)}")

    missing_outline_targets = sorted({item for item in outline_anchors if item not in known_ids})
    if missing_outline_targets:
        issues.append(f"outline targets missing: {', '.join(missing_outline_targets)}")

    positions = [data.ids.index(item) for item in outline_anchors if item in known_ids]
    if positions != sorted(positions):
        issues.append("outline order differs from document order")

    if kind == "session":
        if "assets/css/theme.css" not in page_text or "assets/css/route.css" not in page_text:
            issues.append("Session does not load shared theme.css and route.css")
        if data.session_route_count == 0:
            issues.append("missing data-session-route marker")
        if data.session_route_nav_count == 0:
            issues.append("missing accessible session relationship navigation")
        if data.math_count:
            issues.append(f"session contains {data.math_count} MathML block(s); concrete formulas belong in Chapters")

    return issues


def audit_course_data(root: Path) -> list[str]:
    issues: list[str] = []
    catalog_path = root / "course-data" / "catalog.json"
    current_path = root / "course-data" / "paths" / "current.json"
    try:
        catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
        current = json.loads(current_path.read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError) as error:
        return [f"course-data cannot be loaded: {error}"]

    items = catalog.get("items", [])
    ids = [item.get("id") for item in items]
    duplicates = sorted({item for item in ids if item and ids.count(item) > 1})
    if duplicates:
        issues.append(f"duplicate catalog ids: {', '.join(duplicates)}")

    by_id = {item.get("id"): item for item in items if item.get("id")}
    for item in items:
        url = item.get("url")
        if not url or not (root / url).exists():
            issues.append(f"catalog target missing: {item.get('id')} -> {url}")

    for route_item in current.get("items", []):
        content_id = route_item.get("content_id")
        if content_id not in by_id:
            issues.append(f"current path references unknown content id: {content_id}")
        elif by_id[content_id].get("status") != "published":
            issues.append(f"current path exposes non-published content: {content_id}")
    return issues


def main() -> int:
    argument_parser = argparse.ArgumentParser()
    argument_parser.add_argument("root", type=Path, help="Course publishing root")
    argument_parser.add_argument("--strict", action="store_true", help="Return non-zero when issues exist")
    args = argument_parser.parse_args()
    root = args.root.resolve()

    pages = candidate_pages(root)
    issue_count = 0
    data_issues = audit_course_data(root)
    if data_issues:
        issue_count += len(data_issues)
        print("[REVIEW] course-data")
        for issue in data_issues:
            print(f"  - {issue}")
    else:
        print("[OK] course-data")
    outline_issues = audit_shared_chapter_outline(root)
    if outline_issues:
        issue_count += len(outline_issues)
        print("[REVIEW] shared chapter-outline")
        for issue in outline_issues:
            print(f"  - {issue}")
    else:
        print("[OK] shared chapter-outline")
    design_issues = audit_course_design_system(root)
    if design_issues:
        issue_count += len(design_issues)
        print("[REVIEW] course design system")
        for issue in design_issues:
            print(f"  - {issue}")
    else:
        print("[OK] course design system")
    for page in pages:
        issues = audit_page(root, page)
        relative = page.relative_to(root)
        if issues:
            issue_count += len(issues)
            print(f"[REVIEW] {relative}")
            for issue in issues:
                print(f"  - {issue}")
        else:
            print(f"[OK] {relative}")

    print(f"\nScanned {len(pages)} pages; found {issue_count} issue(s).")
    return 1 if args.strict and issue_count else 0


if __name__ == "__main__":
    raise SystemExit(main())
