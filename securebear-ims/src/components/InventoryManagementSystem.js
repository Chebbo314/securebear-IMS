import React, { useState, useEffect } from 'react';

const customStyles = `
  .bg-customGray {
    background-color: #6b7280;
  }
`;

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
  const getCurrentMode = () => {
    if (showPasswordDialog && paymentStep === 'password') return 'password';
    if (showPasswordDialog && paymentStep === 'amount') return 'amount';
    if (showAdminDialog) return 'admin';
    if (showBudgetDialog && budgetStep === 'password') return 'budgetPassword'; // Neue Zeile
    if (showBudgetDialog && budgetStep === 'amount') return 'budget';
    if (showFreeAmountDialog) return 'freeAmount';
    return 'default';
  };
  const [newPrice, setNewPrice] = useState('');
  const [adminError, setAdminError] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentStep, setPaymentStep] = useState('amount'); // 'amount' oder 'password'
  const [showLogDialog, setShowLogDialog] = useState(false);
  const [logs, setLogs] = useState([]);
  const [currentLogName, setCurrentLogName] = useState('');
  const [showCreateLogDialog, setShowCreateLogDialog] = useState(false);
  const [newLogName, setNewLogName] = useState('');
  const [savedLogs, setSavedLogs] = useState({});
  const [showEditUser, setShowEditUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editUserName, setEditUserName] = useState('');
  const [showBudgetDialog, setShowBudgetDialog] = useState(false);
  const [budgetAmount, setBudgetAmount] = useState('');
  const [showFreeAmountDialog, setShowFreeAmountDialog] = useState(false);
  const [freeAmount, setFreeAmount] = useState('');
  const [budgetPassword, setBudgetPassword] = useState('');
  const [budgetStep, setBudgetStep] = useState('amount');
  const [budgetError, setBudgetError] = useState('');
  const CORRECT_PASSWORD = '86859';
  const ADMIN_PASSWORD = '86859';

  const addBudgetToUser = () => {
    if (budgetPassword === CORRECT_PASSWORD) {
      const updatedUsers = users.map(user => {
        if (user.id === pendingUserId) {
          return { ...user, balance: user.balance - parseInt(budgetAmount) };
        }
        return user;
      });

      setUsers(updatedUsers);
      if (selectedUser && selectedUser.id === pendingUserId) {
        setSelectedUser({ ...selectedUser, balance: selectedUser.balance - parseInt(budgetAmount) });
      }

      // Füge Budget-Eintrag zum Log hinzu
      const user = users.find(u => u.id === pendingUserId);
      addToLog('add_budget', {
        userName: user.name,
        amount: parseInt(budgetAmount),
        date: new Date().toISOString()
      });

      // Reset aller States
      setShowBudgetDialog(false);
      setPendingUserId(null);
      setBudgetAmount('');
      setBudgetPassword('');
      setBudgetStep('amount');
      setBudgetError('');
    } else {
      setBudgetError('Falsches Passwort');
      setBudgetPassword('');
    }
  };

  const initiateBudgetAddition = (userId, e) => {
    e.stopPropagation();
    setPendingUserId(userId);
    setBudgetAmount('');
    setBudgetPassword('');
    setBudgetStep('amount');
    setShowBudgetDialog(true);
    setBudgetError('');
  };

  const handleNumpadClick = (num) => {
    const actions = {
      password: () => password.length < 5 && setPassword(prev => prev + num),
      amount: () => setPaymentAmount(prev => prev + num),
      admin: () => adminPassword.length < 5 && setAdminPassword(prev => prev + num),
      budget: () => setBudgetAmount(prev => prev + num),
      budgetPassword: () => budgetPassword.length < 5 && setBudgetPassword(prev => prev + num), // Neue Zeile
      freeAmount: () => setFreeAmount(prev => prev + num)
    };

    const currentMode = getCurrentMode();
    actions[currentMode]?.();
  };

  const handleBackspace = () => {
    const actions = {
      password: () => setPassword(prev => prev.slice(0, -1)),
      amount: () => setPaymentAmount(prev => prev.slice(0, -1)),
      admin: () => setAdminPassword(prev => prev.slice(0, -1)),
      budget: () => setBudgetAmount(prev => prev.slice(0, -1)),
      budgetPassword: () => setBudgetPassword(prev => prev.slice(0, -1)), // Neue Zeile
      freeAmount: () => setFreeAmount(prev => prev.slice(0, -1))
    };

    const currentMode = getCurrentMode();
    actions[currentMode]?.();
  };

  const handleClear = () => {
    if (showPasswordDialog && paymentStep === 'password') {
      setPassword('');
    } else if (showPasswordDialog && paymentStep === 'amount') {
      setPaymentAmount('');
    } else if (showAdminDialog) {
      setAdminPassword('');
    } else if (showBudgetDialog && budgetStep === 'password') {
      setBudgetPassword(''); // Neue Zeile
    } else if (showBudgetDialog && budgetStep === 'amount') {
      setBudgetAmount('');
    } else if (showFreeAmountDialog) {
      setFreeAmount('');
    }
  };

  useEffect(() => {
    const savedLogsData = localStorage.getItem('savedLogs');
    if (savedLogsData) setSavedLogs(JSON.parse(savedLogsData));
  }, []);
  
  useEffect(() => {
    localStorage.setItem('savedLogs', JSON.stringify(savedLogs));
  }, [savedLogs]);
  
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

  const addToLog = (action, data) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action,
      data
    };
    setLogs(prevLogs => [...prevLogs, logEntry]);
  };
  
  const createNewLog = () => {
    if (newLogName.trim()) {
      setCurrentLogName(newLogName);
      setLogs([]);
      setNewLogName('');
      setShowCreateLogDialog(false);
      
      // Erstes Log-Eintrag für neue Session
      addToLog('session_start', { name: newLogName, date: new Date().toISOString() });
    }
  };

  const saveCurrentLog = () => {
    if (currentLogName && logs.length > 0) {
      // Berechne die Gesamteinnahmen für diesen Log
      const totalIncome = logs
        .filter(log => log.action === 'add_transaction' || log.action === 'add_round')
        .reduce((sum, log) => sum + (log.data.totalPrice || log.data.price), 0);
      
      const logData = {
        name: currentLogName,
        date: new Date().toISOString(),
        entries: logs,
        totalIncome: totalIncome
      };
      
      setSavedLogs(prev => ({
        ...prev,
        [currentLogName]: logData
      }));
      
      alert(`Log "${currentLogName}" gespeichert!`);
    }
  };
  
  const loadLog = (logName) => {
    if (savedLogs[logName]) {
      setLogs(savedLogs[logName].entries);
      setCurrentLogName(logName);
      setSelectedLog(logName);
      setShowSavedLogsDialog(false);
    }
  };
  
  const addFreeAmountToUser = () => {
  if (isNaN(parseInt(freeAmount)) || parseInt(freeAmount) <= 0) {
    setErrorMessage('Bitte geben Sie einen gültigen Betrag ein');
    return;
  }

    const updatedUsers = users.map(user => {
      if (user.id === pendingUserId) {
        // Füge den Betrag zum Guthaben hinzu (erhöht die Schulden)
        return { ...user, balance: user.balance + parseInt(freeAmount) };
      }
      return user;
    });

    setUsers(updatedUsers);
    if (selectedUser && selectedUser.id === pendingUserId) {
      setSelectedUser({ ...selectedUser, balance: selectedUser.balance + parseInt(freeAmount) });
    }

    // Füge Freibetrag-Eintrag zum Log hinzu
    const user = users.find(u => u.id === pendingUserId);
    addToLog('add_free_amount', {
      userName: user.name,
      amount: parseInt(freeAmount),
      date: new Date().toISOString()
    });

    setShowFreeAmountDialog(false);
    setPendingUserId(null);
    setFreeAmount('');
    setErrorMessage('');
  };

  // 2. Neue Funktion für Freibetrag initialisieren (nach initiateBudgetAddition)
  const initiateFreeAmountAddition = (userId, e) => {
    e.stopPropagation();
    setPendingUserId(userId);
    setFreeAmount('');
    setShowFreeAmountDialog(true);
    setErrorMessage('');
  };

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
          // Nur den ausgewählten Betrag abziehen
          const newBalance = Math.max(0, user.balance - parseInt(paymentAmount));
          return { ...user, balance: newBalance };
        }
        return user;
      });
      
      setUsers(updatedUsers);
      if (selectedUser && selectedUser.id === pendingUserId) {
        const newBalance = Math.max(0, selectedUser.balance - parseInt(paymentAmount));
        setSelectedUser({ ...selectedUser, balance: newBalance });
      }
      
      // Füge Zahlung zum Log hinzu
      const user = users.find(u => u.id === pendingUserId);
      addToLog('payment', {
        userName: user.name,
        amount: parseInt(paymentAmount),
        date: new Date().toISOString()
      });
      
      setShowPasswordDialog(false);
      setPendingUserId(null);
      setPassword('');
      setPaymentAmount('');
      setErrorMessage('');
      setPaymentStep('amount');
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
  
  const editUser = () => {
    if (editUserName.trim() && editingUser) {
      const updatedUsers = users.map(user => 
        user.id === editingUser.id 
          ? { ...user, name: editUserName.trim() }
          : user
      );
      setUsers(updatedUsers);

      // Update selectedUser if it's the one being edited
      if (selectedUser && selectedUser.id === editingUser.id) {
        setSelectedUser({ ...selectedUser, name: editUserName.trim() });
      }

      setEditUserName('');
      setEditingUser(null);
      setShowEditUser(false);
    }
  };

  const initiateEditUser = () => {
    if (selectedUser) {
      setEditingUser(selectedUser);
      setEditUserName(selectedUser.name);
      setShowEditUser(true);
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

  const confirmBudgetAmount = () => {
    if (isNaN(parseInt(budgetAmount)) || parseInt(budgetAmount) <= 0) {
      setBudgetError('Bitte geben Sie einen gültigen Betrag ein');
      return;
    }

    setBudgetStep('password');
    setBudgetError('');
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
      
      // Füge Transaktion zum Log hinzu
      addToLog('add_transaction', {
        userName: selectedUser.name,
        drinkName: selectedDrink.name,
        price: selectedDrink.price,
        date: new Date().toISOString()
      });
      
      // Reset dialog states
      setShowConfirmDialog(false);
      setSelectedDrink(null);
      setView('users');
    }
  };

  const initiateSettlePayment = (userId, e) => {
    e.stopPropagation();
    setPendingUserId(userId);
    setPaymentStep('amount');
    const user = users.find(u => u.id === userId);
    setPaymentAmount(Math.floor(user.balance).toString()); // Nur volle Zahlen
    setShowPasswordDialog(true);
    setPassword('');
    setErrorMessage('');
  };

  const confirmAmount = () => {
    if (isNaN(parseInt(paymentAmount)) || parseInt(paymentAmount) <= 0) {
      setErrorMessage('Bitte geben Sie einen gültigen Betrag ein');
      return;
    }
    
    const user = users.find(u => u.id === pendingUserId);
    if (parseInt(paymentAmount) > user.balance) {
      setErrorMessage('Der Betrag kann nicht größer als das Guthaben sein');
      return;
    }
    
    setPaymentStep('password');
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
      
      // Füge Runde zum Log hinzu
      addToLog('add_round', {
        userName: selectedUser.name,
        drinkName: roundDrink.name,
        quantity: roundQuantity,
        totalPrice: totalPrice,
        date: new Date().toISOString()
      });
  
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

  const verifyAdminPassword = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      setShowAdminDialog(false);
      // Hier können Sie entscheiden, welcher Dialog angezeigt werden soll
      // entweder Preisbearbeitung oder Log-Verwaltung
      setShowPriceEditDialog(true);
      setAdminPassword('');
      setAdminError('');
    } else {
      setAdminError('Falsches Passwort');
      setAdminPassword('');
    }
  };

  const adminOptions = [
    { id: 'prices', name: 'Preise bearbeiten' },
    { id: 'logs', name: 'Log-Verwaltung' }
  ];

  const handleAdminOptionSelect = (optionId) => {
    setShowAdminDialog(false);
    if (optionId === 'prices') {
      setShowPriceEditDialog(true);
    } else if (optionId === 'logs') {
      setShowLogDialog(true);
    }
  };
  
  const totalOpenBills = users
    .filter(user => user.balance > 0)
    .reduce((sum, user) => sum + user.balance, 0);

  const LogView = () => {
    if (!currentLogName) {
      return (
        <div className="text-center p-6">
          <p className="mb-4">Kein aktives Log. Bitte erstellen Sie ein neues Log oder laden Sie ein gespeichertes.</p>
          <div className="flex justify-center gap-4">
            <button 
              onClick={() => setShowCreateLogDialog(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Neues Log erstellen
            </button>
            <button 
              onClick={() => setShowSavedLogsDialog(true)}
              className="px-4 py-2 bg-gray-200 rounded"
            >
              Gespeicherte Logs
            </button>
          </div>
        </div>
      );
    }
  
    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Log: {currentLogName}</h3>
          <div className="flex gap-2">
            <button 
              onClick={saveCurrentLog}
              className="px-4 py-2 bg-green-500 text-white rounded"
            >
              Speichern
            </button>
            <button 
              onClick={() => setShowSavedLogsDialog(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Logs laden
            </button>
          </div>
        </div>
        
        <div className="bg-gray-100 p-4 rounded-lg mb-4">
          <div className="overflow-y-auto max-h-96 p-2">
            {logs.length === 0 ? (
              <p className="text-center text-gray-500">Keine Einträge</p>
            ) : (
              logs.map((log, index) => {
                const date = new Date(log.timestamp);
                const formattedTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
                
                return (
                  <div key={index} className="mb-2 p-2 bg-white rounded shadow">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">{formattedTime}</span>
                      <span className="text-sm font-medium">
                        {log.action === 'session_start' && 'Session gestartet'}
                        {log.action === 'add_transaction' && 'Getränkekauf'}
                        {log.action === 'add_round' && 'Runde ausgegeben'}
                        {log.action === 'payment' && 'Zahlung'}
                      </span>
                    </div>
                    <div className="mt-1">
                      {log.action === 'session_start' && (
                        <p>Neue Session "{log.data.name}" gestartet</p>
                      )}
                      {log.action === 'add_transaction' && (
                        <p>
                          <span className="font-medium">{log.data.userName}</span> kaufte <span className="font-medium">{log.data.drinkName}</span> für <span className="font-medium">{log.data.price.toFixed(2)}€</span>
                        </p>
                      )}
                      {log.action === 'add_round' && (
                        <p>
                          <span className="font-medium">{log.data.userName}</span> gab eine Runde aus: <span className="font-medium">{log.data.quantity}x {log.data.drinkName}</span> für <span className="font-medium">{log.data.totalPrice.toFixed(2)}€</span>
                        </p>
                      )}
                      {log.action === 'payment' && (
                        <p>
                          <span className="font-medium">{log.data.userName}</span> zahlte <span className="font-medium">{log.data.amount}€</span>
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Zusammenfassung</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm">Gesamteinnahmen:</p>
              <p className="text-2xl font-bold">
                {logs
                  .filter(log => log.action === 'add_transaction' || log.action === 'add_round')
                  .reduce((sum, log) => sum + (log.data.totalPrice || log.data.price), 0)
                  .toFixed(2)}€
              </p>
            </div>
            <div>
              <p className="text-sm">Anzahl Getränke:</p>
              <p className="text-2xl font-bold">
                {logs
                  .filter(log => log.action === 'add_transaction')
                  .length +
                  logs
                  .filter(log => log.action === 'add_round')
                  .reduce((sum, log) => sum + log.data.quantity, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 max-w-8xl mx-auto bg-white shadow-lg text-gray-900 min-h-screen">
      <header className="flex justify-between mb-10 mt-5 mr-5 ml-5">
        <div className="">
          <h1 className="text-5xl font-bold text-gray-900">Z-IT.</h1>
        </div>
        <div className="flex gap-6 mb-10 text-l justify-center">
          <button 
            onClick={() => setView('users')}
            className={`px-12 py-6 rounded ${view === 'users' ? 'bg-customGray text-white' : 'bg-gray-200'}`}
          >
            Benutzer
          </button>
          <button 
            onClick={() => setView('drinks')}
            className={`px-12 py-6 rounded ${view === 'drinks' ? 'bg-customGray text-white' : 'bg-gray-200'}`}
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

<Dialog open={showLogDialog} onClose={() => setShowLogDialog(false)}>
  <div className="p-6 w-full max-w-4xl">
    <h2 className="text-2xl font-semibold mb-4">Transaktions-Log</h2>
    <LogView />
    <div className="flex justify-end mt-4">
      <button
        onClick={() => setShowLogDialog(false)}
        className="px-4 py-2 bg-gray-200 rounded"
      >
        Schließen
      </button>
    </div>
  </div>
</Dialog>

<Dialog open={showCreateLogDialog} onClose={() => setShowCreateLogDialog(false)}>
  <div className="p-6">
    <h2 className="text-lg font-semibold mb-2">Neues Log erstellen</h2>
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">Log-Name (z.B. "Goaßnfetz")</label>
      <input
        type="text"
        value={newLogName}
        onChange={(e) => setNewLogName(e.target.value)}
        placeholder="Log-Name eingeben"
        className="w-full p-2 border border-gray-300 rounded"
      />
    </div>
    <div className="flex justify-end gap-2">
      <button
        onClick={() => setShowCreateLogDialog(false)}
        className="px-4 py-2 bg-gray-200 rounded"
      >
        Abbrechen
      </button>
      <button
        onClick={createNewLog}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Erstellen
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
              <div key={drink.id} className="flex items-center justify-between p-12 bg-gray-100 rounded">
                <span className="text-2xl mr-5">{drink.name}</span>
                {editingDrink?.id === drink.id ? (
                  <div className="flex items-center gap-10">
                    <input
                      type="number"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      className="w-25 p-4 border border-gray-300 rounded text-4xl"
                      step="0.10"
                      min="0"
                    />
                    <button
                      onClick={updatePrice}
                      className="px-6 py-4 bg-green-500 text-white rounded text-2xl"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => {
                        setEditingDrink(null);
                        setNewPrice('');
                      }}
                      className="px-6 py-4 bg-red-500 text-white rounded text-2xl"
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
            <button
              onClick={initiateEditUser}
              disabled={!selectedUser}
              className={`mt-auto px-12 py-4 rounded tracking-wide ${
                selectedUser 
                  ? 'bg-yellow-500 text-black hover:bg-yellow-600' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Edit User
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

          <Dialog open={showEditUser} onClose={() => setShowEditUser(false)}>
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-2">Benutzername bearbeiten</h2>
              <input
                type="text"
                value={editUserName}
                readOnly
                placeholder="Neuer Benutzername"
                className="w-full p-2 mb-4 border border-gray-300 rounded"
              />
              <TouchKeyboard 
                onInput={setEditUserName}
                onEnter={() => {
                  if (editUserName.trim()) {
                    editUser();
                  }
                }}
              />
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setShowEditUser(false)}
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  Abbrechen
                </button>
                <button
                  onClick={editUser}
                  className="px-4 py-2 bg-yellow-500 text-white rounded"
                >
                  Speichern
                </button>
              </div>
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
      
      <Dialog 
        open={showPasswordDialog} 
        onClose={() => {
          setShowPasswordDialog(false);
          setPassword('');
          setPaymentAmount('');
          setErrorMessage('');
          setPaymentStep('amount');
        }}
      >
        <div className="space-y-4 p-6 bg-gray-100">
          {paymentStep === 'amount' ? (
            <>
              <h2 className="text-lg font-semibold">Zahlungsbetrag festlegen</h2>
              <p>Wie viel soll von der Rechnung abgezogen werden?</p>
              {errorMessage && <p className="text-red-500">{errorMessage}</p>}
              <div className="w-full bg-white rounded-lg p-4 mb-4 text-center">
                <span className="text-2xl font-semibold">{paymentAmount ? paymentAmount + '€' : '0€'}</span>
              </div>
              <div className="flex justify-center">
                <Numpad />
              </div>
              <div className="flex justify-center gap-2 mt-4">
                <button
                  onClick={() => {
                    setShowPasswordDialog(false);
                    setPaymentAmount('');
                    setErrorMessage('');
                    setPaymentStep('amount');
                  }}
                  className="px-4 py-4 bg-gray-300 rounded"
                >
                  Abbrechen
                </button>
                <button
                  onClick={confirmAmount}
                  className="px-4 py-4 bg-customGray text-white rounded"
                >
                  Weiter
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold">Passwort erforderlich</h2>
              <p>Bitte geben Sie das Passwort ein, um {paymentAmount}€ abzuziehen.</p>
              {errorMessage && <p className="text-red-500">{errorMessage}</p>}
              <div className="w-full bg-white rounded-lg p-2 mb-4 text-center">
                <span className="text-xl">{password.replace(/./g, '•')}</span> 
              </div>
              <div className="flex justify-center">
                <Numpad />
              </div>
              <div className="flex justify-center gap-2 mt-4">
                <button
                  onClick={() => setPaymentStep('amount')}
                  className="px-4 py-4 bg-gray-300 rounded"
                >
                  Zurück
                </button>
                <button
                  onClick={handlePasswordSubmit}
                  className="px-4 py-4 bg-customGray text-white rounded"
                >
                  Bestätigen
                </button>
              </div>
            </>
          )}
        </div>
      </Dialog>
      
      <Dialog 
        open={showAdminDialog && adminPassword === ADMIN_PASSWORD} 
        onClose={() => {
          setShowAdminDialog(false);
          setAdminPassword('');
          setAdminError('');
        }}
      >
        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-6">Admin-Optionen</h2>
          <div className="grid grid-cols-1 gap-4">
            {adminOptions.map(option => (
              <button
                key={option.id}
                onClick={() => handleAdminOptionSelect(option.id)}
                className="px-6 py-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-left font-medium"
              >
                {option.name}
              </button>
            ))}
          </div>
          <div className="flex justify-end mt-6">
            <button 
              onClick={() => {
                setShowAdminDialog(false);
                setAdminPassword('');
              }}
              className="px-4 py-2 bg-gray-200 rounded"
            >
              Abbrechen
            </button>
          </div>
        </div>
      </Dialog>
      <Dialog 
  open={showBudgetDialog} 
  onClose={() => {
    setShowBudgetDialog(false);
    setBudgetAmount('');
    setBudgetPassword('');
    setBudgetStep('amount');
    setBudgetError('');
  }}
>
  <div className="space-y-4 p-6 bg-gray-100">
    {budgetStep === 'amount' ? (
        <>
          <h2 className="text-lg font-semibold">Budget hinzufügen</h2>
          <p>Bitte geben Sie den Betrag ein, der als Budget hinzugefügt werden soll:</p>
          {budgetError && <p className="text-red-500">{budgetError}</p>}
          <div className="w-full bg-white rounded-lg p-4 mb-4 text-center">
            <span className="text-2xl font-semibold">{budgetAmount ? budgetAmount + '€' : '0€'}</span>
          </div>
          <div className="flex justify-center">
            <Numpad />
          </div>
          <div className="flex justify-center gap-2 mt-4">
            <button
              onClick={() => {
                setShowBudgetDialog(false);
                setBudgetAmount('');
                setBudgetError('');
                setBudgetStep('amount');
              }}
              className="px-4 py-4 bg-gray-300 rounded"
            >
              Abbrechen
            </button>
            <button
              onClick={confirmBudgetAmount}
              className="px-4 py-4 bg-green-500 text-white rounded"
            >
              Weiter
            </button>
          </div>
        </>
      ) : (
        <>
          <h2 className="text-lg font-semibold">Passwort erforderlich</h2>
          <p>Bitte geben Sie das Passwort ein, um {budgetAmount}€ als Budget hinzuzufügen.</p>
          {budgetError && <p className="text-red-500">{budgetError}</p>}
          <div className="w-full bg-white rounded-lg p-2 mb-4 text-center">
            <span className="text-xl">{budgetPassword.replace(/./g, '•')}</span>
          </div>
          <div className="flex justify-center">
            <Numpad />
          </div>
          <div className="flex justify-center gap-2 mt-4">
            <button
              onClick={() => setBudgetStep('amount')}
              className="px-4 py-4 bg-gray-300 rounded"
            >
              Zurück
            </button>
            <button
              onClick={addBudgetToUser}
              className="px-4 py-4 bg-green-500 text-white rounded"
            >
              Budget hinzufügen
            </button>
          </div>
        </>
      )}
    </div>
  </Dialog>
      {/* Bills View */}
      {view === 'bills' && (
        <div>
          <h2 className="text-2xl font-semibold mb-5 mr-5 ml-5">Abrechnungen</h2>
          <h3 className="text-xl font-medium ml-5 mb-4">
            Gesamt offene Beträge: {totalOpenBills.toFixed(2)}€
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 max-h-96 overflow-y-auto mr-10 ml-4">
          {users.map((user) => (
            <div key={user.id} className="flex justify-between items-center p-4 bg-gray-200 rounded-lg mb-4">
              <span>{user.name}</span>
              <span>
                {user.balance >= 0
                ? `-${user.balance.toFixed(2)}€`
                : `${Math.abs(user.balance).toFixed(2)}€`} 
              </span>
              <div className="flex gap-2">
                <button
                  onClick={(e) => initiateFreeAmountAddition(user.id, e)}
                  className="px-4 py-2 bg-orange-500 text-white rounded"
                >
                  Freibetrag
                </button>
                <Dialog 
                  open={showFreeAmountDialog} 
                  onClose={() => {
                    setShowFreeAmountDialog(false);
                    setFreeAmount('');
                    setErrorMessage('');
                  }}
                >
                  <div className="space-y-4 p-6 bg-gray-100">
                    <h2 className="text-lg font-semibold">Freibetrag hinzufügen</h2>
                    <p>Bitte geben Sie den Freibetrag ein:</p>
                    {errorMessage && <p className="text-red-500">{errorMessage}</p>}
                    <div className="w-full bg-white rounded-lg p-4 mb-4 text-center">
                      <span className="text-2xl font-semibold">{freeAmount ? freeAmount + '€' : '0€'}</span>
                    </div>
                    <div className="flex justify-center">
                      <Numpad />
                    </div>
                    <div className="flex justify-center gap-2 mt-4">
                      <button
                        onClick={() => {
                          setShowFreeAmountDialog(false);
                          setFreeAmount('');
                          setErrorMessage('');
                        }}
                        className="px-4 py-4 bg-gray-300 rounded"
                      >
                        Abbrechen
                      </button>
                      <button
                        onClick={addFreeAmountToUser}
                        className="px-4 py-4 bg-orange-500 text-white rounded"
                      >
                        Freibetrag hinzufügen
                      </button>
                    </div>
                  </div>
                </Dialog>
                <button
                  onClick={(e) => initiateSettlePayment(user.id, e)}
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Ausgleichen
                </button>
                <button
                  onClick={(e) => initiateBudgetAddition(user.id, e)}
                  className="px-4 py-2 bg-green-500 text-white rounded"
                >
                  Aufstocken
                </button>
              </div>
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
