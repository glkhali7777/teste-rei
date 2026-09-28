// Background Service Worker - Controla a extensão
const STORAGE_KEY = "orion_settings";
const LOG_KEY = "orion_logs";

// Inicializa storage
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get([STORAGE_KEY], (result) => {
    if (!result[STORAGE_KEY]) {
      chrome.storage.local.set({
        [STORAGE_KEY]: {
          active: false,
          autoAnalyze: true,
          logLevel: "info"
        }
      });
    }
  });

  chrome.storage.local.get([LOG_KEY], (result) => {
    if (!result[LOG_KEY]) {
      chrome.storage.local.set({ [LOG_KEY]: [] });
    }
  });
});

// Listeners de mensagens
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
    const { action, payload } = request;

    switch (action) {
      case "GET_STATUS":
        handleGetStatus(sendResponse);
        break;

      case "TOGGLE_ACTIVE":
        handleToggleActive(payload, sendResponse);
        break;

      case "ANALYZE_PAGE":
        handleAnalyzePage(sender.tab.id, sendResponse);
        break;

      case "GET_LOGS":
        handleGetLogs(sendResponse);
        break;

      case "CLEAR_LOGS":
        handleClearLogs(sendResponse);
        break;

      case "ADD_LOG":
        handleAddLog(payload, sendResponse);
        break;

      case "UPDATE_SETTINGS":
        handleUpdateSettings(payload, sendResponse);
        break;

      case "GET_SETTINGS":
        handleGetSettings(sendResponse);
        break;

      default:
        sendResponse({ error: "Ação desconhecida" });
    }
  } catch (error) {
    console.error("[Orion] Erro no background:", error);
    sendResponse({ error: error.message });
  }

  return true; // Mantém o channel aberto para async
});

function handleGetStatus(callback) {
  chrome.storage.local.get([STORAGE_KEY], (result) => {
    const settings = result[STORAGE_KEY] || {};
    callback({
      active: settings.active,
      timestamp: new Date().toISOString()
    });
  });
}

function handleToggleActive(payload, callback) {
  chrome.storage.local.get([STORAGE_KEY], (result) => {
    const settings = result[STORAGE_KEY] || {};
    settings.active = payload?.active ?? !settings.active;

    chrome.storage.local.set({ [STORAGE_KEY]: settings }, () => {
      // Broadcast para todas as abas
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          try {
            chrome.tabs.sendMessage(tab.id, {
              action: "ORION_STATUS_CHANGED",
              active: settings.active
            }).catch(() => {});
          } catch (e) {}
        });
      });

      handleAddLog({ level: "info", message: `Orion ${settings.active ? "ativado" : "desativado"}` }, () => {});
      callback({ success: true, active: settings.active });
    });
  });
}

function handleAddLog(payload, callback) {
  chrome.storage.local.get([LOG_KEY], (result) => {
    let logs = result[LOG_KEY] || [];
    const newLog = {
      timestamp: new Date().toISOString(),
      level: payload.level || "info",
      message: payload.message || ""
    };

    logs.push(newLog);
    if (logs.length > 100) logs = logs.slice(-100);

    chrome.storage.local.set({ [LOG_KEY]: logs }, () => {
      callback({ success: true });
    });
  });
}

function handleGetLogs(callback) {
  chrome.storage.local.get([LOG_KEY], (result) => {
    callback({ logs: result[LOG_KEY] || [] });
  });
}

function handleClearLogs(callback) {
  chrome.storage.local.set({ [LOG_KEY]: [] }, () => {
    callback({ success: true });
  });
}

function handleGetSettings(callback) {
  chrome.storage.local.get([STORAGE_KEY], (result) => {
    callback({ settings: result[STORAGE_KEY] || {} });
  });
}

function handleUpdateSettings(payload, callback) {
  chrome.storage.local.set({ [STORAGE_KEY]: payload.settings }, () => {
    callback({ success: true });
  });
}

function handleAnalyzePage(tabId, callback) {
  chrome.tabs.sendMessage(tabId, { action: "ANALYZE_DOM" }, (response) => {
    if (chrome.runtime.lastError) {
      callback({ error: chrome.runtime.lastError.message });
    } else {
      callback(response || { error: "Sem resposta" });
    }
  }).catch(() => {
    callback({ error: "Tab não respondeu" });
  });
}
