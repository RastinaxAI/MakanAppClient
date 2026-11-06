import unittest
from copy import deepcopy

from app.services.product_copy import apply_product_release, release_manifest


class ProductReleaseCopyTests(unittest.TestCase):
    def setUp(self):
        self.release = release_manifest()

    def test_assistant_release_is_active_complete_and_idempotent(self):
        record = {
            "slug": "ai", "title": "هوش مصنوعی", "seo": {"indexable": False},
            "payload": {
                "kind": "feature", "readiness": "roadmap", "document": None,
                "image_media_id": "kept",
            },
        }
        original = deepcopy(record)
        updated = apply_product_release(record, self.release)
        self.assertEqual(record, original)
        self.assertEqual(updated["payload"]["readiness"], "available")
        self.assertEqual(updated["payload"]["image_media_id"], "kept")
        self.assertTrue(updated["payload"]["evidence_reference"])
        self.assertEqual(len(updated["payload"]["benefits"]), 6)
        self.assertGreater(len(updated["payload"]["body_html"]), 1500)
        self.assertFalse(updated["seo"]["indexable"])
        self.assertEqual(apply_product_release(updated, self.release), updated)

    def test_home_adds_one_assistant_item_and_preserves_unrelated_copy(self):
        record = {
            "slug": "home",
            "payload": {
                "kind": "home", "summary": "برای آیندهٔ دانش‌آموزان",
                "sections": [{
                    "type": "features",
                    "items": [{"title": "پیام‌ها", "href": "/features/messenger"}],
                }],
            },
        }
        updated = apply_product_release(record, self.release)
        self.assertEqual(updated["payload"]["summary"], record["payload"]["summary"])
        self.assertEqual(len(updated["payload"]["sections"][0]["items"]), 2)
        self.assertEqual(apply_product_release(updated, self.release), updated)

    def test_visual_styles_and_node_ids_survive_the_assistant_update(self):
        record = {
            "slug": "ai",
            "payload": {
                "kind": "feature",
                "document": {
                    "schema_version": 2, "globals": {"font": "sans"},
                    "nodes": [{
                        "id": "authored-hero", "type": "Hero", "props": {"title": "old"},
                        "styles": {"base": {"padding": 48}}, "children": [],
                    }],
                },
            },
        }
        updated = apply_product_release(record, self.release)
        node = updated["payload"]["document"]["nodes"][0]
        self.assertEqual(node["id"], "authored-hero")
        self.assertEqual(node["styles"], {"base": {"padding": 48}})
        self.assertEqual(node["props"]["title"], self.release["feature_ai"]["headline"])
        self.assertEqual(apply_product_release(updated, self.release), updated)

    def test_faq_replaces_old_rich_answer_without_changing_visibility(self):
        record = {
            "slug": "ai", "title": "old", "visibility": False,
            "payload": {
                "kind": "faq", "question": "old", "answer": "خیر",
                "answer_html": "<p>در نقشه راه</p>",
            },
        }
        updated = apply_product_release(record, self.release)
        self.assertEqual(updated["payload"]["answer_html"], "")
        self.assertIn("فعال است", updated["payload"]["answer"])
        self.assertFalse(updated["visibility"])


if __name__ == "__main__":
    unittest.main()
