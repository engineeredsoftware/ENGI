"""In-memory user domain service for fixture measurement."""

from dataclasses import dataclass, field
from typing import List
from uuid import uuid4


@dataclass
class User:
    id: str
    email: str
    name: str


class UserService:
    def __init__(self) -> None:
        self._users: List[User] = []

    def create(self, email: str, name: str) -> dict:
        user = User(id=str(uuid4()), email=email, name=name)
        self._users.append(user)
        return {"id": user.id, "email": user.email, "name": user.name}

    def list(self) -> List[dict]:
        return [{"id": u.id, "email": u.email, "name": u.name} for u in self._users]
