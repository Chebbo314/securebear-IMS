import React, { useState, useEffect } from 'react';

// Custom Dialog Component
const Dialog = ({ open, onClose, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg mx-0 max-w-full max-h-full overflow-hidden">
        <div className="overflow-y-auto max-h-full max-w-full">
          {children}
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          &times;
        </button>
      </div>
    </div>
  );
};

const PaymentSystem = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [view, setView] = useState('users');
  const [transactions, setTransactions] = useState([]);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState('');
  const [pendingUserId, setPendingUserId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const CORRECT_PASSWORD = '86403';

  const handleNumpadClick = (num) => {
    if (password.length < 5) {
      setPassword(prev => prev + num);
    }
  };

  const handleBackspace = () => {
    setPassword(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPassword('');
  };

  useEffect(() => {
    const savedUsers = localStorage.getItem('users');
    const savedTransactions = localStorage.getItem('transactions');
    if (savedUsers) setUsers(JSON.parse(savedUsers));
    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
  }, []);

  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [users, transactions]);

  const drinks = [
    { id: 1, name: 'Bier', price: 2.00 },
    { id: 2, name: 'Schnaps', price: 2.00 },
    { id: 3, name: 'Alkfrei', price: 1.50 },
    { id: 4, name: 'Goaß', price: 6.00 }
  ];

  const handlePasswordSubmit = () => {
    if (password === CORRECT_PASSWORD) {
      const updatedUsers = users.map(user => {
        if (user.id === pendingUserId) {
          return { ...user, balance: 0 };
        }
        return user;
      });
      setUsers(updatedUsers);
      if (selectedUser && selectedUser.id === pendingUserId) {
        setSelectedUser({ ...selectedUser, balance: 0 });
      }
      setShowPasswordDialog(false);
      setPendingUserId(null);
      setPassword('');
      setErrorMessage('');
    } else {
      setErrorMessage('Falsches Passwort');
      setPassword('');
    }
  };

  const addUser = () => {
    if (newUserName.trim()) {
      setUsers([...users, { 
        id: users.length + 1, 
        name: newUserName.trim(),
        balance: 0
      }]);
      setNewUserName('');
      setShowAddUser(false);
    }
  };

  const addTransaction = (drink) => {
    if (selectedUser) {
      const newTransaction = {
        id: transactions.length + 1,
        userId: selectedUser.id,
        drinkId: drink.id,
        price: drink.price,
        date: new Date().toISOString()
      };
      setTransactions([...transactions, newTransaction]);
      
      const updatedUsers = users.map(user => {
        if (user.id === selectedUser.id) {
          return { ...user, balance: user.balance + drink.price };
        }
        return user;
      });
      setUsers(updatedUsers);
      setSelectedUser({ ...selectedUser, balance: selectedUser.balance + drink.price });
    }
  };

  const initiateSettlePayment = (userId, e) => {
    e.stopPropagation();
    setPendingUserId(userId);
    setShowPasswordDialog(true);
    setPassword('');
    setErrorMessage('');
  };

  const clearLocalStorage = () => {
    localStorage.removeItem('users');
    localStorage.removeItem('transactions');
    setUsers([]);
    setTransactions([]);
    setSelectedUser(null);
    setView('users');
  };

  const Numpad = () => {
    return (
      <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto mt-4 bg-gray-300 p-8 rounded">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handleNumpadClick(num)}
            className="p-4 text-xl font-bold bg-gray-100 rounded-lg hover:bg-gray-200 active:bg-gray-300"
          >
            {num}
          </button>
        ))}
        <button
          onClick={handleClear}
          className="p-4 text-xl font-bold bg-red-100 rounded-lg hover:bg-red-200 active:bg-red-300"
        >
          C
        </button>
        <button
          onClick={() => handleNumpadClick(0)}
          className="p-4 text-xl font-bold bg-gray-100 rounded-lg hover:bg-gray-200 active:bg-gray-300"
        >
          0
        </button>
        <button
          onClick={handleBackspace}
          className="p-4 text-xl font-bold bg-yellow-100 rounded-lg hover:bg-yellow-200 active:bg-yellow-300"
        >
          back
        </button>
      </div>
    );
  };

  return (
    <div className="p-4 max-w-4xl mx-auto bg-white shadow-lg text-gray-900 min-h-screen">
      <header className="flex flex-col items-center mb-10 mt-3">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">securebear.</h1>
          <div className="flex justify-end w-full">
            <p className="text-sm font-semibold text-gray-600 tracking-wide">IT-SOLUTIONS</p>
          </div>
        </div>
      </header> 
      <div className="flex gap-2 mb-4">
        <button 
          onClick={() => setView('users')}
          className={`px-8 py-4 rounded ${view === 'users' ? 'bg-customGray text-white' : 'bg-gray-200'}`}
        >
          Benutzer
        </button>
        <button 
          onClick={() => setView('drinks')}
          className={`px-8 py-4 rounded ${view === 'drinks' ? 'bg-customGray text-white' : 'bg-gray-200'}`}
        >
          Getränke
        </button>
        <button 
          onClick={() => setView('bills')}
          className={`px-8 py-4 rounded ${view === 'bills' ? 'bg-customGray text-white' : 'bg-gray-200'}`}
        >
          Abrechnungen
        </button>
      </div>

      <Dialog 
        open={showPasswordDialog} 
        onClose={() => {
          setShowPasswordDialog(false);
          setPassword('');
          setErrorMessage('');
        }}
      >
        <div className="space-y-4 p-6 bg-gray-100">
          <h2 className="text-lg font-semibold">Passwort erforderlich</h2>
          <p>Bitte geben Sie das Passwort ein, um die Zahlung zu bestätigen.</p>
          {errorMessage && <p className="text-red-500">{errorMessage}</p>}
          <div className="flex justify-center">
            <Numpad />
          </div>
          <div className="flex justify-center gap-2 mt-4">
            <button
              onClick={() => {
                setShowPasswordDialog(false);
                setPassword('');
                setErrorMessage('');
              }}
              className="px-4 py-4 bg-gray-300 rounded"
            >
              Abbrechen
            </button>
            <button
              onClick={handlePasswordSubmit}
              className="px-4 py-4 bg-customGray text-white rounded"
            >
              Bestätigen
            </button>
          </div>
        </div>
      </Dialog>

      {/* User View */}
      {view === 'users' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Benutzer</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
            {users.map((user) => (
              <div 
                key={user.id} 
                onClick={() => setSelectedUser(user)}
                className={`p-4 rounded-lg cursor-pointer flex flex-col items-center 
                  ${selectedUser?.id === user.id ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                <span className="font-medium text-lg">{user.name}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowAddUser(true)}
            className="mt-6 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Add User
          </button>
          <button
                onClick={clearLocalStorage}
                className="px-4 py-2 bg-red-500 text-white rounded"
                >
                Reset Data
          </button>
          <Dialog open={showAddUser} onClose={() => setShowAddUser(false)}>
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-2">Neuen Benutzer hinzufügen</h2>
              <input
                type="text"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="Benutzername"
                className="w-full p-2 mb-2 border border-gray-300 rounded"
              />
              <button
                onClick={addUser}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Hinzufügen
              </button>
            </div>
          </Dialog>
        </div>
      )}

      {/* Drink View */}
      {view === 'drinks' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Getränke</h2>
          <div className="grid grid-cols-2 gap-6">
            {drinks.map((drink) => (
              <button
                key={drink.id}
                onClick={() => addTransaction(drink)}
                className="mt-20 px-15 py-10 bg-customGray text-white font-semibold rounded"
              >
                {drink.name} - {drink.price.toFixed(2)}€
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bills View */}
      {view === 'bills' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Abrechnungen</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
          {users.map((user) => (
            <div key={user.id} className="flex justify-between items-center p-4 bg-gray-200 rounded-lg mb-4">
              <span>{user.name}</span>
              <span>{user.balance.toFixed(2)}€</span>
              <button
                onClick={(e) => initiateSettlePayment(user.id, e)}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Ausgleichen
              </button>
            </div>
          ))}  
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentSystem;
