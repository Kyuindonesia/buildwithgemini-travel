// Agentic AI Web Builder Client Runtime
// Powered by Gemini 3.8 Flash

// State
let projectFiles = {
  "App.tsx": `import React, { useState } from 'react';
import { Sparkles, ArrowRight, Shield, Zap, Layout } from 'lucide-react';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-teal-500 text-black flex items-center justify-center font-bold">
            ⚡
          </div>
          <span className="font-bold text-white tracking-wide">Nexura AI</span>
        </div>
        <nav className="flex items-center space-x-6 text-sm text-slate-300">
          <a href="#features" className="hover:text-teal-400 transition">Features</a>
          <a href="#metrics" className="hover:text-teal-400 transition">Metrics</a>
          <button className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-black font-semibold text-xs transition">
            Get Started
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-16 flex flex-col items-center text-center justify-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Generation Intelligent Web Engine</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-3xl">
          Build Smarter Apps With <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">Gemini 3.8 Flash</span>
        </h1>

        <p className="mt-6 text-slate-400 text-base md:text-lg max-w-2xl leading-relaxed">
          Transform thoughts into live interactive web applications in seconds. Real-time rendering, multi-file code editing, and auto-debugging.
        </p>

        {/* Interactive Sandbox Counter */}
        <div className="mt-8 p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center space-x-4 shadow-xl">
          <button 
            onClick={() => setCount(c => c + 1)}
            className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-black font-semibold text-sm flex items-center space-x-2 transition"
          >
            <Zap className="w-4 h-4" />
            <span>Interactive Boost: {count}</span>
          </button>
          <span className="text-xs text-slate-400">Click to test live React state</span>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-16 text-left w-full">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-teal-500/40 transition">
            <Layout className="w-6 h-6 text-teal-400 mb-3" />
            <h3 className="text-base font-semibold text-white">Adaptive Design</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Tailored Tailwind CSS palettes, smooth responsive layouts, and modern aesthetics.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-teal-500/40 transition">
            <Zap className="w-6 h-6 text-cyan-400 mb-3" />
            <h3 className="text-base font-semibold text-white">Instant Feedback</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Edits reflect immediately in the sandbox with live error boundary trapping.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-teal-500/40 transition">
            <Shield className="w-6 h-6 text-teal-300 mb-3" />
            <h3 className="text-base font-semibold text-white">Production Ready</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Export fully structured, runnable Vite + React projects in a single ZIP.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 px-6 py-6 text-center text-xs text-slate-500">
        Generated with Agentic AI Web Builder &middot; Powered by Gemini 3.8 Flash
      </footer>
    </div>
  );
}`
};

let activeFileName = "App.tsx";
let lastRuntimeError = null;
let currentViewport = "desktop";
let isBuilding = false;

// DOM Elements
const chatMessagesEl = document.getElementById("chat-messages");
const promptInputEl = document.getElementById("prompt-input");
const chkEnhanceEl = document.getElementById("chk-enhance");
const agentStatusEl = document.getElementById("agent-status");
const fileTabsEl = document.getElementById("file-tabs");
const codeEditorEl = document.getElementById("code-editor");
const editorActiveFileEl = document.getElementById("editor-active-file");
const previewIframe = document.getElementById("preview-iframe");
const viewportFrame = document.getElementById("viewport-frame");
const viewportLabel = document.getElementById("viewport-label");
const errorBannerEl = document.getElementById("error-banner");
const errorTextEl = document.getElementById("error-text");

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) lucide.createIcons();
  renderFileTabs();
  loadCodeToEditor();
  reloadPreview();

  // Listen for iframe sandbox messages
  window.addEventListener("message", handleIframeMessage);

  // Sync editor on keystroke (debounced)
  let timer;
  codeEditorEl.addEventListener("input", (e) => {
    projectFiles[activeFileName] = e.target.value;
    clearTimeout(timer);
    timer = setTimeout(() => {
      reloadPreview();
    }, 600);
  });
});

