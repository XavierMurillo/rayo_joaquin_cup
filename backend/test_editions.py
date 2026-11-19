import json
import os
import socket
import threading
import time
import unittest
from io import BytesIO
from pathlib import Path
from tempfile import TemporaryDirectory
from urllib.error import HTTPError
from urllib.request import Request, urlopen
from unittest.mock import patch
from uuid import uuid4

import uvicorn
from PIL import Image

from backend.main import app


class EditionApiTests(unittest.TestCase):
    def setUp(self):
        directory = TemporaryDirectory()
        self.addCleanup(directory.cleanup)
        database_path = str(Path(directory.name) / "teams.sqlite3")
        environment = patch.dict(os.environ, {"TEAM_DATABASE_PATH": database_path})
        environment.start()
        self.addCleanup(environment.stop)

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

    def upload(self, *, edition="iii", photo=None, team_id=None, **fields):
        boundary = uuid4().hex
        form = {"name": "Example Team", "request_id": str(uuid4()), **fields}
        parts = [
            f'--{boundary}\r\nContent-Disposition: form-data; name="{key}"\r\n\r\n{value}\r\n'.encode()
            for key, value in form.items()
        ]
        if photo is not None:
            parts.append(
                f'--{boundary}\r\nContent-Disposition: form-data; name="photo"; filename="test.png"\r\n'
                'Content-Type: image/png\r\n\r\n'.encode() + photo + b"\r\n"
            )
        parts.append(f"--{boundary}--\r\n".encode())
        endpoint = f"{self.base_url}/{edition}/teams"
        if team_id is not None:
            endpoint += f"/{team_id}"
        request = Request(
            endpoint,
            data=b"".join(parts),
            headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
            method="PATCH" if team_id is not None else "POST",
        )
        with urlopen(request, timeout=5) as response:
            self.assertEqual(response.status, 200 if team_id is not None else 201)
            return json.load(response)

    def make_png(self, color="red"):
        output = BytesIO()
        Image.new("RGB", (3, 2), color).save(output, "PNG")
        return output.getvalue()

    def test_creates_teams_with_default_and_custom_colors(self):
        photo = self.make_png()
        default_team = self.upload(photo=photo, name=" Default Team ")
        custom_team = self.upload(photo=photo, description=" Vehicle description ", color="#0123af")
        self.assertEqual((default_team["name"], default_team["description"], default_team["color"]),
                         ("Default Team", "", None))
        self.assertEqual((custom_team["description"], custom_team["color"]),
                         ("Vehicle description", "#0123af"))
        self.assertEqual(self.get("/iii")["teams"], [default_team, custom_team])
        photo_url = custom_team["photoUrl"]
        origin = self.base_url.removesuffix("/api/editions")
        with urlopen(origin + photo_url, timeout=5) as response:
            self.assertEqual(response.headers.get_content_type(), "image/png")
            self.assertEqual(response.read(), photo)
        with self.assertRaises(HTTPError) as wrong_edition:
            urlopen(origin + photo_url.replace("/iii/", "/ii/"), timeout=5)
        with wrong_edition.exception as response:
            self.assertEqual(response.code, 404)

    def test_rejects_invalid_uploads_without_storing_teams(self):
        photo = self.make_png()
        for status, parameters in [
            (422, {}),
            (422, {"photo": photo, "name": " "}),
            (422, {"photo": photo, "name": "a" * 81}),
            (422, {"photo": photo, "description": "a" * 281}),
            (422, {"photo": photo, "color": "#invalid"}),
            (422, {"photo": photo[:25]}),
            (422, {"photo": b"GIF89a"}),
            (413, {"photo": b"x" * (5 * 1024 * 1024 + 1)}),
            (404, {"photo": photo, "edition": "ii"}),
        ]:
            with self.subTest(expected_status=status, fields=list(parameters)):
                with self.assertRaises(HTTPError) as caught:
                    self.upload(**parameters)
                with caught.exception as response:
                    self.assertEqual(response.code, status)
        self.assertEqual(self.get("/iii")["teams"], [])

    def test_repeated_save_request_returns_the_same_team(self):
        fields = {"photo": self.make_png(), "request_id": str(uuid4())}
        first = self.upload(**fields)
        self.assertEqual(self.upload(**fields), first)
        self.assertEqual(self.get("/iii")["teams"], [first])

    def test_edit_keeps_identity_and_photo_until_replaced(self):
        original = self.upload(photo=self.make_png())
        team_id = original["id"]
        updated = self.upload(team_id=team_id, name="New Name", description="Updated details", color="#123456")
        self.assertEqual(updated["id"], team_id)
        self.assertEqual(updated["photoUrl"], original["photoUrl"])
        self.assertEqual((updated["name"], updated["description"], updated["color"]),
                         ("New Name", "Updated details", "#123456"))
        photo = self.make_png("blue")
        replaced = self.upload(team_id=team_id, photo=photo, name="New Name")
        self.assertNotEqual(replaced["photoUrl"], original["photoUrl"])
        self.assertEqual(self.get("/iii")["teams"], [replaced])
        origin = self.base_url.removesuffix("/api/editions")
        with urlopen(origin + replaced["photoUrl"], timeout=5) as response:
            self.assertEqual(response.read(), photo)

    def test_invalid_edit_and_wrong_edition_leave_team_intact(self):
        original = self.upload(photo=self.make_png())
        for expected, fields in [(422, {"photo": b"invalid"}), (404, {"edition": "ii"}), (404, {"team_id": str(uuid4())})]:
            with self.subTest(fields=fields):
                with self.assertRaises(HTTPError) as caught:
                    self.upload(**{"team_id": original["id"], **fields})
                with caught.exception as response:
                    self.assertEqual(response.code, expected)
        self.assertEqual(self.get("/iii")["teams"], [original])

    def test_deleting_team_removes_its_photo(self):
        team = self.upload(photo=self.make_png())
        for edition in ("ii", "iii"):
            endpoint = f"{self.base_url}/{edition}/teams/{team['id']}"
            request = Request(endpoint, method="DELETE")
            if edition == "ii":
                with self.assertRaises(HTTPError) as caught:
                    urlopen(request, timeout=5)
                with caught.exception as response:
                    self.assertEqual(response.code, 404)
                self.assertEqual(self.get("/iii")["teams"], [team])
            else:
                with urlopen(request, timeout=5) as response:
                    self.assertEqual(response.status, 204)
        self.assertEqual(self.get("/iii")["teams"], [])
        origin = self.base_url.removesuffix("/api/editions")
        with self.assertRaises(HTTPError) as caught:
            urlopen(origin + team["photoUrl"], timeout=5)
        with caught.exception as response:
            self.assertEqual(response.code, 404)
