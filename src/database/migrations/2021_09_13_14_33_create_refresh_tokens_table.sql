CREATE TABLE IF NOT EXISTS refresh_tokens (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL UNIQUE,
    token TEXT NOT NULL,
    expires DATETIME NOT NULL,
    revoked DATETIME

    FOREIGN KEY (user_id) REFERENCES users(id)
);
