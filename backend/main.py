import json
import re
from pathlib import Path
from uuid import UUID

from fastapi import FastAPI, Form, HTTPException, Response, UploadFile

from backend.teams import (
    MAX_PHOTO_BYTES, delete_team, get_photo, list_teams, save_team, update_team, validate_photo,
)

app = FastAPI(title="Rayo Joakin Cup")
data_path = Path(__file__).with_name("editions.json")
editions = json.loads(data_path.read_text(encoding="utf-8"))
editions_by_id = {edition["id"]: edition for edition in editions}


@app.get("/api/editions")
def list_editions():
    summary_fields = ("id", "label", "term", "status")
    return [{field: edition[field] for field in summary_fields} for edition in editions]


@app.get("/api/editions/{edition_id}")
def get_edition(edition_id: str):
    edition = editions_by_id.get(edition_id)
    if edition is None:
        raise HTTPException(status_code=404, detail="Edition not found")
    if edition["status"] != "available":
        return edition
    repository_teams = [{**team, "managed": False} for team in edition.get("teams", [])]
    return {**edition, "teams": [*repository_teams, *list_teams(edition_id)]}


@app.post("/api/editions/{edition_id}/teams", status_code=201)
def create_team(
    edition_id: str,
    photo: UploadFile,
    request_id: UUID = Form(),
    name: str = Form(),
    description: str = Form(""),
    color: str = Form(""),
):
    edition = editions_by_id.get(edition_id)
    if edition is None or edition["status"] != "available":
        raise HTTPException(404, "This edition does not accept teams.")
    name, description, color = validate_team_fields(name, description, color)
    photo_bytes = photo.file.read(MAX_PHOTO_BYTES + 1)
    media_type = validate_photo(photo_bytes)
    return save_team(edition_id, str(request_id), name, description, color, media_type, photo_bytes)


def validate_team_fields(name, description, color):
    name, description = name.strip(), description.strip()
    if not 1 <= len(name) <= 80:
        raise HTTPException(422, "Enter a team name between 1 and 80 characters.")
    if len(description) > 280:
        raise HTTPException(422, "Keep the description to 280 characters or fewer.")
    if color and not re.fullmatch(r"#[0-9a-fA-F]{6}", color):
        raise HTTPException(422, "Choose a valid background color.")

    return name, description, color or None


@app.patch("/api/editions/{edition_id}/teams/{team_id}")
def edit_team(
    edition_id: str,
    team_id: UUID,
    name: str = Form(),
    description: str = Form(""),
    color: str = Form(""),
    photo: UploadFile | None = None,
):
    name, description, color = validate_team_fields(name, description, color)
    photo_bytes = photo.file.read(MAX_PHOTO_BYTES + 1) if photo else None
    media_type = validate_photo(photo_bytes) if photo_bytes is not None else None
    card = update_team(edition_id, str(team_id), name, description, color, media_type, photo_bytes)
    if card is None:
        raise HTTPException(404, "Team not found.")
    return card


@app.delete("/api/editions/{edition_id}/teams/{team_id}", status_code=204)
def remove_team(edition_id: str, team_id: UUID):
    if not delete_team(edition_id, str(team_id)):
        raise HTTPException(404, "Team not found.")
    return Response(status_code=204)


@app.get("/api/editions/{edition_id}/teams/{team_id}/photo")
def team_photo(edition_id: str, team_id: UUID):
    result = get_photo(edition_id, str(team_id))
    if result is None:
        raise HTTPException(404, "Team photo not found.")
    return Response(result["photo"], media_type=result["media_type"], headers={"X-Content-Type-Options": "nosniff"})
