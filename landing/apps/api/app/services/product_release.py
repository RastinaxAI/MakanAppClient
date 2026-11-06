"""Publish an idempotent copy update without deleting history or replacing drafts."""

from sqlalchemy import select, text
from sqlalchemy.orm import Session

from app.models import Page, PageRevision
from app.schemas.cms import ContentInput
from app.services.auth import audit, now_utc
from app.services.cms import create_revision, publication_checks
from app.services.product_copy import apply_product_release, release_manifest


def refresh_product_copy(session: Session, release=None):
    release = release or release_manifest()
    session.execute(text("SELECT pg_advisory_xact_lock(74120604)"))
    rows = session.execute(
        select(Page, PageRevision)
        .join(PageRevision, PageRevision.id == Page.published_revision_id)
        .where(
            Page.is_archived.is_(False),
            Page.page_type.in_(("home", "page", "feature", "audience", "faq")),
        )
        .order_by(Page.id)
        .with_for_update(of=Page)
    ).all()
    result = {"updated": [], "skipped_drafts": []}
    for page, previous in rows:
        original = ContentInput(
            slug=page.slug.split(":", 1)[1], title=previous.title,
            payload=previous.content_json["payload"], seo=previous.seo_json,
            visibility=previous.content_json.get("visibility", True),
            sort_order=previous.content_json.get("sort_order", 0),
            category_id=previous.category_id,
        ).model_dump(mode="json")
        candidate = ContentInput.model_validate(apply_product_release(original, release))
        if candidate.model_dump(mode="json") == original:
            continue
        if page.scheduled_revision_id or page.working_revision_id != page.published_revision_id:
            result["skipped_drafts"].append(page.slug)
            continue
        changed = create_revision(session, page, candidate, None)
        publication_checks(session, page, changed)
        changed.published_at = now_utc()
        page.published_revision_id = changed.id
        page.row_version += 1
        audit(
            session, None, "content.product-release", None, page.id,
            {
                "release": release["version"], "previous_revision": str(previous.id),
                "new_revision": str(changed.id),
            },
            "content",
        )
        result["updated"].append(page.slug)
    return result
