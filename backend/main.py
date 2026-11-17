import json
from pathlib import Path

from fastapi import FastAPI, HTTPException

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
    return edition
