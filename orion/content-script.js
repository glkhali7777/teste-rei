// Content Script - Roda na página do usuário
(function() {
  'use strict';

  const ORION_COLOR = "#7c6ef0";
  let isActive = false;
  let panelElement = null;

  console.log("[Orion] Content script carregado");

  // Recebe mensagens do background
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    try {
      const { action } = request;

      switch (action) {
        case "ORION_STATUS_CHANGED":
          isActive = request.active;
          updateBadge();
          if (request.active) showPanel();
          else hidePanel();
          sendResponse({ success: true });
          break;

        case "ANALYZE_DOM":
          const analysis = analyzePage();
          sendResponse(analysis);
          break;

        case "SHOW_PANEL":
          showPanel();
          sendResponse({ success: true });
          break;

        case "HIDE_PANEL":
          hidePanel();
          sendResponse({ success: true });
          break;

        default:
          sendResponse({ error: "Ação desconhecida" });
      }
    } catch (error) {
      console.error("[Orion] Erro no content script:", error);
      sendResponse({ error: error.message });
    }

    return true;
  });

  // Cria badge
  function createBadge() {
    if (document.getElementById("orion-badge")) return;

    try {
      const badge = document.createElement("div");
      badge.id = "orion-badge";
      badge.style.cssText = `
        position: fixed;
        top: 12px;
        right: 12px;
        z-index: 2147483647;
        background: ${ORION_COLOR};
        color: white;
        padding: 8px 14px;
        font-family: -apple-system, 'Segoe UI', system-ui, sans-serif;
        font-size: 12px;
        font-weight: 600;
        border-radius: 20px;
        box-shadow: 0 4px 12px rgba(124, 110, 240, 0.4);
        cursor: pointer;
        user-select: none;
        border: none;
      `;

      badge.textContent = isActive ? "🟣 Orion Ativo" : "⚪ Orion Inativo";
      badge.addEventListener("click", () => {
        chrome.runtime.sendMessage({ action: "TOGGLE_ACTIVE" }, () => {
          chrome.runtime.sendMessage({ action: "GET_STATUS" }, (res) => {
            isActive = res.active;
            updateBadge();
          });
        });
      });

      document.documentElement.appendChild(badge);
      console.log("[Orion] Badge criado");
    } catch (error) {
      console.error("[Orion] Erro ao criar badge:", error);
    }
  }

  function updateBadge() {
    const badge = document.getElementById("orion-badge");
    if (!badge) return;
    badge.textContent = isActive ? "🟣 Orion Ativo" : "⚪ Orion Inativo";
    badge.style.background = isActive ? ORION_COLOR : "#666";
  }

  // Painel
  function showPanel() {
    if (!panelElement) createPanel();
    if (panelElement) panelElement.style.display = "block";
  }

  function hidePanel() {
    if (panelElement) panelElement.style.display = "none";
  }

  function createPanel() {
    if (document.getElementById("orion-panel")) {
      panelElement = document.getElementById("orion-panel");
      return;
    }

    try {
      const panel = document.createElement("div");
      panel.id = "orion-panel";
      panel.style.cssText = `
        position: fixed;
        right: 16px;
        bottom: 16px;
        width: 360px;
        max-height: 500px;
        background: rgba(15, 15, 23, 0.98);
        border: 2px solid ${ORION_COLOR};
        border-radius: 12px;
        z-index: 2147483646;
        color: #ccc;
        font-family: -apple-system, 'Segoe UI', system-ui, sans-serif;
        font-size: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        overflow: hidden;
        display: flex;
        flex-direction: column;
      `;

      panel.innerHTML = `
        <div style="background: linear-gradient(135deg, ${ORION_COLOR}, rgba(124, 110, 240, 0.6)); padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(124, 110, 240, 0.3);">
          <strong style="color: white; margin: 0;">Orion Panel</strong>
          <button id="orion-close" style="background: transparent; border: none; color: white; cursor: pointer; font-size: 20px; padding: 0; margin: 0;">×</button>
        </div>
        <div style="flex: 1; overflow-y: auto; padding: 14px;">
          <div style="margin-bottom: 12px;">
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
              <input type="checkbox" id="orion-panel-toggle" style="width: 16px; height: 16px;">
              <span>Ativar Orion</span>
            </label>
          </div>
          <button id="orion-panel-analyze" style="width: 100%; padding: 10px; background: ${ORION_COLOR}; border: none; border-radius: 6px; color: white; cursor: pointer; font-weight: 600; margin-bottom: 10px;">Analisar Página</button>
          <div id="orion-panel-status" style="font-size: 11px; color: #aaa; background: rgba(0, 0, 0, 0.3); padding: 8px; border-radius: 6px; margin-bottom: 10px;">Status: Carregando...</div>
          <div style="font-size: 10px; color: #888; margin-bottom: 6px;">LOGS:</div>
          <div id="orion-panel-logs" style="font-size: 10px; color: #7c6ef0; max-height: 180px; overflow: auto; background: rgba(0, 0, 0, 0.4); padding: 8px; border-radius: 6px; border: 1px solid rgba(124, 110, 240, 0.2); line-height: 1.4; font-family: monospace;"></div>
        </div>
      `;

      document.documentElement.appendChild(panel);
      panelElement = panel;

      document.getElementById("orion-close").addEventListener("click", hidePanel);
      document.getElementById("orion-panel-toggle").addEventListener("change", (e) => {
        chrome.runtime.sendMessage({
          action: "TOGGLE_ACTIVE",
          payload: { active: e.target.checked }
        }, () => {
          updatePanelStatus();
        });
      });
      document.getElementById("orion-panel-analyze").addEventListener("click", () => {
        const analysis = analyzePage();
        updatePanelStatus(analysis);
        chrome.runtime.sendMessage({
          action: "ADD_LOG",
          payload: {
            level: "info",
            message: `Análise: ${analysis.elementCount.buttons} botões, ${analysis.elementCount.inputs} inputs, ${analysis.elementCount.links} links`
          }
        }, () => {
          updatePanelLogs();
        });
      });

      updatePanelStatus();
      updatePanelLogs();
      console.log("[Orion] Painel criado");
    } catch (error) {
      console.error("[Orion] Erro ao criar painel:", error);
    }
  }

  function updatePanelStatus(analysis) {
    try {
      const status = document.getElementById("orion-panel-status");
      if (!status) return;

      if (analysis) {
        status.textContent = `Botões: ${analysis.elementCount.buttons} | Inputs: ${analysis.elementCount.inputs} | Links: ${analysis.elementCount.links}`;
      } else {
        chrome.runtime.sendMessage({ action: "GET_STATUS" }, (res) => {
          status.textContent = `Status: ${res.active ? "ATIVO" : "INATIVO"} | ${new Date().toLocaleTimeString()}`;
        });
      }
    } catch (error) {
      console.error("[Orion] Erro ao atualizar status:", error);
    }
  }

  function updatePanelLogs() {
    try {
      chrome.runtime.sendMessage({ action: "GET_LOGS" }, (response) => {
        const logsDiv = document.getElementById("orion-panel-logs");
        if (!logsDiv || !response.logs) return;

        const logs = response.logs.slice(-8).map(log => {
          const time = new Date(log.timestamp).toLocaleTimeString();
          return `[${time}] ${log.message}`;
        }).join("\n");

        logsDiv.textContent = logs || "Nenhum log";
        logsDiv.scrollTop = logsDiv.scrollHeight;
      });
    } catch (error) {
      console.error("[Orion] Erro ao carregar logs:", error);
    }
  }

  // Análise da página
  function analyzePage() {
    try {
      const buttons = Array.from(document.querySelectorAll("button")).slice(0, 15).map(el => ({
        text: el.innerText.trim().substring(0, 50),
        selector: getSelector(el),
        visible: isElementVisible(el)
      }));

      const inputs = Array.from(document.querySelectorAll("input, textarea, select")).slice(0, 15).map(el => ({
        type: el.type || el.tagName.toLowerCase(),
        name: el.name || "unnamed",
        selector: getSelector(el),
        visible: isElementVisible(el)
      }));

      const links = Array.from(document.querySelectorAll("a")).slice(0, 15).map(el => ({
        text: el.innerText.trim().substring(0, 50),
        href: el.href,
        selector: getSelector(el),
        visible: isElementVisible(el)
      }));

      return {
        timestamp: new Date().toISOString(),
        url: location.href,
        title: document.title,
        elementCount: {
          buttons: document.querySelectorAll("button").length,
          inputs: document.querySelectorAll("input, textarea, select").length,
          links: document.querySelectorAll("a").length
        },
        elements: {
          buttons: buttons.filter(b => b.visible),
          inputs: inputs.filter(i => i.visible),
          links: links.filter(l => l.visible)
        }
      };
    } catch (error) {
      console.error("[Orion] Erro ao analisar página:", error);
      return { error: error.message };
    }
  }

  function getSelector(el) {
    if (el.id) return `#${el.id}`;
    if (el.name) return `[name="${el.name}"]`;
    return el.tagName.toLowerCase();
  }

  function isElementVisible(element) {
    try {
      const style = window.getComputedStyle(element);
      return style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0";
    } catch (e) {
      return true;
    }
  }

  // Inicialização
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(createBadge, 100);
    });
  } else {
    setTimeout(createBadge, 100);
  }

  window.addEventListener("load", () => {
    chrome.runtime.sendMessage({ action: "GET_STATUS" }, (response) => {
      isActive = response.active;
      updateBadge();
    });
  });
})();
