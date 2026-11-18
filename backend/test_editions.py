import json
import socket
import threading
import time
import unittest
from urllib.error import HTTPError
from urllib.request import urlopen

import uvicorn

from backend.main import app


class EditionApiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        listener = socket.socket()
        cls.addClassCleanup(listener.close)
        listener.bind(("127.0.0.1", 0))
        cls.base_url = f"http://127.0.0.1:{listener.getsockname()[1]}/api/editions"
        server = uvicorn.Server(uvicorn.Config(app, log_level="error"))
        worker = threading.Thread(
            target=server.run, kwargs={"sockets": [listener]}, daemon=True
        )
        worker.start()

        def stop_server():
            server.should_exit = True
            worker.join(timeout=5)

        cls.addClassCleanup(stop_server)
        deadline = time.monotonic() + 5
        while not server.started:
            if not worker.is_alive() or time.monotonic() >= deadline:
                raise RuntimeError("The test API did not start")
            time.sleep(0.02)

    def get(self, suffix=""):
        with urlopen(self.base_url + suffix, timeout=5) as response:
            self.assertEqual(response.status, 200)
            return json.load(response)

    def test_lists_editions_in_order(self):
        self.assertEqual(
            [(row["id"], row["label"], row["term"]) for row in self.get()],
            [
                ("i", "Version I", "1-2025"),
                ("ii", "Version II", "2-2025"),
                ("iii", "Version III", "2-2026"),
            ],
        )

    def test_historical_editions_are_unavailable(self):
        for edition_id in ("i", "ii"):
            with self.subTest(edition=edition_id):
                self.assertEqual(self.get(f"/{edition_id}")["status"], "unavailable")

    def test_current_edition_matches_the_guidelines(self):
        edition = self.get("/iii")
        self.assertEqual(edition["status"], "available")
        self.assertEqual(edition["date"], "Thursday, November 19, 2026")
        self.assertEqual(edition["room"], "C202")
        self.assertEqual(edition["platform"], "Raspberry Pi 5 with a Tiva C or Raspberry Pi Pico W")
        self.assertEqual([module["id"] for module in edition["modules"]], list("ABCD"))
        self.assertIn("25–45 cm", edition["modules"][0]["description"])
        self.assertEqual(
            edition["criteria"],
            ["Modularity", "Autonomy", "Robustness", "Smoothness", "Ease of operation"],
        )
        self.assertIsInstance(edition["teams"], list)

    def test_unknown_edition_returns_not_found(self):
        with self.assertRaises(HTTPError) as caught:
            self.get("/unknown")
        with caught.exception as response:
            self.assertEqual(response.code, 404)
            self.assertEqual(json.load(response), {"detail": "Edition not found"})
