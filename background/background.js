let timer = {
  isRunning: false,
  startTime: 0,
  elapsedTime: 0,
  intervalId: null
};

chrome.runtime.onInstalled.addListener(function() {
  console.log('Timer Extension installed');
  chrome.storage.sync.set({ isPersistent: false });
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  switch (request.action) {
    case 'startTimer':
      startTimer();
      break;
    case 'stopTimer':
      stopTimer();
      break;
    case 'resetTimer':
      resetTimer();
      break;
    case 'getTime':
      sendResponse({ time: getFormattedTime() });
      break;
    case 'togglePersistent':
      togglePersistent(request.isPersistent);
      break;
  }
});

function startTimer() {
  if (!timer.isRunning) {
    timer.isRunning = true;
    timer.startTime = Date.now() - timer.elapsedTime;
    timer.intervalId = setInterval(updateTime, 10); // Change to 10ms interval
  }
}

function stopTimer() {
  if (timer.isRunning) {
    timer.isRunning = false;
    clearInterval(timer.intervalId);
  }
}

function resetTimer() {
  stopTimer();
  timer.elapsedTime = 0;
  updateBadge();
}

function updateTime() {
  timer.elapsedTime = Date.now() - timer.startTime;
  updateBadge();
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'timeUpdated', time: getFormattedTime() });
    }
  });
  chrome.runtime.sendMessage({ action: 'timeUpdated', time: getFormattedTime() });
}

function getFormattedTime() {
  const milliseconds = timer.elapsedTime % 1000;
  const seconds = Math.floor(timer.elapsedTime / 1000) % 60;
  const minutes = Math.floor(timer.elapsedTime / (1000 * 60)) % 60;
  const hours = Math.floor(timer.elapsedTime / (1000 * 60 * 60));
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${padMs(milliseconds)}`;
}

function pad(num) {
  return num.toString().padStart(2, '0');
}

function padMs(num) {
  return num.toString().padStart(3, '0');
}

function updateBadge() {
  const seconds = Math.floor(timer.elapsedTime / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  chrome.action.setBadgeText({ text: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}` });
}

function togglePersistent(isPersistent) {
  chrome.storage.sync.set({ isPersistent: isPersistent });
}