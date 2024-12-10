let timerInterval;
let elapsedSeconds = 0;
let isRunning = false;
let exp = 0;
let level = 1;
let expGain = 0.025

const mainBtn = document.getElementById('main-btn');
const expBar = document.getElementById('exp-bar');
const expText = document.getElementById('exp-text');
const levelText = document.getElementById('current-level');
const totalTimeDisplay = document.getElementById('total-time');
const resetBtn = document.getElementById('reset-btn');
const themeSwitch = document.getElementById('theme-switch');
const popup = document.getElementById('popup');
const popupYes = document.getElementById('popup-yes');
const popupNo = document.getElementById('popup-no');

const tabs = document.querySelectorAll('.time-tracker');
const tabButtons = document.querySelectorAll('.tab-button');

// IndexedDB
const dbName = 'timerApp'; // Database name
const storeName = 'timerData'; // Object store name

// Open or create the database
const openDatabase = () => {
  const request = indexedDB.open(dbName, 1);

  request.onupgradeneeded = function (e) {
    const db = e.target.result;
    if (!db.objectStoreNames.contains(storeName)) {
      db.createObjectStore(storeName, { keyPath: 'id' });
    }
  };

  request.onerror = function (e) {
    console.error('IndexedDB error:', e);
  };

  return new Promise((resolve, reject) => {
    request.onsuccess = function (e) {
      resolve(e.target.result);
    };
    request.onerror = function (e) {
      reject('Failed to open IndexedDB:', e);
    };
  });
}

// Save timer data (elapsedSeconds, exp, level)
const saveData = () => {
  openDatabase().then(db => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const timerData = {
      id: 1, // Use a constant ID since you have only one set of timer data
      elapsedSeconds,
      exp,
      level
    };
    store.put(timerData); // Store or update the data
  }).catch(error => {
    console.error('Error saving data to IndexedDB:', error);
  });
}

// Load saved data from IndexedDB
const loadData = () => {
  openDatabase().then(db => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(1); // Get data by ID (we use 1 as the ID here)

    request.onsuccess = function () {
      const data = request.result;
      if (data) {
        // Load the saved data into variables without modifying it
        elapsedSeconds = data.elapsedSeconds || 0;
        exp = data.exp || 0;
        level = data.level || 1;

        // Update the display and experience bar with saved values
        updateDisplay();
        updateExp();
      } else {
        // Initialize default values if no data exists
        elapsedSeconds = 0;
        exp = 0;
        level = 1;

        updateDisplay();
        updateExp();
      }
    };
  }).catch(error => {
    console.error('Error loading data from IndexedDB:', error);
  });
}

const formatTime = seconds => {
  const hours = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  return { hours, minutes, secs };
}

const updateDisplay = () => {
  const { hours, minutes, secs } = formatTime(elapsedSeconds);
  totalTimeDisplay.textContent = `${hours}:${minutes}:${secs}`;
}

const updateExp = () => {
  exp += expGain; 
  
  if (exp >= 100) {
    exp = 0;
    level++;
    expGain /= 1.05;
  }
  
  expBar.style.width = `${exp}%`;
  expText.textContent = `EXP: ${exp.toFixed(2)}%`;
  levelText.textContent = `Level: ${level} Developer`;
  
  saveData();
}

const startTimer = () => {
  timerInterval = setInterval(() => {
    elapsedSeconds++;
    updateDisplay();
    updateExp();
  }, 1000);
}

const stopTimer = () => {
  clearInterval(timerInterval);
  saveData();
}

const switchTab = tabName => {
  tabs.forEach(tab => {
    tab.style.display = tab.id === tabName ? 'block' : 'none';
  });
  tabButtons.forEach(button => {
    button.classList.remove('active');
    if (button.dataset.tab === tabName) {
      button.classList.add('active');
    }
  });
}

// Function to apply a theme
const applyTheme = theme => {
  document.body.className = theme;
  localStorage.setItem('theme', theme); // Save the theme in localStorage
}

// Reset function (example)
const resetProgram = () => {
  // Example: localStorage.clear();
  // Reload the page or reset variables as needed
  localStorage.clear();

  // Reset variables
  elapsedSeconds = 0;
  exp = 0;
  level = 1;
  isRunning = false;

  // Update UI
  updateDisplay();
  expBar.style.width = '0%';
  expText.textContent = 'EXP: 0%';
  levelText.textContent = 'Level: 1 Developer';
  mainBtn.textContent = 'Start Training';

  // Stop the timer if running
  stopTimer(); 
}

mainBtn.addEventListener('click', () => {
  if (!isRunning) {
    startTimer();
    mainBtn.textContent = 'Stop Training';
    isRunning = true;
  } else if (mainBtn.textContent === 'Stop Training') {
    stopTimer();
    mainBtn.textContent = 'Start Training';
    isRunning = false;
  }
});

tabButtons.forEach(button => {
  button.addEventListener('click', () => {
    const tabName = button.dataset.tab;
    switchTab(tabName);
  });
});

// Load saved data on page load
window.onload = function () {
  loadData(); // Load the saved timer data
};

// Load saved theme on page load
window.onload = function () {
  loadData(); // Load the timer data
  const savedTheme = localStorage.getItem('theme') || 'dark-theme'; // Default to dark theme
  applyTheme(savedTheme);
  themeSwitch.checked = savedTheme === 'light-theme'; // Set toggle switch state
};

// Add event listener for theme toggle
themeSwitch.addEventListener('change', () => {
  const newTheme = themeSwitch.checked ? 'light-theme' : 'dark-theme';
  applyTheme(newTheme);
});

// Show the popup when the reset button is clicked
resetBtn.addEventListener('click', () => {
  popup.classList.remove('hidden');
});

// Hide the popup and perform the reset action if "Yes" is clicked
popupYes.addEventListener('click', () => {
  popup.classList.add('hidden');
  resetProgram(); // Call your reset function here
});

// Hide the popup if "No" is clicked
popupNo.addEventListener('click', () => {
  popup.classList.add('hidden');
});
