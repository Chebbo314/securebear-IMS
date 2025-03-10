import React, { useState, useEffect } from 'react';

const TouchKeyboard = ({ onInput, onEnter }) => {
  const [isShift, setIsShift] = useState(false);
  
  const keys = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['⇧', 'z', 'x', 'c', 'v', 'b', 'n', 'm', '⌫'],
    ['space', 'enter']
  ];

  const handleKeyClick = (key) => {
    switch(key) {
      case '⇧':
        setIsShift(!isShift);
        break;
      case '⌫':
        onInput(prev => prev.slice(0, -1));
        break;
      case 'space':
        onInput(prev => prev + ' ');
        break;
      case 'enter':
        onEnter?.();
        break;
      default:
        onInput(prev => prev + (isShift ? key.toUpperCase() : key));
        setIsShift(false);
    }
  };

  return (
    <div className="w-full max-w-3xl bg-gray-100 p-2 rounded-lg">
      {keys.map((row, i) => (
        <div key={i} className="flex justify-center gap-1 mb-1">
          {row.map((key) => (
            <button
              key={key}
              onClick={() => handleKeyClick(key)}
              className={`
                ${key === 'space' ? 'w-64' : key === 'enter' ? 'w-24' : 'w-12'}
                h-12 
                ${isShift && key.length === 1 ? 'text-blue-600' : ''} 
                ${key === '⇧' && isShift ? 'bg-blue-200' : 'bg-white'} 
                rounded-md 
                shadow 
                hover:bg-gray-50 
                active:bg-gray-200 
                font-medium
              `}
            >
              {key === 'space' ? '␣' : key}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};

// Custom Dialog Component
const Dialog = ({ open, onClose, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-100 flex items-center justify-center z-50">
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
  const [showRemoveUser, setShowRemoveUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [view, setView] = useState('users');
  const [transactions, setTransactions] = useState([]);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState('');
  const [pendingUserId, setPendingUserId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showAddConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedDrink, setSelectedDrink] = useState(null);
  const [drinkCounts, setDrinkCounts] = useState({});
  const [userStats, setUserStats] = useState([]);
  const [showRoundDialog, setShowRoundDialog] = useState(false);
  const [roundQuantity, setRoundQuantity] = useState(1);
  const [roundDrink, setRoundDrink] = useState(null);
  const [roundStep, setRoundStep] = useState('select-drink');
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [showPriceEditDialog, setShowPriceEditDialog] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [editingDrink, setEditingDrink] = useState(null);
  const [newPrice, setNewPrice] = useState('');
  const [adminError, setAdminError] = useState('');

  const CORRECT_PASSWORD = '86859';
  const ADMIN_PASSWORD = '86859';

  const handleNumpadClick = (num) => {
    if (showPasswordDialog && password.length < 5) {
      setPassword(prev => prev + num);
    } else if (showAdminDialog && adminPassword.length < 5) {
      setAdminPassword(prev => prev + num);
    }
  };

  const handleBackspace = () => {
    if (showPasswordDialog) {
      setPassword(prev => prev.slice(0, -1));
    } else if (showAdminDialog) {
      setAdminPassword(prev => prev.slice(0, -1));
    }
  };

  const handleClear = () => {
    if (showPasswordDialog) {
      setPassword('');
    } else if (showAdminDialog) {
      setAdminPassword('');
    }
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

  useEffect(() => {
    const counts = transactions.reduce((acc, transaction) => {
      acc[transaction.drinkId] = (acc[transaction.drinkId] || 0) + 1;
      return acc;
    }, {});
    setDrinkCounts(counts);
  }, [transactions]);

  useEffect(() => {
    const stats = users.map(user => {
      const userTransactions = transactions.filter(t => t.userId === user.id);
      return {
        id: user.id,
        name: user.name,
        totalDrinks: userTransactions.length,
        totalSpent: userTransactions.reduce((sum, t) => sum + t.price, 0)
      };
    });
    
    // Sort by total drinks in descending order
    const sortedStats = stats.sort((a, b) => b.totalDrinks - a.totalDrinks);
    setUserStats(sortedStats);
  }, [transactions, users]);

  const [drinks, setDrinks] = useState([
    { id: 1, name: 'Bier', price: 2.00 },
    { id: 2, name: 'Schnaps', price: 2.00 },
    { id: 3, name: 'Alkfrei', price: 1.50 },
    { id: 4, name: 'Goaß', price: 6.00 }
  ]);

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
  
  const removeUser = (userId) => {
    setUsers(users.filter(user => user.id !== userId));
    setShowRemoveUser(false);
  };

  const initiateAddTransaction = (drink) => {
    if (selectedUser) {
      setSelectedDrink(drink);
      setShowConfirmDialog(true); // Open confirmation dialog
    }
  };

  const confirmAddTransaction = () => {
    if (selectedDrink && selectedUser) {
      const newTransaction = {
        id: transactions.length + 1,
        userId: selectedUser.id,
        drinkId: selectedDrink.id,
        price: selectedDrink.price,
        date: new Date().toISOString()
      };
      
      setTransactions([...transactions, newTransaction]);
      
      const updatedUsers = users.map(user => {
        if (user.id === selectedUser.id) {
          return { ...user, balance: user.balance + selectedDrink.price };
        }
        return user;
      });
      
      setUsers(updatedUsers);
      setSelectedUser({ ...selectedUser, balance: selectedUser.balance + selectedDrink.price });
      
      // Reset dialog states
      setShowConfirmDialog(false);
      setSelectedDrink(null);
      setView('users');

    }
  };

  const initiateSettlePayment = (userId, e) => {
    e.stopPropagation();
    setPendingUserId(userId);
    setShowPasswordDialog(true);
    setPassword('');
    setErrorMessage('');
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

  const initiateRound = (drink) => {
    if (selectedUser) {
      setRoundDrink(drink);
      setShowRoundDialog(true);
    }
  };

  const selectDrinkForRound = (drink) => {
    setRoundDrink(drink);
    setRoundStep('select-quantity');
  };

  const confirmRound = () => {
    if (roundDrink && selectedUser && roundQuantity > 0) {
      // Erstelle Transaktionen für jedes Getränk in der Runde
      const newTransactions = [];
      const totalPrice = roundDrink.price * roundQuantity;

      // Erstelle die angegebene Anzahl an Transaktionen
      for (let i = 0; i < roundQuantity; i++) {
        newTransactions.push({
          id: transactions.length + i + 1,
          userId: selectedUser.id,
          drinkId: roundDrink.id,
          price: roundDrink.price,
          date: new Date().toISOString(),
          isRound: true
        });
      }

      setTransactions([...transactions, ...newTransactions]);

      // Update des Benutzerguthabens
      const updatedUsers = users.map(user => {
        if (user.id === selectedUser.id) {
          return { ...user, balance: user.balance + totalPrice };
        }
        return user;
      });

      setUsers(updatedUsers);
      setSelectedUser({ ...selectedUser, balance: selectedUser.balance + totalPrice });

      // Reset der Dialog-States
      setShowRoundDialog(false);
      setRoundDrink(null);
      setRoundQuantity(1);
      setRoundStep('select-drink');
      setView('users');
    }
  };

  const resetRoundDialog = () => {
    setShowRoundDialog(false);
    setRoundDrink(null);
    setRoundQuantity(1);
    setRoundStep('select-drink');
  };

  const verifyAdminPassword = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      setShowAdminDialog(false);
      setShowPriceEditDialog(true);
      setAdminPassword('');
      setAdminError('');
    } else {
      setAdminError('Falsches Passwort');
      setAdminPassword('');
    }
  };

  const updatePrice = () => {
    if (!editingDrink || isNaN(newPrice) || newPrice <= 0) return;
  
    const updatedDrinks = drinks.map(drink => {
      if (drink.id === editingDrink.id) {
        return { ...drink, price: parseFloat(newPrice) };
      }
      return drink;
    });
  
    // Use setDrinks instead of reassignment
    setDrinks(updatedDrinks);
    
    setEditingDrink(null);
    setNewPrice('');
  };

  return (
    <div className="p-4 max-w-8xl mx-auto bg-white shadow-lg text-gray-900 min-h-screen">
      <header className="flex justify-between mb-10 mt-5 mr-5 ml-5">
        <div className="">
          <h1 className="text-5xl font-bold text-gray-900">Z-IT.</h1>
          <p className="text-sm font-semibold text-gray-600 tracking-wider mt-1">IT-SOLUTIONS</p>
        </div>
        <div className="flex gap-6 mb-10 text-xl justify-center">
          <button 
            onClick={() => setView('users')}
            className={`px-14 py-6 rounded ${view === 'users' ? 'bg-customGray text-white' : 'bg-gray-200'}`}
          >
            Benutzer
          </button>
          <button 
            onClick={() => setView('drinks')}
            className={`px-14 py-6 rounded ${view === 'drinks' ? 'bg-customGray text-white' : 'bg-gray-200'}`}
          >
            Getränke
          </button>
          <button 
            onClick={() => setView('bills')}
            className={`px-12 py-6 rounded ${view === 'bills' ? 'bg-customGray text-white' : 'bg-gray-200'}`}
          >
            Abrechnungen
          </button>
          <button 
            onClick={() => setView('stats')}
            className={`px-12 py-6 rounded ${view === 'stats' ? 'bg-customGray text-white' : 'bg-gray-200'}`}
          >
            Statistik
          </button>
          <button 
            onClick={() => setShowAdminDialog(true)}
            className="px-12 py-6 rounded bg-gray-800 text-white"
          >
          Einstellungen
          </button>
        </div>
      </header>
      <Dialog 
        open={showAdminDialog} 
        onClose={() => {
          setShowAdminDialog(false);
          setAdminPassword('');
          setAdminError('');
        }}
      >
        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Admin-Bereich</h2>
          {adminError && (
            <p className="text-red-500 mb-4">{adminError}</p>
          )}
          <div className="mb-4">
            <input
              type="password"
              value={adminPassword}
              readOnly
              placeholder="Admin Passwort"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="flex justify-center">
            <Numpad />
          </div>
          <div className="flex justify-end gap-4">
            <button 
              onClick={() => {
                setShowAdminDialog(false);
                setAdminPassword('');
                setAdminError('');
              }}
              className="px-4 py-2 bg-gray-200 rounded mt-4"
            >
              Abbrechen
            </button>
            
            <button 
              onClick={verifyAdminPassword}
              className="px-4 py-2 bg-blue-500 text-white rounded mt-4"
            >
              Bestätigen
            </button>
          </div>
        </div>
      </Dialog>


      {/* Price Edit Dialog */}
      <Dialog 
        open={showPriceEditDialog} 
        onClose={() => setShowPriceEditDialog(false)}
      >
        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-6">Preise bearbeiten</h2>
          <div className="space-y-4">
            {drinks.map(drink => (
              <div key={drink.id} className="flex items-center justify-between p-6 bg-gray-100 rounded">
                <span className="text-lg mr-5">{drink.name}</span>
                {editingDrink?.id === drink.id ? (
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      className="w-24 p-2 border border-gray-300 rounded"
                      step="0.10"
                      min="0"
                    />
                    <button
                      onClick={updatePrice}
                      className="px-3 py-2 bg-green-500 text-white rounded"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => {
                        setEditingDrink(null);
                        setNewPrice('');
                      }}
                      className="px-3 py-2 bg-red-500 text-white rounded"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <span>{drink.price.toFixed(2)}€</span>
                    <button
                      onClick={() => {
                        setEditingDrink(drink);
                        setNewPrice(drink.price.toString());
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded"
                    >
                      Bearbeiten
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-6">
            <button 
              onClick={() => setShowPriceEditDialog(false)}
              className="px-6 py-3 bg-gray-200 rounded"
            >
              Schließen
            </button>
          </div>
        </div>
      </Dialog>
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
        <div className="flex-grow overflow-y-auto px-4 pt-4 mb-4"> 
          <h2 className="text-3xl font-semibold mb-4">Benutzer</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-6 gap-8 max-h-full overflow-y-auto">
            {users.map((user) => (
              <div
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className={`p-8 rounded-lg cursor-pointer flex flex-col items-center 
                  ${selectedUser?.id === user.id ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                <span className="font-medium text-lg">{user.name}</span>
              </div>
            ))}
          </div>
          
          {/* Buttons Container */}
          <div className="flex space-x-4 mt-40">
            {/* Add User Button */}
            <button
              onClick={() => setShowAddUser(true)}
              className="mt-auto px-12 py-4 bg-green-500 text-black rounded mr-auto tracking-wide"
            >
              Add User
            </button>

          </div>
          
        <Dialog open={showAddUser} onClose={() => setShowAddUser(false)}>
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-2">Neuen Benutzer hinzufügen</h2>
            <input
              type="text"
              value={newUserName}
              readOnly
              placeholder="Benutzername"
              className="w-full p-2 mb-4 border border-gray-300 rounded"
            />
            <TouchKeyboard 
              onInput={setNewUserName}
              onEnter={() => {
              if (newUserName.trim()) {
                addUser();
                setNewUserName('');
            }
            }}
            />
            </div>
          </Dialog>

          <Dialog open={showRemoveUser} onClose={() => setShowRemoveUser(false)}>
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-2">Benutzer entfernen</h2>
              <ul className="list-none space-y-2">
                {users.map((user) => (
                  <li key={user.id} className="flex items-center justify-between">
                    <span>{user.name}</span>
                    <button
                      onClick={() => removeUser(user.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded"
                    >
                      Löschen
                    </button>
                  </li>
            ))}
            </ul>
          </div>
        </Dialog>
        </div>
      )}


    {/* Drink View */}
  {view === 'drinks' && (
    <div>
      <h2 className="text-3xl font-semibold mb-10 mr-5 ml-5">Getränke</h2>
      <div className="text-xl grid grid-cols-2 gap-10 mr-auto ml-auto max-w-4xl">
        {drinks.map((drink) => (
          <button
            key={drink.id}
            onClick={() => initiateAddTransaction(drink)}
            className="mt-5 px-10 py-10 bg-customGray text-white font-semibold rounded"
          >
            {drink.name} - {drink.price.toFixed(2)}€
          </button>
        ))}
      </div>
      <div className="flex justify-center mt-10">
        <button
          onClick={initiateRound}
          className="px-10 py-6 bg-blue-500 text-white font-semibold rounded text-xl"
        >
          Runde ausgeben
        </button>
      </div>
    </div>
  )}

  {/* Runden Dialog */}
      <Dialog 
        open={showRoundDialog} 
        onClose={resetRoundDialog}
      >
        <div className="p-6">
          {roundStep === 'select-drink' ? (
            <>
              <h2 className="text-2xl font-semibold mb-6">Getränk für die Runde auswählen</h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {drinks.map((drink) => (
                  <button
                    key={drink.id}
                    onClick={() => selectDrinkForRound(drink)}
                    className="p-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-lg font-medium"
                  >
                    {drink.name} - {drink.price.toFixed(2)}€
                  </button>
                ))}
              </div>
              <div className="flex justify-end">
                <button 
                  onClick={resetRoundDialog}
                  className="px-6 py-3 bg-gray-200 rounded"
                >
                  Abbrechen
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-semibold mb-4">Anzahl festlegen</h2>
              <p className="mb-4">
                Wie viele {roundDrink?.name} möchtest du ausgeben?
              </p>
              <div className="flex items-center justify-center gap-4 mb-6">
                <button 
                  onClick={() => setRoundQuantity(Math.max(1, roundQuantity - 1))}
                  className="px-4 py-2 bg-gray-200 rounded-lg text-xl"
                >
                  -
                </button>
                <span className="text-2xl font-bold">{roundQuantity}</span>
                <button 
                  onClick={() => setRoundQuantity(roundQuantity + 1)}
                  className="px-4 py-2 bg-gray-200 rounded-lg text-xl"
                >
                  +
                </button>
              </div>
              <p className="mb-6 text-center text-lg">
                Gesamtpreis: {(roundDrink?.price * roundQuantity).toFixed(2)}€
              </p>
              <div className="flex justify-end gap-4">
                <button 
                  onClick={() => setRoundStep('select-drink')}
                  className="px-6 py-3 bg-gray-200 rounded"
                >
                  Zurück
                </button>
                <button 
                  onClick={confirmRound}
                  className="px-6 py-3 bg-blue-500 text-white rounded"
                >
                  Bestätigen
                </button>
              </div>
            </>
          )}
        </div>
      </Dialog>

      {/* Confirmation Dialog for adding a drink */}
      <Dialog 
        open={showAddConfirmDialog} 
        onClose={() => setShowConfirmDialog(false)}
      >
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-2">Bestätigung</h2>
          <p>Möchten Sie {selectedDrink?.name} für {selectedDrink?.price.toFixed(2)}€ zu {selectedUser?.name} hinzufügen?</p>
          <div className="flex justify-end gap-4 mt-4">
            <button 
              onClick={() => setShowConfirmDialog(false)}
              className="px-4 py-2 bg-gray-300 rounded"
            >
              Abbrechen
            </button>
            <button 
              onClick={confirmAddTransaction}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Bestätigen
            </button>
          </div>
        </div>
      </Dialog>

      {/* Bills View */}
      {view === 'bills' && (
        <div>
          <h2 className="text-3xl font-semibold mb-10 mr-5 ml-5">Abrechnungen</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto mr-5 ml-5">
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
      {view === 'stats' && (
    <div className="justify-center items-center min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Drinks Statistics */}
          <div className="p-10 bg-white rounded-lg shadow-lg">
            <h3 className="text-2xl font-semibold mb-6 text-center">Getränkestatistik</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {drinks.map(drink => (
                <div key={drink.id} className="bg-gray-100 p-6 rounded-lg shadow-md text-center">
                  <p className="font-medium text-lg">{drink.name}</p>
                  <p className="text-3xl font-bold text-indigo-600">{drinkCounts[drink.id] || 0}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Top Users List */}
          <div className="p-10 bg-white rounded-lg shadow-lg">
            <h3 className="text-2xl font-semibold mb-6 text-center">Top Benutzer</h3>
            <div className="space-y-4">
              {userStats.map((stat, index) => (
                <div key={stat.id} className="bg-gray-100 p-4 rounded-lg shadow-md">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-indigo-600">#{index + 1}</span>
                      <span className="font-medium text-lg">{stat.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{stat.totalDrinks} Getränke</p>
                      <p className="text-sm text-gray-600">{stat.totalSpent.toFixed(2)}€</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )}
    </div>
  );
};

export default PaymentSystem;
