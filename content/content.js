console.log('Content script loaded');

let widget = null;

function createWidget() {
  widget = document.createElement('div');
  widget.id = 'timer-extension-widget';
  widget.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 10px;
    border-radius: 5px;
    font-family: Arial, sans-serif;
    font-size: 14px;
    z-index: 9999;
    display: none; // Hide by default
  `;
  document.body.appendChild(widget);
}

function updateWidget(time) {
  if (widget) {
    widget.textContent = time;
  }
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'timeUpdated') {
    updateWidget(request.time);
  }
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
  if (changes.isPersistent) {
    toggleWidget(changes.isPersistent.newValue);
  }
});

chrome.storage.sync.get('isPersistent', function(data) {
  toggleWidget(data.isPersistent);
});

function toggleWidget(isPersistent) {
  if (!widget) {
    createWidget();
  }
  widget.style.display = isPersistent ? 'block' : 'none';
}

// Create the widget when the content script loads
createWidget();
