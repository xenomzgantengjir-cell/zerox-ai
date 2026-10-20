"use client";

import { useEffect, useRef, useState } from "react";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  Bot,
  Check,
  ChevronDown,
  Copy,
  FileText,
  Menu,
  MessageSquare,
  Plus,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  SquarePen,
  Trash2,
  X,
  Zap,
  ExternalLink,
  PanelLeftClose,
  PanelLeftOpen,
  UserRound,
  AlertCircle,
  WandSparkles
} from "lucide-react";

const MODEL_GROUPS = [
  {
    name: "GPT-6",
    models: [
      ["GPT-6 Astra", "xyrz/gpt-6-astra"],
      ["GPT-6 Luna", "xyrz/gpt-6-luna"]
    ]
  },
  {
    name: "GPT-5.6",
    models: [
      ["GPT-5.6 Luna", "xyrz/gpt-5.6-luna"],
      ["GPT-5.6 Sol", "xyrz/gpt-5.6-sol"],
      ["GPT-5.6 Terra", "xyrz/gpt-5.6-terra"]
    ]
  },
  {
    name: "GPT-5.5",
    models: [
      ["GPT-5.5", "xyrz/gpt-5.5"],
      ["GPT-5.5 Review", "xyrz/gpt-5.5-review"]
    ]
  },
  {
    name: "MiniMax",
    models: [
      ["MiniMax M2.1", "xyrz/minimax-m2.1"],
      ["MiniMax M3", "xyrz/minimax-m3"]
    ]
  },
  {
    name: "GLM",
    models: [
      ["GLM 5.1", "xyrz/glm-5.1"],
      ["GLM 5.3", "xyrz/glm-5.3"],
      ["GLM 5.3 Flash", "xyrz/glm-5.3-flash"]
    ]
  },
  {
    name: "Kimi",
    models: [
      ["Kimi K2.7 Code", "xyrz/kimi-k2.7-code"],
      ["Kimi K3", "xyrz/kimi-k3"]
    ]
  },
  {
    name: "DeepSeek",
    models: [
      ["DeepSeek V4 Flash", "xyrz/deepseek-v4-flash"],
      ["DeepSeek V4 Pro", "xyrz/deepseek-v4-pro"],
      ["DeepSeek 4.1 Flash", "xyrz/deepsek-4.1-flash"]
    ]
  },
  {
    name: "Claude",
    models: [
      ["Claude Fable 5", "xyrz/claude-fable-5"],
      ["Claude Fable 5.1", "xyrz/claude-fable5.1"],
      ["Claude Opus 4.7", "xyrz/claude-opus-4.7"],
      ["Claude Opus 5", "xyrz/claude-opus-5"],
      ["Claude Opus 5.5", "xyrz/claude-opus-5.5"]
    ]
  },
  {
    name: "Qwen",
    models: [
      ["Qwen 3.7 Max", "xyrz/qwen3.7-max"],
      ["Qwen 3.7 Plus", "xyrz/qwen3.7-plus"],
      ["Qwen 3.8 Max Preview", "xyrz/qwen3.8-max-preview"]
    ]
  },
  {
    name: "Gemini",
    models: [
      ["Gemini 4 Argon", "xyrz/gemini-4-argon"]
    ]
  },
  {
    name: "Lainnya",
    models: [
      ["Muse Spark 1.3", "xyrz/muse-spark-1.3"]
    ]
  }
];

const ALL_MODELS = MODEL_GROUPS.flatMap((group) => group.models);
const DEFAULT_MODEL = "xyrz/gpt-5.6-luna";
const STORAGE_KEY = "zerox-ai-v1";

function createChat() {
  return {
    id: crypto.randomUUID(),
    title: "Percakapan baru",
    messages: [],
    createdAt: Date.now()
  };
}

