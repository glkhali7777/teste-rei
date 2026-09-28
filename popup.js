// Popup Script
document.addEventListener("DOMContentLoaded", initPopup);

function initPopup() {
  // Get elements
  const activeToggle = document.getElementById("orion-active-toggle");
  const autoAnalyzeToggle = document.getElementById("auto-analyze-toggle");
  const analyzePagBtn = document.getElementById("analyze-page-btn");
  const showPanelBtn = document.getElementById("show-panel-btn");
  const openLogsBtn = document.getElementById("open-logs-btn");
  const clearLogsBtn = document.getElementById("clear-logs-btn");
  const statusDot = document.getElementById("status-dot");
  const statusText = document.getElementById("status-text");
  const statusTime = document.getElementById("status-time");
  const pageInfo = document.getElementById("page-info");
  const logsContainer = document.getElementById("logs-container");
  const currentTimeEl = document.getElementById("current-time");

  // Update time
  function updateTime() {
    currentTimeEl.textContent = new Date().toLocaleTimeString();
  }
  updateTime();
  setInterval(updateTime, 1000);

  // Load initial state
  loadSettings();
  loadStatus();
  loadLogs();

  // Event listeners
  activeToggle.addEventListener("change", (e) => {
    chrome.runtime.sendMessage({
      action: "TOGGLE_ACTIVE",
      payload: { active: e.target.checked }
    }, loadStatus);
  });

  autoAnalyzeToggle.addEventListener("change", (e) => {
    chrome.runtime.sendMessage({
      action: "UPDATE_SETTINGS",
      payload: {
        settings: {
          autoAnalyze: e.target.checked
        }
      }
    });
  });

  analyzePagBtn.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "ANALYZE_DOM" }, (response) => {
        if (response) {
          pageInfo.innerHTML = `
            <strong>Botões:</strong> ${response.elementCount.buttons}<br>
            <strong>Inputs:</strong> ${response.elementCount.inputs}<br>
            <strong>Links:</strong> ${response.elementCount.links}<br>
            <strong>URL:</strong> ${response.url.substring(0, 40)}...<br>
            <strong>Timestamp:</strong> ${response.timestamp}
          `;
        }
        loadLogs();
      });
    });
  });

  showPanelBtn.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "SHOW_PANEL" });
    });
  });

  openLogsBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "GET_LOGS" }, (response) => {
      if (response.logs) {
        const logWindow = window.open("", "OrionLogs", "width=600,height=400");
        if (logWindow) {
          let logsHtml = "<table style='width:100%; border-collapse: collapse;'>";
          logsHtml += "<tr style='background: #7c6ef0; color: white;'><th style='border: 1px solid #ccc; padding: 8px;'>Hora</th><th style='border: 1px solid #ccc; padding: 8px;'>Nível</th><th style='border: 1px solid #ccc; padding: 8px;'>Mensagem</th></tr>";
          
          response.logs.forEach(log => {
            const timestamp = new Date(log.timestamp).toLocaleTimeString();
            const level = log.level.toUpperCase();
            logsHtml += `<tr><td style='border: 1px solid #ccc; padding: 8px;'>${timestamp}</td><td style='border: 1px solid #ccc; padding: 8px;'><strong>${level}</strong></td><td style='border: 1px solid #ccc; padding: 8px;'>${log.message}</td></tr>`;
          });
          
          logsHtml += "</table>";
          logWindow.document.write(`
            <html>
            <head>
              <title>Orion Logs</title>
              <style>
                body { font-family: monospace; padding: 20px; background: #0f0f17; color: #ccc; }
                h2 { color: #7c6ef0; }
              </style>
            </head>
            <body>
              <h2>Orion - Logs Completos</h2>
              ${logsHtml}
            </body>
            </html>
          `);
        }
      }
    });
  });

  clearLogsBtn.addEventListener("click", () => {
    if (confirm("Tem certeza que quer limpar todos os logs?")) {
      chrome.runtime.sendMessage({ action: "CLEAR_LOGS" }, loadLogs);
    }
  });

  // Reload data periodically
  setInterval(() => {
    loadStatus();
    loadLogs();
  }, 2000);
}

function loadSettings() {
  chrome.runtime.sendMessage({ action: "GET_SETTINGS" }, (response) => {
    if (response.settings) {
      document.getElementById("orion-active-toggle").checked = response.settings.active || false;
      document.getElementById("auto-analyze-toggle").checked = response.settings.autoAnalyze !== false;
    }
  });
}

function loadStatus() {
  chrome.runtime.sendMessage({ action: "GET_STATUS" }, (response) => {
    const statusDot = document.getElementById("status-dot");
    const statusText = document.getElementById("status-text");
    const statusTime = document.getElementById("status-time");

    if (response.active) {
      statusDot.className = "status-indicator active";
      statusText.textContent = "ORION ATIVO ✓";
    } else {
      statusDot.className = "status-indicator inactive";
      statusText.textContent = "ORION INATIVO";
    }

    const time = new Date(response.timestamp).toLocaleTimeString();
    statusTime.textContent = time;
  });
}

function loadLogs() {
  chrome.runtime.sendMessage({ action: "GET_LOGS" }, (response) => {
    const logsContainer = document.getElementById("logs-container");
    
    if (response.logs && response.logs.length > 0) {
      const logs = response.logs.slice(-5); // Últimos 5 logs
      let logsHtml = "";
      
      logs.forEach(log => {
        const time = new Date(log.timestamp).toLocaleTimeString();
        logsHtml += `
          <div class="log-entry">
            <span class="timestamp">${time}</span>
            <span class="level ${log.level}">${log.level.toUpperCase()}</span>
            <span>${log.message}</span>
          </div>
        `;
      });
      
      logsContainer.innerHTML = logsHtml;
    } else {
      logsContainer.innerHTML = '<div style="color: #666;">Nenhum log</div>';
    }
  });
}
