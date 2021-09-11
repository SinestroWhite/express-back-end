CREATE TABLE IF NOT EXISTS confirmations (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,

    FOREIGN KEY (user_id) REFERENCES users(id)
);
