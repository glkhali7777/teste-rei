// Popup Script
document.addEventListener('DOMContentLoaded', initPopup);

function initPopup() {
  const activeToggle = document.getElementById('orion-active-toggle');
  const autoAnalyzeToggle = document.getElementById('auto-analyze-toggle');
  const analyzePagBtn = document.getElementById('analyze-page-btn');
  const showPanelBtn = document.getElementById('show-panel-btn');
  const openLogsBtn = document.getElementById('open-logs-btn');
  const clearLogsBtn = document.getElementById('clear-logs-btn');
  const statusDot = document.getElementById('status-dot');
  const statusText = document.getElementById('status-text');
  const statusTime = document.getElementById('status-time');
  const pageInfo = document.getElementById('page-info');
  const logsContainer = document.getElementById('logs-container');
  const currentTimeEl = document.getElementById('current-time');

  // Atualizar hora
  function updateTime() {
    currentTimeEl.textContent = new Date().toLocaleTimeString('pt-BR');
  }
  updateTime();
  setInterval(updateTime, 1000);

  // Carregar estado inicial
  loadSettings();
  loadStatus();
  loadLogs();

  // Event listeners
  activeToggle.addEventListener('change', (e) => {
    chrome.runtime.sendMessage({
      action: 'TOGGLE_ACTIVE',
      payload: { active: e.target.checked }
    }, () => {
      loadStatus();
      loadLogs();
    });
  });

  autoAnalyzeToggle.addEventListener('change', (e) => {
    chrome.runtime.sendMessage({
      action: 'UPDATE_SETTINGS',
      payload: { settings: { autoAnalyze: e.target.checked } }
    });
  });

  analyzePagBtn.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) return;
      
      chrome.tabs.sendMessage(tabs[0].id, { action: 'ANALYZE_DOM' }, (response) => {
        if (chrome.runtime.lastError) {
          pageInfo.innerHTML = '<strong style="color: #ef4444;">Erro ao analisar página</strong>';
          return;
        }
        
        if (response && response.elementCount) {
          pageInfo.innerHTML = `
            <strong>Botões:</strong> ${response.elementCount.buttons}<br>
            <strong>Inputs:</strong> ${response.elementCount.inputs}<br>
            <strong>Links:</strong> ${response.elementCount.links}<br>
            <strong>URL:</strong> ${response.url.substring(0, 50)}...<br>
            <strong>Timestamp:</strong> ${new Date(response.timestamp).toLocaleTimeString('pt-BR')}
          `;
        }
        
        loadLogs();
      });
    });
  });

  showPanelBtn.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) return;
      
      chrome.tabs.sendMessage(tabs[0].id, { action: 'SHOW_PANEL' }, () => {
        if (chrome.runtime.lastError) {
          console.error('Erro ao mostrar painel:', chrome.runtime.lastError);
        }
      });
    });
  });

  openLogsBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'GET_LOGS' }, (response) => {
      if (response && response.logs) {
        const logsText = response.logs.map(log => 
          `[${new Date(log.timestamp).toLocaleTimeString('pt-BR')}] [${log.level.toUpperCase()}] ${log.message}`
        ).join('\n');
        
        alert('Logs completos:\n\n' + (logsText || 'Nenhum log'));
      }
    });
  });

  clearLogsBtn.addEventListener('click', () => {
    if (confirm('Tem certeza que quer limpar todos os logs?')) {
      chrome.runtime.sendMessage({ action: 'CLEAR_LOGS' }, () => {
        loadLogs();
      });
    }
  });

  // Auto-atualizar
  setInterval(() => {
    loadStatus();
    loadLogs();
  }, 2000);
}

function loadSettings() {
  chrome.runtime.sendMessage({ action: 'GET_SETTINGS' }, (response) => {
    if (response && response.settings) {
      document.getElementById('orion-active-toggle').checked = !!response.settings.active;
      document.getElementById('auto-analyze-toggle').checked = response.settings.autoAnalyze !== false;
    }
  });
}

function loadStatus() {
  chrome.runtime.sendMessage({ action: 'GET_STATUS' }, (response) => {
    const statusDot = document.getElementById('status-dot');
    const statusText = document.getElementById('status-text');
    const statusTime = document.getElementById('status-time');

    if (!statusDot || !statusText) return;

    if (response && response.active) {
      statusDot.className = 'status-indicator active';
      statusText.textContent = '🟢 ORION ATIVO';
    } else {
      statusDot.className = 'status-indicator inactive';
      statusText.textContent = '🔴 ORION INATIVO';
    }

    if (statusTime && response && response.timestamp) {
      statusTime.textContent = new Date(response.timestamp).toLocaleTimeString('pt-BR');
    }
  });
}

function loadLogs() {
  chrome.runtime.sendMessage({ action: 'GET_LOGS' }, (response) => {
    const logsContainer = document.getElementById('logs-container');
    if (!logsContainer || !response || !response.logs) return;

    if (response.logs.length === 0) {
      logsContainer.innerHTML = '<div style="color: #666; text-align: center; padding: 20px 0;">Nenhum log</div>';
      return;
    }

    const logs = response.logs.slice(-10);
    let logsHtml = '';
    
    logs.forEach(log => {
      const time = new Date(log.timestamp).toLocaleTimeString('pt-BR');
      logsHtml += `<div class="log-entry"><span class="time">${time}</span><span class="msg">${log.message}</span></div>`;
    });

    logsContainer.innerHTML = logsHtml;
    logsContainer.scrollTop = logsContainer.scrollHeight;
  });
}
