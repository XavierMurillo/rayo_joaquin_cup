import os
import sqlite3
from contextlib import closing, contextmanager
from io import BytesIO
from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException
from PIL import Image

MAX_PHOTO_BYTES = 5 * 1024 * 1024
MAX_PHOTO_PIXELS = 24_000_000
FORMATS = {"JPEG": "image/jpeg", "PNG": "image/png", "WEBP": "image/webp"}


@contextmanager
def team_database():
    default_path = Path(__file__).with_name("runtime") / "teams.sqlite3"
    path = Path(os.environ.get("TEAM_DATABASE_PATH") or default_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    with closing(sqlite3.connect(path)) as database, database:
        database.row_factory = sqlite3.Row
        database.execute("""
            CREATE TABLE IF NOT EXISTS teams (
                edition_id TEXT NOT NULL, id TEXT NOT NULL, request_id TEXT NOT NULL, name TEXT NOT NULL,
                description TEXT NOT NULL, color TEXT, media_type TEXT NOT NULL,
                photo BLOB NOT NULL, PRIMARY KEY (edition_id, id), UNIQUE (edition_id, request_id)
            )
        """)
        yield database


def validate_photo(photo):
    if len(photo) > MAX_PHOTO_BYTES:
        raise HTTPException(413, "Choose a vehicle photo no larger than 5 MiB.")
    try:
        with Image.open(BytesIO(photo), formats=tuple(FORMATS)) as image:
            if image.width * image.height > MAX_PHOTO_PIXELS:
                raise HTTPException(422, "Choose an image with at most 24 million pixels.")
            media_type = FORMATS[image.format]
            image.verify()
        with Image.open(BytesIO(photo), formats=tuple(FORMATS)) as image:
            image.load()
    except (OSError, ValueError, SyntaxError, Image.DecompressionBombError) as error:
        raise HTTPException(422, "Choose a valid JPEG, PNG, or WebP photo.") from error
    return media_type


def team_card(edition_id, row):
    return {
        "id": row["id"],
        "name": row["name"],
        "description": row["description"],
        "color": row["color"],
        "photoUrl": f"/api/editions/{edition_id}/teams/{row['id']}/photo",
        "photoAlt": f"Vehicle photo for {row['name']}",
    }


def list_teams(edition_id):
    with team_database() as database:
        rows = database.execute(
            "SELECT id, name, description, color FROM teams WHERE edition_id = ? ORDER BY rowid",
            (edition_id,),
        )
        return [team_card(edition_id, row) for row in rows]


def save_team(edition_id, request_id, name, description, color, media_type, photo):
    with team_database() as database:
        database.execute(
            """INSERT INTO teams (edition_id, id, request_id, name, description, color, media_type, photo)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT (edition_id, request_id) DO NOTHING""",
            (edition_id, str(uuid4()), request_id, name, description, color, media_type, photo),
        )
        row = database.execute(
            "SELECT id, name, description, color FROM teams WHERE edition_id = ? AND request_id = ?",
            (edition_id, request_id),
        ).fetchone()
        return team_card(edition_id, row)


def get_photo(edition_id, team_id):
    with team_database() as database:
        return database.execute(
            "SELECT photo, media_type FROM teams WHERE edition_id = ? AND id = ?",
            (edition_id, team_id),
        ).fetchone()
