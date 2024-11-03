import tkinter as tk
from tkinter import messagebox
from datetime import datetime
import json
import os

class DrinkPartyTracker:
    def __init__(self, root):
        self.root = root
        self.root.title("Securebear-IMS")
        self.root.configure(bg='#2A2B2A')
        
        # Load or create drink inventory and people tabs
        self.load_data()
        
        self.create_gui()
        
    def load_data(self):
        # Load saved data or create new if doesn't exist
        try:
            with open('party_data.json', 'r') as f:
                data = json.load(f)
                self.inventory = data['inventory']
                self.people_tabs = data['people']
        except:
            # Default inventory with prices
            self.inventory = {
                "🍺 Bier": {"price": 2.00, "stock": 20},
                "🍷 Schnaps": {"price": 2.00, "stock": 12},
                "🥃 Goaß 1L": {"price": 8.00, "stock": 20},
                "🍸 Goaß 0,5": {"price": 4.00, "stock": 20},
                "🥤 Alkfrei": {"price": 2.00, "stock": 30}
            }
            self.people_tabs = {}

    def save_data(self):
        data = {
            'inventory': self.inventory,
            'people': self.people_tabs
        }
        with open('party_data.json', 'w') as f:
            json.dump(data, f)

    def create_gui(self):
        # Big flashy title
        title = tk.Label(self.root, 
                        text="Securebear-IMS",
                        font=('Arial', 24, 'bold'),
                        bg='#2A2B2A',
                        fg='#EBF5EE')
        title.pack(pady=20)
        
        # Inventory Section
        inv_frame = tk.Frame(self.root, bg='#2E282A')
        inv_frame.pack(pady=10, padx=10, fill='x')
        
        # Stock Display
        self.stock_text = tk.Text(inv_frame, height=6, width=30, padx=50, pady=20,
                                font=('Arial', 14),
                                bg='#2E282A', fg='#EBF5EE')
        self.stock_text.pack(pady=5)
        self.update_stock_display()
        
        # Buttons Frame
        btn_frame = tk.Frame(self.root, bg='#2A2B2A')
        btn_frame.pack(pady=10)
        
        # Button style
        btn_style = {
            'font': ('Arial', 16, 'bold'),
            'width': 15,
            'height': 2,
            'border': 5
        }
        
        # Add Drink to Someone's Tab
        tk.Button(btn_frame, 
                 text="🍺",
                 command=self.add_drink,
                 bg='#0E9594',  # Deep pink
                 fg='white',
                 **btn_style).pack(pady=5)
        
        # View/Print Tabs
        tk.Button(btn_frame,
                 text="💰",
                 command=self.show_tabs,
                 bg='#437F97',  # Bright green
                 fg='#2A2B2A',
                 **btn_style).pack(pady=5)
        
        # Restock Button
        tk.Button(btn_frame,
                 text="Auffüllen📦",
                 command=self.restock,
                 bg='#00FFFF',  # Cyan
                 fg='#2A2B2A',
                 **btn_style).pack(pady=5)
        
        # Reset All Button
        tk.Button(btn_frame,
                 text="RESET ⚠️",
                 command=self.reset_all,
                 bg='#FD151B',  # Orange-red
                 fg='white',
                 **btn_style).pack(pady=(150,5))

    def update_stock_display(self):
        self.stock_text.delete(1.0, tk.END)
        self.stock_text.insert(tk.END, "Bestand: \n\n")
        for drink, info in self.inventory.items():
            self.stock_text.insert(tk.END, 
                f"{drink}: {info['stock']} (${info['price']:.2f})\n")

    def add_drink(self):
        # Simple dialog for adding drinks
        dialog = tk.Toplevel(self.root)
        dialog.title("ADD DRINK TO TAB")
        dialog.configure(bg='#1A1A1A')
        
        tk.Label(dialog, text="WHO'S DRINKING?", 
                font=('Arial', 16), bg='#1A1A1A', fg='white').pack(pady=5)
        
        name_entry = tk.Entry(dialog, font=('Arial', 14))
        name_entry.pack(pady=5)
        
        # Drink buttons
        for drink in self.inventory:
            tk.Button(dialog,
                     text=drink,
                     font=('Arial', 14),
                     command=lambda d=drink: self.process_drink(name_entry.get(), d, dialog),
                     bg='#4CAF50',
                     fg='white').pack(pady=2)

    def process_drink(self, name, drink, dialog):
        if not name:
            messagebox.showerror("ERROR!", "NEED A NAME!")
            return
            
        if self.inventory[drink]['stock'] <= 0:
            messagebox.showerror("ERROR!", f"NO MORE {drink}!")
            return
            
        # Add to person's tab
        if name not in self.people_tabs:
            self.people_tabs[name] = []
            
        self.people_tabs[name].append({
            'drink': drink,
            'price': self.inventory[drink]['price'],
            'time': datetime.now().strftime("%H:%M")
        })
        
        # Decrease stock
        self.inventory[drink]['stock'] -= 1
        
        self.save_data()
        self.update_stock_display()
        dialog.destroy()
        
        messagebox.showinfo("ADDED!", f"{drink} added to {name}'s tab!")

    def show_tabs(self):
        dialog = tk.Toplevel(self.root)
        dialog.title("PARTY TABS")
        dialog.configure(bg='#1A1A1A')
        
        text = tk.Text(dialog, font=('Arial', 14), bg='#333333', fg='white')
        text.pack(padx=10, pady=10)
        
        total_party_cost = 0
        
        text.insert(tk.END, "🎉 PARTY TABS 🎉\n\n")
        for person, drinks in self.people_tabs.items():
            total = sum(drink['price'] for drink in drinks)
            total_party_cost += total
            
            text.insert(tk.END, f"\n{person}'s Tab:\n")
            for drink in drinks:
                text.insert(tk.END, 
                    f"  {drink['time']} - {drink['drink']}: ${drink['price']:.2f}\n")
            text.insert(tk.END, f"TOTAL: ${total:.2f}\n")
            text.insert(tk.END, "-" * 40 + "\n")
            
        text.insert(tk.END, f"\n🎊 TOTAL PARTY TAB: ${total_party_cost:.2f} 🎊")

    def restock(self):
        for drink in self.inventory:
            if drink == "🍺 Beer":
                self.inventory[drink]['stock'] += 24
            elif drink == "🍷 Wine":
                self.inventory[drink]['stock'] += 12
            else:
                self.inventory[drink]['stock'] += 20
                
        self.save_data()
        self.update_stock_display()
        messagebox.showinfo("RESTOCKED!", "DRINKS RESTOCKED! 🎉")

    def reset_all(self):
        if messagebox.askyesno("RESET ALL", "RESET EVERYTHING?"):
            self.people_tabs = {}
            for drink in self.inventory:
                self.inventory[drink]['stock'] = 0
            self.save_data()
            self.update_stock_display()
            messagebox.showinfo("RESET!", "EVERYTHING RESET! 🎉")

def main():
    root = tk.Tk()
    root.geometry("500x800")
    app = DrinkPartyTracker(root)
    root.mainloop()

if __name__ == "__main__":
    main()