function setStatus(text, isBusy = false) {
  agentStatusEl.innerHTML = `
    <span class="w-2 h-2 rounded-full ${isBusy ? 'bg-amber-400 animate-ping' : 'bg-teal-400 animate-pulse'}"></span>
    <span class="${isBusy ? 'text-amber-400' : 'text-teal-400'}">${text}</span>
  `;
}

function useQuickPrompt(prompt) {
  promptInputEl.value = prompt;
  promptInputEl.focus();
}

// File tabs rendering
function renderFileTabs() {
  fileTabsEl.innerHTML = "";
  Object.keys(projectFiles).forEach(filename => {
    const isActive = filename === activeFileName;
    const tab = document.createElement("button");
    tab.className = `px-3 py-1 text-xs rounded-t font-mono flex items-center space-x-1 border-b-2 transition ${
      isActive 
        ? "bg-[#0b0f17] text-teal-400 border-teal-400 font-semibold" 
        : "text-slate-400 border-transparent hover:text-slate-200"
    }`;
    tab.innerHTML = `<span>${filename}</span>`;
    tab.onclick = () => switchFile(filename);
    fileTabsEl.appendChild(tab);
  });
  editorActiveFileEl.textContent = activeFileName;
}

function switchFile(filename) {
  projectFiles[activeFileName] = codeEditorEl.value;
  activeFileName = filename;
  renderFileTabs();
  loadCodeToEditor();
}

function loadCodeToEditor() {
  codeEditorEl.value = projectFiles[activeFileName] || "";
}

function applyManualCodeEdit() {
  projectFiles[activeFileName] = codeEditorEl.value;
  reloadPreview();
  addChatMessage("user", `Manually edited ${activeFileName}`);
  addChatMessage("agent", `Updated live preview with changes in ${activeFileName}.`);
}

// Viewport Switcher
function setViewport(mode) {
  currentViewport = mode;
  const btnDesktop = document.getElementById("btn-desktop");
  const btnTablet = document.getElementById("btn-tablet");
  const btnMobile = document.getElementById("btn-mobile");

  [btnDesktop, btnTablet, btnMobile].forEach(b => {
    b.className = "px-2.5 py-1 text-xs rounded font-medium text-slate-400 hover:text-white flex items-center space-x-1 transition";
  });

  if (mode === "desktop") {
    btnDesktop.className = "px-2.5 py-1 text-xs rounded font-medium bg-teal-500 text-black flex items-center space-x-1 transition";
    viewportFrame.style.width = "100%";
    viewportFrame.style.maxWidth = "100%";
    viewportLabel.textContent = "100% (Desktop)";
  } else if (mode === "tablet") {
    btnTablet.className = "px-2.5 py-1 text-xs rounded font-medium bg-teal-500 text-black flex items-center space-x-1 transition";
    viewportFrame.style.width = "768px";
    viewportFrame.style.maxWidth = "768px";
    viewportLabel.textContent = "768px (Tablet)";
  } else if (mode === "mobile") {
    btnMobile.className = "px-2.5 py-1 text-xs rounded font-medium bg-teal-500 text-black flex items-center space-x-1 transition";
    viewportFrame.style.width = "375px";
    viewportFrame.style.maxWidth = "375px";
    viewportLabel.textContent = "375px (Mobile)";
  }
  if (window.lucide) lucide.createIcons();
}

// Live Preview Injection Engine
function reloadPreview() {
  clearErrorBanner();
  const html = buildSandboxHTML();
  previewIframe.srcdoc = html;
}

