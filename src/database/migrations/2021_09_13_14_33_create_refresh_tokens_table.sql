CREATE TABLE IF NOT EXISTS refresh_tokens (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL UNIQUE,
    token TEXT NOT NULL,
    expires DATETIME NOT NULL,
    created_by_ip CHAR(15),
    revoked DATETIME,
    revoked_by_ip CHAR(15),

    FOREIGN KEY (user_id) REFERENCES users(id)
);
