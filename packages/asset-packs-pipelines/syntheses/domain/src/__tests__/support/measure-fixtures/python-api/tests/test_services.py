from app.services import UserService


def test_create_user():
    svc = UserService()
    user = svc.create(email="a@example.com", name="Ada")
    assert user["email"] == "a@example.com"
    assert user["id"]
