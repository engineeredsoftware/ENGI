"""FastAPI entry for the python-api measure fixture."""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr

from app.services import UserService

app = FastAPI(title="python-api")
service = UserService()


class CreateUser(BaseModel):
    email: EmailStr
    name: str


@app.get("/health")
def health() -> dict:
    return {"ok": True, "service": "python-api"}


@app.post("/users")
def create_user(body: CreateUser) -> dict:
    if not body.name.strip():
        raise HTTPException(status_code=400, detail="name required")
    user = service.create(email=str(body.email), name=body.name)
    return user