function buildSandboxHTML() {
  const filesJSON = JSON.stringify(projectFiles);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"><\/script>
  <!-- React 18 & ReactDOM -->
  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin><\/script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin><\/script>
  <!-- Babel Standalone for in-browser JSX/TypeScript transpile -->
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
  <!-- Lucide React Standalone -->
  <script src="https://unpkg.com/lucide-react@0.363.0/dist/umd/lucide-react.min.js"><\/script>
  <style>
    body { margin: 0; padding: 0; background: #020617; color: #f8fafc; font-family: system-ui, -apple-system, sans-serif; }
    #root { min-height: 100vh; }
  </style>
</head>
<body>
  <div id="root"></div>

  <script>
    window.onerror = function(message, source, lineno, colno, error) {
      window.parent.postMessage({
        type: 'SANDBOX_ERROR',
        error: message + (error && error.stack ? '\\n' + error.stack : '')
      }, '*');
      return false;
    };

    window.addEventListener('unhandledrejection', function(event) {
      window.parent.postMessage({
        type: 'SANDBOX_ERROR',
        error: 'Unhandled Promise Rejection: ' + (event.reason ? (event.reason.stack || event.reason) : 'Unknown')
      }, '*');
    });

    try {
      const projectFiles = ${filesJSON};

      const React = window.React;
      const ReactDOM = window.ReactDOM;
      const LucideReact = window.lucideReact || {};

      // Proxy for Lucide icons: allow fallback generic icon if specific icon isn't found
      const iconProxy = new Proxy(LucideReact, {
        get: (target, prop) => {
          if (target[prop]) return target[prop];
          return (props) => React.createElement('span', { className: 'inline-block px-1 text-teal-400 font-mono text-[10px]' }, '⚡');
        }
      });

      // Prepare App.tsx
      const appCode = projectFiles['App.tsx'] || '';
      
      // Clean imports and export statement
      const cleanCode = appCode
        .replace(/import\\s+.*?from\\s+['"].*?['"];?/g, '')
        .replace(/export\\s+default\\s+function\\s+(\\w+)/g, 'function $1')
        .replace(/export\\s+default\\s+(\\w+);?/g, '');

      // Transform JSX/TSX
      const transformedApp = Babel.transform(cleanCode, {
        presets: ['react', 'typescript'],
        filename: 'App.tsx'
      }).code;

      const executeComponent = new Function(
        'React', 'useState', 'useEffect', 'useMemo', 'useCallback', 'useRef', 'lucideReact', 'icons',
        'const { ' + Object.keys(LucideReact).join(',') + ' } = icons;\\n' +
        transformedApp + ';\\n' +
        'return (typeof App !== "undefined" ? App : null);'
      );

      const AppComponent = executeComponent(
        React, 
        React.useState, 
        React.useEffect, 
        React.useMemo, 
        React.useCallback, 
        React.useRef, 
        LucideReact,
        iconProxy
      );

      if (AppComponent) {
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(React.createElement(AppComponent));
        window.parent.postMessage({ type: 'SANDBOX_SUCCESS' }, '*');
      } else {
        throw new Error('No App component function found in App.tsx');
      }

    } catch (err) {
      console.error(err);
      window.parent.postMessage({
        type: 'SANDBOX_ERROR',
        error: err.toString() + (err.stack ? '\\n' + err.stack : '')
      }, '*');
    }
  <\/script>
</body>
</html>`;
}

// Message handler from iframe sandbox
function handleIframeMessage(event) {
  if (!event.data || !event.data.type) return;

  if (event.data.type === "SANDBOX_ERROR") {
    lastRuntimeError = event.data.error;
    showErrorBanner(lastRuntimeError);
  } else if (event.data.type === "SANDBOX_SUCCESS") {
    clearErrorBanner();
  }
}

function showErrorBanner(msg) {
  errorBannerEl.classList.remove("hidden");
  errorTextEl.textContent = msg.split("\n")[0] || "Runtime compilation error";
}

function clearErrorBanner() {
  errorBannerEl.classList.add("hidden");
  lastRuntimeError = null;
}

// Chat UI helpers
function addChatMessage(sender, content, meta = null) {
  const msgEl = document.createElement("div");
  const isAgent = sender === "agent";
  msgEl.className = `p-3 rounded-xl border leading-relaxed ${
    isAgent 
      ? "bg-[#161f30] border-[#1f293d] text-slate-200" 
      : "bg-teal-500/10 border-teal-500/30 text-teal-100 ml-4"
  }`;

  let header = isAgent 
    ? `<div class="flex items-center space-x-1.5 text-teal-400 font-semibold mb-1"><i data-lucide="bot" class="w-3.5 h-3.5"></i><span>Agent</span></div>`
    : `<div class="flex items-center space-x-1.5 text-teal-300 font-semibold mb-1"><i data-lucide="user" class="w-3.5 h-3.5"></i><span>You</span></div>`;

  let body = `<p class="whitespace-pre-wrap">${escapeHtml(content)}</p>`;

  if (meta && meta.spec) {
    const s = meta.spec;
    body += `
      <div class="mt-2 p-2.5 rounded-lg bg-[#0b0f17] border border-[#1f293d] text-[11px] space-y-1">
        <div class="font-semibold text-teal-400">${escapeHtml(s.title || "Architectural Spec")} · <span class="text-slate-400 font-normal">${escapeHtml(s.category || "")}</span></div>
        <div class="text-slate-400">${escapeHtml(s.target_audience || "")}</div>
        <div class="text-slate-300 pt-1 font-mono text-[10px]">🎨 Palette: ${(s.design_system?.color_palette || []).join(", ")}</div>
        <div class="text-slate-300 font-mono text-[10px]">🧩 Key Features: ${(s.interactive_features || []).join(", ")}</div>
      </div>
    `;
  }

  msgEl.innerHTML = header + body;
  chatMessagesEl.appendChild(msgEl);
  chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
  if (window.lucide) lucide.createIcons();
}

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// User Actions
async function handleEnhanceOnly() {
  const prompt = promptInputEl.value.trim();
  if (!prompt) return;

  setStatus("Enhancing specification...", true);
  addChatMessage("user", `Enhance idea: "${prompt}"`);
  promptInputEl.value = "";

  try {
    const res = await fetch("/api/builder/enhance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.detail || "Enhancement failed");

    addChatMessage("agent", `Enhanced "${prompt}" into an architecture spec. You can now build it or tweak it.`, { spec: data.spec });
    promptInputEl.value = data.spec.expanded_prompt || prompt;
  } catch (err) {
    addChatMessage("agent", `Failed to enhance prompt: ${err.message}`);
  } finally {
    setStatus("Ready");
  }
}

async function handleSubmitPrompt() {
  const prompt = promptInputEl.value.trim();
  if (!prompt || isBuilding) return;

  isBuilding = true;
  const isEnhanceEnabled = chkEnhanceEl.checked;
  const hasExistingApp = Object.keys(projectFiles).length > 0 && projectFiles["App.tsx"].length > 200;

  addChatMessage("user", prompt);
  promptInputEl.value = "";

  try {
    const isEdit = hasExistingApp && (
      prompt.toLowerCase().startsWith("change") ||
      prompt.toLowerCase().startsWith("add") ||
      prompt.toLowerCase().startsWith("make") ||
      prompt.toLowerCase().startsWith("update") ||
      prompt.toLowerCase().startsWith("fix") ||
      prompt.toLowerCase().startsWith("replace") ||
      prompt.toLowerCase().startsWith("remove") ||
      prompt.length < 100
    );

    if (isEdit) {
      setStatus("Coding Agent modifying files...", true);
      const res = await fetch("/api/builder/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instruction: prompt,
          current_files: projectFiles
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.detail || "Editing failed");

      const modified = data.result.modified_files || {};
      for (const [fname, code] of Object.entries(modified)) {
        projectFiles[fname] = code;
      }
      renderFileTabs();
      loadCodeToEditor();
      reloadPreview();

      addChatMessage("agent", data.result.message || "Updated your application files.");
    } else {
      let specPrompt = prompt;
      if (isEnhanceEnabled) {
        setStatus("AI Architect enhancing idea...", true);
        const enhanceRes = await fetch("/api/builder/enhance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt })
        });
        const enhanceData = await enhanceRes.json();
        if (enhanceData.success && enhanceData.spec) {
          specPrompt = enhanceData.spec.expanded_prompt || JSON.stringify(enhanceData.spec);
          addChatMessage("agent", `Created project architecture for: "${enhanceData.spec.title || prompt}"`, { spec: enhanceData.spec });
        }
      }

      setStatus("Gemini 3.8 Flash generating React components...", true);
      const genRes = await fetch("/api/builder/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          specification: specPrompt,
          existing_files: projectFiles
        })
      });
      const genData = await genRes.json();
      if (!genData.success) throw new Error(genData.detail || "Generation failed");

      if (genData.result.files) {
        projectFiles = genData.result.files;
        activeFileName = Object.keys(projectFiles).includes("App.tsx") ? "App.tsx" : Object.keys(projectFiles)[0];
        renderFileTabs();
        loadCodeToEditor();
        reloadPreview();
        addChatMessage("agent", `🎉 ${genData.result.summary || "Generated application successfully!"} Live preview updated.`);
      }
    }
  } catch (err) {
    addChatMessage("agent", `❌ Error during generation: ${err.message}`);
  } finally {
    isBuilding = false;
    setStatus("Ready");
  }
}

// Auto-Debugging Agent
async function triggerAutoDebug() {
  if (!lastRuntimeError) return;

  setStatus("Auto-Debugging Agent analyzing error...", true);
  addChatMessage("user", `Auto-debug error: ${lastRuntimeError.split("\n")[0]}`);

  try {
    const res = await fetch("/api/builder/debug", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: lastRuntimeError,
        current_files: projectFiles
      })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.detail || "Auto-debug failed");

    const fixed = data.result.fixed_files || {};
    for (const [fname, code] of Object.entries(fixed)) {
      projectFiles[fname] = code;
    }

    renderFileTabs();
    loadCodeToEditor();
    reloadPreview();

    addChatMessage("agent", `🔧 Debugger resolved issue: ${data.result.diagnosis || "Fixed errors in components."}`);
    clearErrorBanner();
  } catch (err) {
    addChatMessage("agent", `Failed to auto-debug: ${err.message}`);
  } finally {
    setStatus("Ready");
  }
}

// ZIP Export
function exportProjectZip() {
  const zip = new JSZip();

  const src = zip.folder("src");
  for (const [name, content] of Object.entries(projectFiles)) {
    src.file(name, content);
  }

  zip.file("package.json", JSON.stringify({
    "name": "gemini-web-builder-project",
    "private": true,
    "version": "0.1.0",
    "type": "module",
    "scripts": {
      "dev": "vite",
      "build": "tsc && vite build",
      "preview": "vite preview"
    },
    "dependencies": {
      "react": "^18.2.0",
      "react-dom": "^18.2.0",
      "lucide-react": "^0.363.0"
    },
    "devDependencies": {
      "@types/react": "^18.2.0",
      "@types/react-dom": "^18.2.0",
      "@vitejs/plugin-react": "^4.2.0",
      "autoprefixer": "^10.4.18",
      "postcss": "^8.4.35",
      "tailwindcss": "^3.4.1",
      "typescript": "^5.2.2",
      "vite": "^5.1.0"
    }
  }, null, 2));

  zip.file("index.html", `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Generated Web App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`);

  src.file("main.tsx", `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`);

  src.file("index.css", `@tailwind base;
@tailwind components;
@tailwind utilities;`);

  zip.file("vite.config.ts", `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})`);

  zip.file("tailwind.config.js", `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`);

  zip.generateAsync({ type: "blob" }).then(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gemini-web-project.zip";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addChatMessage("agent", "📦 Exported complete runnable Vite + React + Tailwind project to gemini-web-project.zip!");
  });
}

function openPreviewNewWindow() {
  const win = window.open("", "_blank");
  if (win) {
    win.document.open();
    win.document.write(buildSandboxHTML());
    win.document.close();
  }
}
