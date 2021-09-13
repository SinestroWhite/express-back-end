CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
);
