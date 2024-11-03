import tkinter as tk
from tkinter import messagebox, ttk
from datetime import datetime
import json
import os
import hashlib

class DrinkPartyTracker:
    def __init__(self, root):
        self.root = root
        self.root.title("Securebear-IMS")
        self.root.configure(bg='#2A2B2A')
        
        # Admin password hash (default: "admin123")
        self.admin_pass_hash = "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9"
        
        # Load or create drink inventory and people tabs
        self.load_data()
        
        self.create_gui()
        
    def load_data(self):
        try:
            with open('party_data.json', 'r') as f:
                data = json.load(f)
                self.inventory = data['inventory']
                self.people_tabs = data['people']
        except:
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
        
        # Grid Frame for Buttons
        grid_frame = tk.Frame(self.root, bg='#2A2B2A')
        grid_frame.pack(pady=100)
        
        # Button style
        btn_style = {
            'font': ('Arial', 16, 'bold'),
            'width': 10,
            'height': 2,
            'border': 5
        }
        
        # Add Drink Button
        tk.Button(grid_frame, 
                 text="Getränk",
                 command=self.add_drink,
                 bg='#9B9B93',
                 fg='#2A2B2A',
                 **btn_style).grid(row=0, column=0, padx=5, pady=5)
        
        # View/Print Tabs Button
        tk.Button(grid_frame,
                text="Rechnung",
                command=self.show_tabs,
                bg='#9B9B93',
                fg='#2A2B2A',
                **btn_style).grid(row=0, column=1, padx=5, pady=5)
        
        # Restock Button
        tk.Button(grid_frame,
                text="Inventar",
                command=self.show_restock_dialog,
                bg='#9B9B93',
                fg='#2A2B2A',
                **btn_style).grid(row=0, column=2, padx=5, pady=5)
        
        tk.Button(grid_frame,
                text="💾",
                command=self.create_new_tab,
                bg='#9B9B93',
                fg='#2A2B2A',
                **btn_style).grid(row=1, column=0, padx=5, pady=5)

        # View Saved Tabs Button
        tk.Button(grid_frame,
                text="📂",
                command=self.show_saved_tabs,
                bg='#9B9B93',
                fg='#2A2B2A',
                **btn_style).grid(row=1, column=1, padx=5, pady=5)

        # Reset Button with Password
        tk.Button(grid_frame,
                 text="Reset",
                 command=self.password_reset_dialog,
                 bg='#9B9B93',
                 fg='#2A2B2A',
                 **btn_style).grid(row=2, column=1, padx=5, pady=(50,0))
        


    def show_restock_dialog(self):
        dialog = tk.Toplevel(self.root)
        dialog.title("RESTOCK INVENTORY")
        dialog.configure(bg='#1A1A1A')
        dialog.geometry("400x500")
        
        # Create main frame
        main_frame = tk.Frame(dialog, bg='#1A1A1A')
        main_frame.pack(padx=20, pady=20, fill='both', expand=True)
        
        # Title
        tk.Label(main_frame,
                text="RESTOCK ITEMS",
                font=('Arial', 16, 'bold'),
                bg='#1A1A1A',
                fg='white').pack(pady=(0, 20))
        
        # Create frame for entries
        entries_frame = tk.Frame(main_frame, bg='#1A1A1A')
        entries_frame.pack(fill='both', expand=True)
        
        # Dictionary to store entry widgets
        self.restock_entries = {}
        
        # Create label and entry for each drink
        for i, (drink, info) in enumerate(self.inventory.items()):
            # Frame for each drink row
            drink_frame = tk.Frame(entries_frame, bg='#1A1A1A')
            drink_frame.pack(fill='x', pady=5)
            
            # Drink name label
            tk.Label(drink_frame,
                    text=f"{drink} (Current: {info['stock']})",
                    font=('Arial', 12),
                    bg='#1A1A1A',
                    fg='white').pack(side='left', padx=(0, 10))
            
            # Entry for quantity
            entry = ttk.Entry(drink_frame, width=10, font=('Arial', 12))
            entry.pack(side='right', padx=5)
            entry.insert(0, "0")  # Default value
            
            self.restock_entries[drink] = entry
            
        # Buttons frame
        buttons_frame = tk.Frame(main_frame, bg='#1A1A1A')
        buttons_frame.pack(pady=20)
        
        # Apply button
        tk.Button(buttons_frame,
                 text="RESTOCK",
                 command=lambda: self.apply_restock(dialog),
                 bg='#4CAF50',
                 fg='white',
                 font=('Arial', 12, 'bold')).pack(side='left', padx=5)
                 
        # Cancel button
        tk.Button(buttons_frame,
                 text="CANCEL",
                 command=dialog.destroy,
                 bg='#FD151B',
                 fg='white',
                 font=('Arial', 12, 'bold')).pack(side='left', padx=5)
        
    def create_new_tab(self):
        current_time = datetime.now()
        tab_name = f"Rechnung-{current_time.strftime('%Y%m%d-%H%M')}"
        
        if self.people_tabs:  # Only save if there are any entries
            # Save current tab to file
            tab_data = {
                'people': self.people_tabs,
                'inventory_snapshot': self.inventory,
                'timestamp': current_time.strftime("%Y-%m-%d %H:%M:%S")
            }
            
            # Create tabs directory if it doesn't exist
            if not os.path.exists('tabs'):
                os.makedirs('tabs')
                
            # Save tab to file
            with open(f'tabs/{tab_name}.json', 'w') as f:
                json.dump(tab_data, f)
                
            # Clear current people tabs
            self.people_tabs = {}
            self.save_data()
            
            messagebox.showinfo("Tab Saved", f"Tab saved as: {tab_name}")
        else:
            messagebox.showwarning("No Data", "No tab data to save!")

    def show_saved_tabs(self):
        if not os.path.exists('tabs'):
            messagebox.showinfo("No Tabs", "No saved tabs found!")
            return

        dialog = tk.Toplevel(self.root)
        dialog.title("SAVED TABS")
        dialog.configure(bg='#1A1A1A')
        dialog.geometry("600x400")

        # Create main frame
        main_frame = tk.Frame(dialog, bg='#1A1A1A')
        main_frame.pack(padx=20, pady=20, fill='both', expand=True)

        # Title
        tk.Label(main_frame,
                text="SELECT TAB TO VIEW",
                font=('Arial', 16, 'bold'),
                bg='#1A1A1A',
                fg='white').pack(pady=(0, 20))

        # Get list of tab files
        tab_files = sorted([f for f in os.listdir('tabs') if f.endswith('.json')], reverse=True)

        if not tab_files:
            tk.Label(main_frame,
                    text="No saved tabs found",
                    font=('Arial', 12),
                    bg='#1A1A1A',
                    fg='white').pack()
            return

        # Create scrollable frame for tabs
        canvas = tk.Canvas(main_frame, bg='#1A1A1A', highlightthickness=0)
        scrollbar = ttk.Scrollbar(main_frame, orient="vertical", command=canvas.yview)
        scrollable_frame = tk.Frame(canvas, bg='#1A1A1A')

        scrollable_frame.bind(
            "<Configure>",
            lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
        )

        canvas.create_window((0, 0), window=scrollable_frame, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)
    
        def view_tab(filename):
            with open(f'tabs/{filename}', 'r') as f:
                tab_data = json.load(f)

            # Create new window to show tab details
            tab_dialog = tk.Toplevel(dialog)
            tab_dialog.title(f"Tab: {filename}")
            tab_dialog.configure(bg='#1A1A1A')

            text = tk.Text(tab_dialog, font=('Arial', 14), bg='#333333', fg='white')
            text.pack(padx=10, pady=10, fill='both', expand=True)

            total_party_cost = 0
            people_data = tab_data['people']

            text.insert(tk.END, f"🎉 {filename} 🎉\n")
            text.insert(tk.END, f"Created: {tab_data['timestamp']}\n\n")

            for person, drinks in people_data.items():
                total = sum(drink['price'] for drink in drinks)
                total_party_cost += total

                text.insert(tk.END, f"\n{person}'s Tab:\n")
                for drink in drinks:
                    text.insert(tk.END, 
                        f"  {drink['time']} - {drink['drink']}: ${drink['price']:.2f}\n")
                text.insert(tk.END, f"TOTAL: ${total:.2f}\n")
                text.insert(tk.END, "-" * 40 + "\n")

            text.insert(tk.END, f"\n🎊 TOTAL PARTY TAB: ${total_party_cost:.2f} 🎊")
            text.configure(state='disabled')

        # Create button for each tab
        for file in tab_files:
            btn = tk.Button(scrollable_frame,
                           text=file.replace('.json', ''),
                           command=lambda f=file: view_tab(f),
                           bg='#4CAF50',
                           fg='white',
                           font=('Arial', 12))
            btn.pack(fill='x', pady=2)

        canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")

    def apply_restock(self, dialog):
        try:
            changes_made = False
            restock_summary = []
            
            for drink, entry in self.restock_entries.items():
                try:
                    amount = int(entry.get())
                    if amount > 0:
                        self.inventory[drink]['stock'] += amount
                        changes_made = True
                        restock_summary.append(f"{drink}: +{amount}")
                except ValueError:
                    continue  # Skip invalid entries
            
            if changes_made:
                self.save_data()
                self.update_stock_display()
                dialog.destroy()
                
                # Show summary
                summary = "\n".join(restock_summary)
                messagebox.showinfo("RESTOCKED!", f"Added to inventory:\n\n{summary}")
            else:
                messagebox.showwarning("No Changes", "No valid restock quantities entered!")
                
        except Exception as e:
            messagebox.showerror("Error", f"An error occurred: {str(e)}")

    def password_reset_dialog(self):
        dialog = tk.Toplevel(self.root)
        dialog.title("Password Required")
        dialog.configure(bg='#1A1A1A')
        dialog.geometry("300x150")
        
        tk.Label(dialog, 
                text="Enter Admin Password:",
                font=('Arial', 12),
                bg='#1A1A1A',
                fg='white').pack(pady=10)
        
        password_entry = tk.Entry(dialog, show="*", font=('Arial', 12))
        password_entry.pack(pady=10)
        
        def check_password():
            password = password_entry.get()
            if hashlib.sha256(password.encode()).hexdigest() == self.admin_pass_hash:
                dialog.destroy()
                self.reset_all()
            else:
                messagebox.showerror("Error", "Incorrect Password!")
                dialog.destroy()
        
        tk.Button(dialog,
                 text="Submit",
                 command=check_password,
                 bg='#4CAF50',
                 fg='white',
                 font=('Arial', 12)).pack(pady=10)

    def update_stock_display(self):
        self.stock_text.delete(1.0, tk.END)
        self.stock_text.insert(tk.END, "Bestand: \n\n")
        for drink, info in self.inventory.items():
            self.stock_text.insert(tk.END, 
                f"{drink}: {info['stock']} (€{info['price']:.2f})\n")

    def add_drink(self):
        dialog = tk.Toplevel(self.root)
        dialog.title("ADD DRINK TO TAB")
        dialog.configure(bg='#1A1A1A')
        
        tk.Label(dialog, text="WHO'S DRINKING?", 
                font=('Arial', 16), bg='#1A1A1A', fg='white').pack(pady=5)
        
        name_entry = tk.Entry(dialog, font=('Arial', 14))
        name_entry.pack(pady=5)
        
        # Drink buttons in a grid
        drink_frame = tk.Frame(dialog, bg='#1A1A1A')
        drink_frame.pack(pady=5)
        
        for i, drink in enumerate(self.inventory):
            row = i // 2
            col = i % 2
            tk.Button(drink_frame,
                     text=drink,
                     font=('Arial', 14),
                     command=lambda d=drink: self.process_drink(name_entry.get(), d, dialog),
                     bg='#4CAF50',
                     fg='white').grid(row=row, column=col, padx=5, pady=2)

    def process_drink(self, name, drink, dialog):
        if not name:
            messagebox.showerror("ERROR!", "NEED A NAME!")
            return
            
        if self.inventory[drink]['stock'] <= 0:
            messagebox.showerror("ERROR!", f"NO MORE {drink}!")
            return
            
        if name not in self.people_tabs:
            self.people_tabs[name] = []
            
        self.people_tabs[name].append({
            'drink': drink,
            'price': self.inventory[drink]['price'],
            'time': datetime.now().strftime("%H:%M")
        })
        
        self.inventory[drink]['stock'] -= 1
        
        self.save_data()
        self.update_stock_display()
        dialog.destroy()
        
        messagebox.showinfo("ADDED!", f"{drink} added to {name}'s tab!")

    def show_tabs(self):
        dialog = tk.Toplevel(self.root)
        dialog.title("Rechnungen")
        dialog.configure(bg='#1A1A1A')
        
        text = tk.Text(dialog, font=('Arial', 14), bg='#333333', fg='white')
        text.pack(padx=10, pady=10)
        
        total_party_cost = 0
        
        text.insert(tk.END, "Rechnungen \n\n")
        for person, drinks in self.people_tabs.items():
            total = sum(drink['price'] for drink in drinks)
            total_party_cost += total
            
            text.insert(tk.END, f"\n{person}'s Tab:\n")
            for drink in drinks:
                text.insert(tk.END, 
                    f"  {drink['time']} - {drink['drink']}: €{drink['price']:.2f}\n")
            text.insert(tk.END, f"TOTAL: €{total:.2f}\n")
            text.insert(tk.END, "-" * 40 + "\n")
            
        text.insert(tk.END, f"\n🎊 TOTAL TAB: €{total_party_cost:.2f} 🎊")

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