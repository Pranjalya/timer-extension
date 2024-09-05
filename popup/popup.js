let timerDisplay = document.getElementById('timer');
let startStopButton = document.getElementById('startStop');
let resetButton = document.getElementById('reset');
let persistentToggle = document.getElementById('persistentToggle');

let isRunning = false;

function updateTimerDisplay(time) {
  timerDisplay.textContent = time;
  timerDisplay.classList.add('update');
  setTimeout(() => timerDisplay.classList.remove('update'), 100);
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'timeUpdated') {
    updateTimerDisplay(request.time);
  }
});

function toggleTimer() {
  if (isRunning) {
    chrome.runtime.sendMessage({action: 'stopTimer'});
    startStopButton.textContent = 'Start';
    startStopButton.classList.remove('btn-secondary');
    startStopButton.classList.add('btn-primary');
  } else {
    chrome.runtime.sendMessage({action: 'startTimer'});
    startStopButton.textContent = 'Stop';
    startStopButton.classList.remove('btn-primary');
    startStopButton.classList.add('btn-secondary');
  }
  isRunning = !isRunning;
}

function resetTimer() {
  chrome.runtime.sendMessage({action: 'resetTimer'});
  startStopButton.textContent = 'Start';
  startStopButton.classList.remove('btn-secondary');
  startStopButton.classList.add('btn-primary');
  isRunning = false;
  timerDisplay.classList.add('reset');
  setTimeout(() => timerDisplay.classList.remove('reset'), 300);
}

function togglePersistent() {
  chrome.runtime.sendMessage({action: 'togglePersistent', isPersistent: persistentToggle.checked});
}

startStopButton.addEventListener('click', toggleTimer);
resetButton.addEventListener('click', resetTimer);
persistentToggle.addEventListener('change', togglePersistent);

// Initialize persistent toggle state
chrome.storage.sync.get('isPersistent', function(data) {
  persistentToggle.checked = data.isPersistent;
});
