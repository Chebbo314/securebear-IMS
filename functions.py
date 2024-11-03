class InventoryManager:
    def __init__(self, database):
        self.db = database

    def add_new_item(self, name, quantity, category, price):
        if not name or quantity < 0 or price < 0:
            return False
        try:
            self.db.add_item(name, quantity, category, price)
            return True
        except Exception as e:
            print(f"Error adding item: {e}")
            return False

    def update_item_quantity(self, id, quantity):
        if quantity < 0:
            return False
        try:
            self.db.update_item(id, quantity)
            return True
        except Exception as e:
            print(f"Error updating item: {e}")
            return False

    def remove_item(self, id):
        try:
            self.db.delete_item(id)
            return True
        except Exception as e:
            print(f"Error deleting item: {e}")
            return False

    def get_inventory_list(self):
        return self.db.get_all_items()