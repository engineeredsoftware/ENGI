package main

import (
        "log"
        "net/http"

        "example.com/go-module/internal/handlers"
        "github.com/go-chi/chi/v5"
)

func main() {
        r := chi.NewRouter()
        r.Get("/health", handlers.Health)
        r.Post("/users", handlers.CreateUser)
        log.Fatal(http.ListenAndServe(":8080", r))
}
