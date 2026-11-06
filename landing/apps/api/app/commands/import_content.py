"""Idempotently import existing authored copy; never create an administrator."""

from sqlalchemy.orm import Session

from app.core.config import Settings
from app.db.session import build_engine
from app.services.content_import import import_initial
from app.services.product_release import refresh_product_copy


def main():
    engine = build_engine(Settings())
    try:
        with Session(engine) as session, session.begin():
            count = import_initial(session)
            release = refresh_product_copy(session)
        print(f"Imported {count} existing authored content records; existing edits preserved.")
        print(f"Product release copy refreshed: {len(release['updated'])}; draft revisions preserved.")
    finally:
        engine.dispose()


if __name__ == "__main__":
    main()
