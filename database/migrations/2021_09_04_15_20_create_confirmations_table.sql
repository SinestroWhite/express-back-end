CREATE TABLE IF NOT EXISTS confirmations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,

    FOREIGN KEY (user_id) REFERENCES users(id)
);