function Robot({ large = false }) {
  return (
    <div className={`robot ${large ? "robot-large" : ""}`}>
      <div className="robot-antenna" />
      <div className="robot-head">
        <div className="robot-ear robot-ear-left" />
        <div className="robot-ear robot-ear-right" />
        <div className="robot-face">
          <span className="robot-eye" />
          <span className="robot-eye" />
          <span className="robot-mouth" />
        </div>
      </div>
      <div className="robot-glow" />
    </div>
  );
}

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [showJoin, setShowJoin] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [fileText, setFileText] = useState("");
  const [fileName, setFileName] = useState("");
  const [model, setModel] = useState(DEFAULT_MODEL);
  const [modelMenu, setModelMenu] = useState(false);
  const [input, setInput] = useState("");
  const [chats, setChats] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState("");
  const [toast, setToast] = useState("");

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const fileRef = useRef(null);
  const modelRef = useRef(null);
  const abortRef = useRef(null);

  const activeChat =
    chats.find((chat) => chat.id === activeId) || null;

  const currentModelName =
    ALL_MODELS.find((item) => item[1] === model)?.[0] || model;

  const showSidebar = sidebarOpen || mobileSidebar;

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      setShowJoin(true);
    }, 3000);

    try {
      const saved = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "null"
      );

      if (saved) {
        setChats(Array.isArray(saved.chats) ? saved.chats : []);
        setActiveId(saved.activeId || null);
        setPrompt(saved.prompt || "");
        setModel(
          ALL_MODELS.some((item) => item[1] === saved.model)
            ? saved.model
            : DEFAULT_MODEL
        );
      }
    } catch {
      // Abaikan data lokal yang rusak.
    }

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (loading) return;

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ chats, activeId, prompt, model })
      );
    } catch {
      // Riwayat mungkin terlalu besar untuk penyimpanan browser.
    }
  }, [chats, activeId, prompt, model, loading]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end"
    });
  }, [chats, busy]);

  useEffect(() => {
    function closeModelMenu(event) {
      if (
        modelRef.current &&
        !modelRef.current.contains(event.target)
      ) {
        setModelMenu(false);
      }
    }

    document.addEventListener("mousedown", closeModelMenu);

    return () => {
      document.removeEventListener("mousedown", closeModelMenu);
    };
  }, []);

  function notify(message) {
    setToast(message);
    setTimeout(() => setToast(""), 2500);
  }

  function startNewChat() {
    if (busy) return;

    const chat = createChat();

    setChats((previous) => [chat, ...previous]);
    setActiveId(chat.id);
    setInput("");
    setError("");
    setMobileSidebar(false);

    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function selectChat(id) {
    if (busy) return;

    setActiveId(id);
    setError("");
    setMobileSidebar(false);
  }

  function deleteChat(id, event) {
    event.stopPropagation();

    if (busy && id === activeId) {
      notify("Hentikan generasi sebelum menghapus chat aktif.");
      return;
    }

    const remaining = chats.filter((chat) => chat.id !== id);

    setChats(remaining);

    if (activeId === id) {
      setActiveId(remaining[0]?.id || null);
    }
  }

  async function uploadTextFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".txt")) {
      notify("Pilih file TXT saja.");
      return;
    }

    if (file.size > 300 * 1024) {
      notify("Ukuran file maksimal 300 KB.");
      return;
    }

    try {
      const text = await file.text();

      setFileText(text);
      setFileName(file.name);
      setSettingsOpen(true);

      notify("File berhasil dimuat.");
    } catch {
      notify("File gagal dibaca.");
    }
  }

  async function sendMessage(event) {
    event?.preventDefault();

    const text = input.trim();

    if (!text || busy) return;

    setError("");

    let chat = activeChat;

    if (!chat) {
      chat = createChat();
      setChats((previous) => [chat, ...previous]);
      setActiveId(chat.id);
    }

    const userMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text
    };

    const assistantMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: ""
    };

    const oldMessages = chat.messages || [];
    const title =
      oldMessages.length === 0
        ? text.slice(0, 42) + (text.length > 42 ? "…" : "")
        : chat.title;

    setChats((previous) =>
      previous.map((item) =>
        item.id === chat.id
          ? {
              ...item,
              title,
              messages: [
                ...oldMessages,
                userMessage,
                assistantMessage
              ]
            }
          : item
      )
    );

    setInput("");
    setBusy(true);

    const controller = new AbortController();
    abortRef.current = controller;

    const context = [
      prompt.trim(),
      fileText
        ? `Isi file ${fileName || "lampiran.txt"}:\n${fileText}`
        : ""
    ]
      .filter(Boolean)
      .join("\n\n");

    const apiMessages = [];

    if (context) {
      apiMessages.push({
        role: "system",
        content: context
      });
    }

    for (const message of [...oldMessages, userMessage]) {
      apiMessages.push({
        role: message.role,
        content: message.content
      });
    }

    function updateAssistant(content) {
      setChats((previous) =>
        previous.map((item) =>
          item.id === chat.id
            ? {
                ...item,
                messages: item.messages.map((message) =>
                  message.id === assistantMessage.id
                    ? { ...message, content }
                    : message
                )
              }
            : item
        )
      );
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          messages: apiMessages
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(
          data.error || `Request gagal (${response.status}).`
        );
      }

      if (!response.body) {
        throw new Error("Browser tidak menerima stream respons.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let buffer = "";
      let answer = "";

      function processLine(line) {
        const trimmed = line.trim();

        if (!trimmed.startsWith("data:")) return;

        const data = trimmed.slice(5).trim();

        if (!data || data === "[DONE]") return;

        let parsed;

        try {
          parsed = JSON.parse(data);
        } catch {
          return;
        }

        if (parsed.error?.message) {
          throw new Error(parsed.error.message);
        }

        const delta = parsed.choices?.[0]?.delta?.content;

        if (typeof delta === "string") {
          answer += delta;
          updateAssistant(answer);
        } else if (Array.isArray(delta)) {
          for (const part of delta) {
            if (typeof part?.text === "string") {
              answer += part.text;
            }
          }

          updateAssistant(answer);
        }
      }

      while (true) {
        const { value, done } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          processLine(line);
        }
      }

      buffer += decoder.decode();

      if (buffer.trim()) {
        processLine(buffer);
      }

      if (!answer.trim()) {
        updateAssistant(
          "Model tidak mengirim teks. Coba model lain."
        );
      }
    } catch (err) {
      const message =
        err.name === "AbortError"
          ? "Generasi dihentikan."
          : err.message || "Terjadi kesalahan.";

      setError(message);

      setChats((previous) =>
        previous.map((item) =>
          item.id === chat.id
            ? {
                ...item,
                messages: item.messages.filter(
                  (message) =>
                    message.id !== assistantMessage.id ||
                    message.content
                )
              }
            : item
        )
      );
    } finally {
      setBusy(false);
      abortRef.current = null;
      inputRef.current?.focus();
    }
  }

  function stopGeneration() {
    abortRef.current?.abort();
  }

  async function copyMessage(message) {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopiedId(message.id);
      setTimeout(() => setCopiedId(""), 1500);
    } catch {
      notify("Gagal menyalin pesan.");
    }
  }

  function openTelegram() {
    window.open(
      "https://t.me/informasixenomz",
      "_blank",
      "noopener,noreferrer"
    );

    setShowJoin(false);
  }

  return (
    <main className="app-shell">
      {loading && (
        <div className="loading-screen">
          <div className="loading-grid" />
          <div className="loading-orbit orbit-one" />
          <div className="loading-orbit orbit-two" />

          <div className="loading-core">
            <Robot large />
          </div>

          <div className="loading-brand">
            ZEROX<span>AI</span>
          </div>

          <p className="loading-subtitle">
            YOUR INTELLIGENCE, AMPLIFIED
          </p>

          <div className="loading-progress">
            <span />
          </div>

          <div className="loading-status">
            <span className="status-dot" />
            INITIALIZING WORKSPACE
          </div>
        </div>
      )}

      {showJoin && !loading && (
        <div className="modal-backdrop">
          <section
            className="join-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="join-title"
          >
            <button
              className="icon-button modal-close"
              onClick={() => setShowJoin(false)}
              aria-label="Tutup"
            >
              <X size={18} />
            </button>

            <div className="join-art">
              <div className="join-ring ring-a" />
              <div className="join-ring ring-b" />
              <Robot large />
            </div>

            <div className="eyebrow">
              <Sparkles size={13} />
              COMMUNITY ACCESS
            </div>

            <h2 id="join-title">
              Stay in the <span>loop.</span>
            </h2>

            <p className="join-copy">
              Gabung channel Xenomz buat update, info project,
              dan kabar terbaru seputar ZEROX AI.
            </p>

            <a
              className="join-channel"
              href="https://t.me/informasixenomz"
              target="_blank"
              rel="noreferrer"
            >
              <span className="telegram-icon">➤</span>
              <span className="join-channel-copy">
                <strong>@informasixenomz</strong>
                <small>Official updates channel</small>
              </span>
              <ExternalLink size={16} />
            </a>

            <button
              className="primary-button join-button"
              onClick={openTelegram}
            >
              Join Telegram <ArrowUp size={16} />
            </button>

            <button
              className="text-button"
              onClick={() => setShowJoin(false)}
            >
              Lanjut ke ZEROX AI <ArrowDown size={14} />
            </button>

            <div className="modal-foot">
              <ShieldCheck size={13} />
              No account required · Free to explore
            </div>
          </section>
        </div>
      )}

      {mobileSidebar && (
        <button
          className="mobile-scrim"
          onClick={() => setMobileSidebar(false)}
          aria-label="Tutup sidebar"
        />
      )}

      <aside
        className={[
          "sidebar",
          showSidebar ? "sidebar-open" : "sidebar-collapsed",
          mobileSidebar ? "sidebar-mobile-open" : ""
        ].join(" ")}
      >
        <div className="sidebar-top">
          <a className="brand" href="#" aria-label="ZEROX AI home">
            <span className="brand-icon">
              <Bot size={20} />
            </span>

            {showSidebar && (
              <span className="brand-name">
                ZEROX<span>AI</span>
              </span>
            )}
          </a>

          <button
            className="icon-button desktop-only"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? (
              <PanelLeftClose size={17} />
            ) : (
              <PanelLeftOpen size={17} />
            )}
          </button>

          <button
            className="icon-button mobile-only"
            onClick={() => setMobileSidebar(false)}
            aria-label="Tutup sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {showSidebar && (
          <>
            <button
              className="new-chat-button"
              onClick={startNewChat}
            >
              <Plus size={17} />
              <span>New conversation</span>
              <span className="shortcut">NEW</span>
            </button>

            <div className="sidebar-label">WORKSPACE</div>

            <button
              className={`nav-item ${settingsOpen ? "nav-active" : ""}`}
              onClick={() => setSettingsOpen(!settingsOpen)}
            >
              <Settings2 size={17} />
              <span>Prompt & files</span>
              <ChevronDown
                className={`nav-chevron ${
                  settingsOpen ? "rotated" : ""
                }`}
                size={15}
              />
            </button>

            {settingsOpen && (
              <div className="settings-panel">
                <label className="field-label" htmlFor="system-prompt">
                  SYSTEM PROMPT
                </label>

                <textarea
                  id="system-prompt"
                  className="prompt-input"
                  value={prompt}
                  maxLength={4000}
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder="Atur cara AI menjawab..."
                  rows={5}
                />

                <div className="field-meta">
                  <span>Custom instructions</span>
                  <span>{prompt.length}/4000</span>
                </div>

                <label className="field-label file-label">
                  CONTEXT FILE
                </label>

                <button
                  className="upload-zone"
                  onClick={() => fileRef.current?.click()}
                >
                  <span className="upload-icon">
                    <FileText size={17} />
                  </span>

                  <span className="upload-copy">
                    <strong>
                      {fileName || "Upload .txt file"}
                    </strong>
                    <small>
                      {fileText
                        ? `${fileText.length.toLocaleString()} characters loaded`
                        : "Max 300 KB · Text only"}
                    </small>
                  </span>

                  {fileText ? <Check size={16} /> : <Plus size={16} />}
                </button>

                {fileText && (
                  <button
                    className="remove-file"
                    onClick={() => {
                      setFileText("");
                      setFileName("");
                    }}
                  >
                    Remove file
                  </button>
                )}

                <input
                  ref={fileRef}
                  type="file"
                  accept=".txt,text/plain"
                  hidden
                  onChange={uploadTextFile}
                />
              </div>
            )}

            <div className="history-heading">
              <span className="sidebar-label">RECENTS</span>
              <span className="history-count">
                {chats.length || ""}
              </span>
            </div>

            <div className="chat-history">
              {chats.length === 0 ? (
                <div className="empty-history">
                  <MessageSquare size={16} />
                  <span>Conversations appear here</span>
                </div>
              ) : (
                chats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`history-row ${
                      activeId === chat.id ? "history-active" : ""
                    }`}
                  >
                    <button
                      className="history-item"
                      onClick={() => selectChat(chat.id)}
                    >
                      <MessageSquare size={15} />
                      <span>{chat.title}</span>
                    </button>

                    <button
                      className="history-delete"
                      onClick={(event) => deleteChat(chat.id, event)}
                      aria-label="Hapus percakapan"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="sidebar-bottom">
              <div className="owner-card">
                <div className="owner-avatar">X</div>
                <div className="owner-info">
                  <strong>Xenomz</strong>
                  <span>ZEROX AI creator</span>
                </div>
                <span className="owner-status" />
              </div>

              <div className="social-links">
                <a
                  href="https://t.me/xenomzne"
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="social-glyph">↗</span>
                  <span>@xenomzne</span>
                  <ExternalLink size={12} />
                </a>

                <a
                  href="https://t.me/informasixenomz"
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="social-glyph">◉</span>
                  <span>@informasixenomz</span>
                  <ExternalLink size={12} />
                </a>
              </div>

              <div className="sidebar-version">
                <span>ZEROX AI</span>
                <span>v1.0.0</span>
              </div>
            </div>
          </>
        )}
      </aside>

      <section className="main-panel">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button mobile-only"
              onClick={() => setMobileSidebar(true)}
              aria-label="Buka sidebar"
            >
              <Menu size={19} />
            </button>

            {!showSidebar && (
              <button
                className="icon-button desktop-only"
                onClick={() => setSidebarOpen(true)}
                aria-label="Buka sidebar"
              >
                <PanelLeftOpen size={17} />
              </button>
            )}

            <div className="model-select-wrap" ref={modelRef}>
              <button
                className={`model-select ${
                  modelMenu ? "model-select-open" : ""
                }`}
                onClick={() => setModelMenu(!modelMenu)}
              >
                <span className="model-indicator">
                  <span />
                </span>
                <span>{currentModelName}</span>
                <ChevronDown size={15} />
              </button>

              {modelMenu && (
                <div className="model-menu">
                  <div className="model-menu-head">
                    <span>SELECT MODEL</span>
                    <span>{ALL_MODELS.length} models</span>
                  </div>

                  <div className="model-menu-scroll">
                    {MODEL_GROUPS.map((group) => (
                      <div className="model-group" key={group.name}>
                        <div className="model-group-name">
                          {group.name}
                        </div>

                        {group.models.map(([name, id]) => (
                          <button
                            key={id}
                            className={`model-option ${
                              model === id ? "model-option-active" : ""
                            }`}
                            onClick={() => {
                              setModel(id);
                              setModelMenu(false);
                              notify(`Model dipilih: ${name}`);
                            }}
                          >
                            <span className="model-option-dot">
                              {model === id ? <Check size={12} /> : null}
                            </span>
                            <span>{name}</span>
                            {model === id && (
                              <span className="selected-label">
                                ACTIVE
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>

                  <div className="model-menu-foot">
                    <Activity size={13} />
                    Ketersediaan model dapat berubah
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="topbar-right">
            <div className="gateway-status">
              <span className="status-dot" />
              <span>Xyrus Router</span>
            </div>

            <button
              className="icon-button"
              onClick={startNewChat}
              title="Percakapan baru"
            >
              <SquarePen size={17} />
            </button>
          </div>
        </header>

        <div className="chat-scroll">
          {!activeChat || activeChat.messages.length === 0 ? (
            <div className="welcome-screen">
              <div className="welcome-orb">
                <div className="orb-halo" />
                <Robot large />
                <span className="orb-spark spark-one">✳</span>
                <span className="orb-spark spark-two">✦</span>
              </div>

              <div className="welcome-kicker">
                <span className="kicker-line" />
                INTELLIGENCE, REIMAGINED
                <span className="kicker-line" />
              </div>

              <h1>
                What can we <span>solve</span>
                <br />
                together?
              </h1>

              <p className="welcome-description">
                Ruang untuk berpikir, berkarya, dan mengeksplorasi.
                <br className="desktop-only" />
                Pilih model AI yang cocok untuk kebutuhan lo.
              </p>

              <div className="suggestion-grid">
                <button
                  className="suggestion-card"
                  onClick={() =>
                    setInput("Bantu gw menyusun ide project web yang unik")
                  }
                >
                  <span className="suggestion-icon violet">
                    <WandSparkles size={17} />
                  </span>
                  <span>
                    <strong>Explore an idea</strong>
                    <small>Ubah ide jadi rencana</small>
                  </span>
                  <ArrowUp size={15} />
                </button>

                <button
                  className="suggestion-card"
                  onClick={() =>
                    setInput("Jelaskan konsep rumit dengan bahasa sederhana")
                  }
                >
                  <span className="suggestion-icon blue">
                    <MessageSquare size={17} />
                  </span>
                  <span>
                    <strong>Understand something</strong>
                    <small>Pelajari konsep baru</small>
                  </span>
                  <ArrowUp size={15} />
                </button>

                <button
                  className="suggestion-card"
                  onClick={() =>
                    setInput("Bantu gw membuat kode yang rapi dan aman")
                  }
                >
                  <span className="suggestion-icon pink">
                    <Bot size={17} />
                  </span>
                  <span>
                    <strong>Build something</strong>
                    <small>Code, debug, improve</small>
                  </span>
                  <ArrowUp size={15} />
                </button>

                <button
                  className="suggestion-card"
                  onClick={() =>
                    setInput("Bantu gw membuat rencana mencapai tujuan")
                  }
                >
                  <span className="suggestion-icon gold">
                    <Zap size={17} />
                  </span>
                  <span>
                    <strong>Make a game plan</strong>
                    <small>Susun langkah berikutnya</small>
                  </span>
                  <ArrowUp size={15} />
                </button>
              </div>
            </div>
          ) : (
            <div className="message-list">
              <div className="conversation-heading">
                <div>
                  <span className="conversation-label">
                    CONVERSATION
                  </span>
                  <h2>{activeChat.title}</h2>
                </div>

                <span className="conversation-model">
                  {currentModelName}
                </span>
              </div>

              {activeChat.messages.map((message) => (
                <article
                  className={`message-row message-${message.role}`}
                  key={message.id}
                >
                  <div
                    className={`message-avatar ${
                      message.role === "assistant"
                        ? "assistant-avatar"
                        : "user-avatar"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <Bot size={17} />
                    ) : (
                      <UserRound size={16} />
                    )}
                  </div>

                  <div className="message-content">
                    <div className="message-author">
                      {message.role === "assistant" ? "ZEROX AI" : "You"}
                      {message.role === "assistant" && (
                        <span className="message-model-tag">
                          {currentModelName}
                        </span>
                      )}
                    </div>

                    <div className="message-text">
                      {message.content ||
                      (message.role === "assistant" && busy) ? (
                        message.content || (
                          <span className="typing-indicator">
                            <i />
                            <i />
                            <i />
                          </span>
                        )
                      ) : null}
                    </div>

                    {message.role === "assistant" && message.content && (
                      <div className="message-actions">
                        <button onClick={() => copyMessage(message)}>
                          <Copy size={13} />
                          {copiedId === message.id ? "Copied" : "Copy"}
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              ))}

              {error && (
                <div className="error-banner">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                  <button onClick={() => setError("")}>
                    <X size={14} />
                  </button>
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          )}
        </div>

        <div className="composer-area">
          <form className="composer" onSubmit={sendMessage}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey &&
                  !event.nativeEvent.isComposing
                ) {
                  event.preventDefault();
                  sendMessage(event);
                }
              }}
              placeholder="Message ZEROX AI..."
              rows={1}
              maxLength={12000}
              aria-label="Pesan untuk ZEROX AI"
            />

            <div className="composer-bottom">
              <div className="composer-tools">
                <button
                  type="button"
                  className="composer-tool"
                  onClick={() => {
                    setSettingsOpen(true);
                    setSidebarOpen(true);
                    setMobileSidebar(true);
                  }}
                >
                  <Settings2 size={15} />
                  <span>Context</span>
                </button>

                {fileName && (
                  <span className="attached-file">
                    <FileText size={12} />
                    {fileName}
                  </span>
                )}

                <span className="composer-hint">
                  Shift + Enter untuk baris baru
                </span>
              </div>

              {busy ? (
                <button
                  type="button"
                  className="send-button stop-button"
                  onClick={stopGeneration}
                  title="Hentikan generasi"
                >
                  <span className="stop-square" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="send-button"
                  disabled={!input.trim()}
                  title="Kirim pesan"
                >
                  <Send size={17} />
                </button>
              )}
            </div>
          </form>

          <div className="disclaimer">
            ZEROX AI dapat membuat kesalahan. Periksa informasi penting.
          </div>
        </div>
      </section>

      {toast && (
        <div className="toast">
          <Check size={15} />
          {toast}
        </div>
      )}
    </main>
  );
}
