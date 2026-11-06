"""Product copy approved for the November release, independent of persistence."""

import json
from copy import deepcopy
from pathlib import Path


def release_manifest():
    return json.loads(
        (Path(__file__).parents[1] / "data/product-release.json").read_text(encoding="utf-8")
    )


def replace_copy(value, replacements):
    if isinstance(value, str):
        for old, new in sorted(replacements.items(), key=lambda pair: -len(pair[0])):
            value = value.replace(old, new)
        return value
    if isinstance(value, list):
        return [replace_copy(item, replacements) for item in value]
    if isinstance(value, dict):
        return {key: replace_copy(item, replacements) for key, item in value.items()}
    return value


def apply_product_release(record, release):
    """Change product copy while retaining unrelated content, media and visual styles."""
    updated = replace_copy(deepcopy(record), release["text_replacements"])
    payload = updated["payload"]
    kind, slug = payload["kind"], updated["slug"]
    if kind == "feature" and slug == "ai":
        previous = deepcopy(payload)
        payload.update(deepcopy(release["feature_ai"]))
        updated["title"] = payload["title"]
        updated.setdefault("seo", {}).update(release["feature_ai_seo"])
        document = payload.get("document")
        if document:
            replacements = {
                previous[key]: payload[key]
                for key in ("eyebrow", "headline", "summary", "boundary")
                if previous.get(key) and previous[key] != payload[key]
            }
            document = replace_copy(document, replacements)

            def visit(nodes):
                for node in nodes:
                    props = node["props"]
                    section = props.get("legacy_section") or {}
                    if node["type"] == "Hero":
                        props.update(
                            title=payload["headline"], text=payload["summary"],
                            kicker=payload["eyebrow"],
                        )
                        props.update(label="درخواست دموی دستیار", href="/demo")
                    if section.get("type") == "hero":
                        section.update(
                            title=payload["headline"], description=payload["summary"],
                            kicker=payload["eyebrow"], cta_label="درخواست دموی دستیار",
                            cta_href="/demo",
                        )
                    if section.get("type") == "benefits":
                        section.update(
                            title="ابزارهای دستیار ماکان", items=deepcopy(payload["benefits"])
                        )
                    if section.get("type") == "onboarding":
                        section.update(
                            title="از منبع تا یادگیری", items=deepcopy(payload["workflow"])
                        )
                    visit(node.get("children", []))

            visit(document["nodes"])
            guide = next(
                (node for node in document["nodes"] if node["id"] == "ai_release_guide"), None
            )
            if guide is None:
                guide = {
                    "id": "ai_release_guide", "type": "LegacySection", "version": 1,
                    "props": {}, "children": [],
                    "styles": {
                        key: {} for key in ("base", "tablet", "mobile", "hover", "focus")
                    },
                }
                document["nodes"].append(guide)
            guide["props"]["legacy_section"] = {
                "type": "rich-text", "title": "", "description": "",
                "body_html": payload["body_html"], "items": [],
            }
            payload["document"] = document
    if kind == "faq" and slug in release["faq_updates"]:
        payload.update(deepcopy(release["faq_updates"][slug]), answer_html="")
        updated["title"] = payload["question"]
        updated.setdefault("seo", {})["title"] = payload["question"]
    if kind == "home":
        def add_assistant(section):
            if section.get("type") == "features":
                items = section.setdefault("items", [])
                if not any(item.get("href") == "/features/ai" for item in items):
                    items.append(deepcopy(release["home_ai_item"]))

        for section in payload.get("sections", []):
            add_assistant(section)

        def visit(nodes):
            for node in nodes:
                props = node.get("props", {})
                if props.get("legacy_section"):
                    add_assistant(props["legacy_section"])
                visit(node.get("children", []))

        visit((payload.get("document") or {}).get("nodes", []))
    return updated
