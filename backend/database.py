import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

def get_db():
    db = mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", ""),
        database=os.getenv("DB_NAME", "ChatRestaurant")
    )
    return db

def init_db():
    db = get_db()
    cursor = db.cursor()

    # Table utilisateurs
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(191) NOT NULL UNIQUE,
            name VARCHAR(255) NOT NULL,
            hashed_password VARCHAR(255) NOT NULL,
            disabled BOOLEAN DEFAULT FALSE
        )
    """)

    # Table conversations
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS conversations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            user_email VARCHAR(255)
        )
    """)

    # Table messages
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            conversation_id INT,
            text TEXT,
            is_user BOOLEAN,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
        )
    """)

    db.commit()
    cursor.close()
    db.close()
