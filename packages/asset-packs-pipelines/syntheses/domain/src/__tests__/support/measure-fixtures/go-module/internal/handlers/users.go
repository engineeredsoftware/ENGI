package handlers

import (
        "encoding/json"
        "net/http"

        "github.com/google/uuid"
)

// User is a source-safe fixture domain type.
type User struct {
        ID    string `json:"id"`
        Email string `json:"email"`
        Name  string `json:"name"`
}

// CreateUser handles POST /users.
func CreateUser(w http.ResponseWriter, r *http.Request) {
        var body struct {
                Email string `json:"email"`
                Name  string `json:"name"`
        }
        if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
                http.Error(w, "bad request", http.StatusBadRequest)
                return
        }
        user := User{ID: uuid.NewString(), Email: body.Email, Name: body.Name}
        w.Header().Set("Content-Type", "application/json")
        w.WriteHeader(http.StatusCreated)
        _ = json.NewEncoder(w).Encode(user)
}

// Health handles GET /health.
func Health(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Content-Type", "application/json")
        _ = json.NewEncoder(w).Encode(map[string]any{"ok": true, "service": "go-module"})
}
