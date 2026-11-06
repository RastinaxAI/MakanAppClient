"""Refresh published product copy after a confirmed release; retain all revisions."""

import argparse
import json
from pathlib import Path

from sqlalchemy.orm import Session

from app.core.config import Settings
from app.db.session import build_engine
from app.services.product_release import refresh_product_copy


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--manifest", type=Path)
    args = parser.parse_args()
    release = json.loads(args.manifest.read_text(encoding="utf-8")) if args.manifest else None
    engine = build_engine(Settings())
    try:
        with Session(engine) as session, session.begin():
            result = refresh_product_copy(session, release)
            if args.dry_run:
                session.rollback()
        print(json.dumps({"dry_run": args.dry_run, **result}, ensure_ascii=False))
    finally:
        engine.dispose()


if __name__ == "__main__":
    main()
