import sqlite3
from datetime import datetime

class Database:
    def __init__(self, db_name="party_inventory.db"):
        self.conn = sqlite3.connect(db_name)
        self.cursor = self.conn.cursor()
        self.create_tables()

    def create_tables(self):
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS items (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                quantity INTEGER,
                category TEXT,
                price REAL,
                last_updated TEXT
            )
        ''')
        self.conn.commit()

    def add_item(self, name, quantity, category, price):
        self.cursor.execute('''
            INSERT INTO items (name, quantity, category, price, last_updated)
            VALUES (?, ?, ?, ?, ?)
        ''', (name, quantity, category, price, datetime.now().strftime("%Y-%m-%d %H:%M:%S")))
        self.conn.commit()

    def get_all_items(self):
        self.cursor.execute('SELECT * FROM items')
        return self.cursor.fetchall()

    def update_item(self, id, quantity):
        self.cursor.execute('''
            UPDATE items 
            SET quantity = ?, last_updated = ?
            WHERE id = ?
        ''', (quantity, datetime.now().strftime("%Y-%m-%d %H:%M:%S"), id))
        self.conn.commit()

    def delete_item(self, id):
        self.cursor.execute('DELETE FROM items WHERE id = ?', (id,))
        self.conn.commit()