"use client";

import { useState, useRef, useEffect } from "react";
import { askGeminiWithImage } from "../lib/openrouter";

export default function Home() {
  const [message, setMessage] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isImageValid, setIsImageValid] = useState(true);
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const validateImageUrl = (url) => {
    if (!url) {
      setIsImageValid(true);
      return true;
    }

    const regex = /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))$/i;
    const valid = regex.test(url);
    setIsImageValid(valid);
    return valid;
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageUrl(e.target.result);
        setIsImageValid(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEmojiClick = (emoji) => {
    setMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim() && !imageUrl) return;
    if (imageUrl && !isImageValid) return;

    const userMessage = {
      role: "user",
      content: message,
      imageUrl: imageUrl || null,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setConversation((prev) => [...prev, userMessage]);
    setLoading(true);
    setMessage("");
    setImageUrl("");

    try {
      const response = await askGeminiWithImage(message, imageUrl);
      const aiMessage = {
        role: "assistant",
        content: response,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setConversation((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        role: "assistant",
        content: "Maaf, terjadi kesalahan saat menghubungi skiAI.",
        error: true,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setConversation((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const clearConversation = () => {
    setConversation([]);
  };

  // Simple emoji picker component
  const EmojiPicker = () => {
    const emojis = [
      "😊",
      "👍",
      "🎉",
      "❤️",
      "🔥",
      "👀",
      "💡",
      "🤔",
      "✨",
      "🙏",
      "👋",
      "🚀",
    ];

    return (
      <div
        ref={emojiPickerRef}
        className="emoji-picker"
        style={{
          position: "absolute",
          bottom: "60px",
          left: "16px",
          background: "#2d3748",
          borderRadius: "8px",
          padding: "8px",
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: "8px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
          zIndex: 10,
          border: "1px solid #4a5568",
        }}
      >
        {emojis.map((emoji, index) => (
          <button
            key={index}
            onClick={() => handleEmojiClick(emoji)}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "20px",
              width: "32px",
              height: "32px",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "#4a5568";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            {emoji}
          </button>
        ))}
      </div>
    );
  };

  // Code highlighting function
  const formatMessage = (content) => {
    // Simple code block detection and formatting
    if (!content) return "";

    const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
    let formattedContent = content;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      const language = match[1] || "";
      const code = match[2];
      const formattedCode = `
        <div style="background: #1a202c; border-radius: 6px; margin: 12px 0; overflow: hidden;">
          ${
            language
              ? `<div style="background: #2d3748; padding: 6px 12px; color: #a0aec0; font-size: 12px; border-bottom: 1px solid #4a5568;">${language}</div>`
              : ""
          }
          <pre style="padding: 12px; margin: 0; overflow-x: auto;"><code style="font-family: monospace;">${code
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")}</code></pre>
        </div>
      `;
      formattedContent = formattedContent.replace(match[0], formattedCode);
    }

    return formattedContent;
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <header
        style={{
          background: "linear-gradient(to right, #1a365d, #2a4365)",
          padding: "16px",
          color: "white",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.3)",
        }}
      >
        <div
          style={{
            maxWidth: "64rem",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #3182ce, #2c5282)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.2)",
              }}
            >
              <span
                style={{
                  color: "white",
                  fontSize: "20px",
                  fontWeight: "bold",
                }}
              >
                S
              </span>
            </div>
            <h1
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                letterSpacing: "-0.025em",
              }}
            >
              skiAI
            </h1>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={clearConversation}
              style={{
                fontSize: "14px",
                padding: "6px 12px",
                borderRadius: "6px",
                background: "rgba(255, 255, 255, 0.1)",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)")
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              New Chat
            </button>
          </div>
        </div>
      </header>

      {/* Main chat area */}
      <main
        style={{
          flex: "1",
          maxWidth: "64rem",
          width: "100%",
          margin: "0 auto",
          padding: "16px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            flex: "1",
            overflowY: "auto",
            marginBottom: "16px",
            borderRadius: "8px",
          }}
        >
          {conversation.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                textAlign: "center",
                padding: "32px",
                color: "#a0aec0",
              }}
            >
              <div style={{ fontSize: "60px", marginBottom: "24px" }}>❄️</div>
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#e2e8f0",
                  marginBottom: "8px",
                }}
              >
                Selamat datang di skiAI
              </h2>
              <p style={{ maxWidth: "28rem" }}>
                Tanyakan apa saja atau unggah gambar untuk memulai percakapan
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                  marginTop: "24px",
                  maxWidth: "36rem",
                  width: "100%",
                }}
              >
                {[
                  "Cara menggunakan skiAI?",
                  "Apa yang bisa kamu lakukan?",
                  "Ceritakan tentang dirimu",
                  "Bantu saya memulai proyek",
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setMessage(suggestion);
                      setTimeout(() => handleSubmit(new Event("submit")), 100);
                    }}
                    style={{
                      padding: "12px",
                      borderRadius: "8px",
                      background: "#2d3748",
                      border: "1px solid #4a5568",
                      color: "#e2e8f0",
                      textAlign: "left",
                      transition: "all 0.2s ease",
                      cursor: "pointer",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = "#3d4c61";
                      e.currentTarget.style.borderColor = "#718096";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = "#2d3748";
                      e.currentTarget.style.borderColor = "#4a5568";
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div
              style={{
                marginTop: "16px",
                marginBottom: "16px",
                paddingLeft: "8px",
                paddingRight: "8px",
              }}
            >
              {conversation.map((msg, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    justifyContent:
                      msg.role === "user" ? "flex-end" : "flex-start",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "80%",
                      borderRadius: "12px",
                      padding: "16px",
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                      background:
                        msg.role === "user"
                          ? "#3182ce"
                          : msg.error
                          ? "#742a2a"
                          : "#2d3748",
                      color: "white",
                      borderTopRightRadius: msg.role === "user" ? "0" : "12px",
                      borderTopLeftRadius: msg.role === "user" ? "12px" : "0",
                    }}
                  >
                    {msg.imageUrl && (
                      <div style={{ marginBottom: "12px" }}>
                        <img
                          src={msg.imageUrl}
                          alt="Uploaded"
                          style={{
                            maxHeight: "240px",
                            maxWidth: "100%",
                            borderRadius: "8px",
                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                          }}
                        />
                      </div>
                    )}
                    {msg.role === "assistant" ? (
                      <div
                        style={{ whiteSpace: "pre-wrap" }}
                        dangerouslySetInnerHTML={{
                          __html: formatMessage(msg.content),
                        }}
                      />
                    ) : (
                      <div style={{ whiteSpace: "pre-wrap" }}>
                        {msg.content}
                      </div>
                    )}
                    <div
                      style={{
                        fontSize: "12px",
                        marginTop: "8px",
                        color:
                          msg.role === "user"
                            ? "rgba(219, 234, 254, 0.7)"
                            : "#a0aec0",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span>{msg.timestamp}</span>
                      {msg.role === "assistant" && (
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "#a0aec0",
                              cursor: "pointer",
                              padding: "2px",
                            }}
                            title="Copy to clipboard"
                            onClick={() => {
                              navigator.clipboard.writeText(msg.content);
                              // Could add a copied feedback here
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <rect
                                x="9"
                                y="9"
                                width="13"
                                height="13"
                                rx="2"
                                ry="2"
                              ></rect>
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: "flex", justifyContent: "flex-start" }}>
                  <div
                    style={{
                      maxWidth: "75%",
                      borderRadius: "12px",
                      padding: "16px",
                      background: "#2d3748",
                      color: "#e2e8f0",
                      borderTopLeftRadius: "0",
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <div style={{ display: "flex", gap: "8px" }}>
                      <div
                        style={{
                          width: "10px",
                          height: "10px",
                          background: "#4299e1",
                          borderRadius: "9999px",
                          animation: "bounce 1s infinite",
                        }}
                      ></div>
                      <div
                        style={{
                          width: "10px",
                          height: "10px",
                          background: "#4299e1",
                          borderRadius: "9999px",
                          animation: "bounce 1s infinite",
                          animationDelay: "0.15s",
                        }}
                      ></div>
                      <div
                        style={{
                          width: "10px",
                          height: "10px",
                          background: "#4299e1",
                          borderRadius: "9999px",
                          animation: "bounce 1s infinite",
                          animationDelay: "0.3s",
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <form
          onSubmit={handleSubmit}
          style={{
            background: "#2d3748",
            borderRadius: "12px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            padding: "12px",
            border: "1px solid #4a5568",
            position: "relative",
          }}
        >
          {imageUrl && (
            <div
              style={{
                padding: "0 12px",
                paddingTop: "8px",
                paddingBottom: "8px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <div style={{ position: "relative" }}>
                  <img
                    src={imageUrl}
                    alt="Uploaded"
                    style={{
                      height: "64px",
                      width: "64px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setImageUrl("")}
                    style={{
                      position: "absolute",
                      top: "-8px",
                      right: "-8px",
                      background: "#2c5282",
                      borderRadius: "9999px",
                      width: "22px",
                      height: "22px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "12px",
                      border: "2px solid #2d3748",
                      cursor: "pointer",
                    }}
                  >
                    ×
                  </button>
                </div>
                {!isImageValid && (
                  <div style={{ color: "#fc8181", fontSize: "12px" }}>
                    URL gambar tidak valid
                  </div>
                )}
              </div>
            </div>
          )}

          {showEmojiPicker && <EmojiPicker />}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "4px",
              background: "#1a202c",
              borderRadius: "8px",
            }}
          >
            <div style={{ display: "flex", gap: "4px" }}>
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                style={{
                  padding: "8px",
                  color: "#a0aec0",
                  borderRadius: "6px",
                  transition: "all 0.2s ease",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.color = "#63b3ed";
                  e.currentTarget.style.background = "#2d3748";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.color = "#a0aec0";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  style={{ display: "none" }}
                />
              </button>
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                style={{
                  padding: "8px",
                  color: "#a0aec0",
                  borderRadius: "6px",
                  transition: "all 0.2s ease",
                  background: showEmojiPicker ? "#2d3748" : "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
                onMouseOver={(e) => {
                  if (!showEmojiPicker) {
                    e.currentTarget.style.color = "#63b3ed";
                    e.currentTarget.style.background = "#2d3748";
                  }
                }}
                onMouseOut={(e) => {
                  if (!showEmojiPicker) {
                    e.currentTarget.style.color = "#a0aec0";
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                  <line x1="9" y1="9" x2="9.01" y2="9"></line>
                  <line x1="15" y1="9" x2="15.01" y2="9"></line>
                </svg>
              </button>
            </div>

            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tanyakan sesuatu pada skiAI..."
              style={{
                flex: "1",
                border: "0",
                padding: "10px",
                outline: "none",
                background: "transparent",
                color: "#e2e8f0",
              }}
            />

            <button
              type="submit"
              disabled={
                loading ||
                (!message.trim() && !imageUrl) ||
                (imageUrl && !isImageValid)
              }
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                background:
                  loading ||
                  (!message.trim() && !imageUrl) ||
                  (imageUrl && !isImageValid)
                    ? "#2d3748"
                    : "#3182ce",
                color:
                  loading ||
                  (!message.trim() && !imageUrl) ||
                  (imageUrl && !isImageValid)
                    ? "#718096"
                    : "white",
                transition: "all 0.2s ease",
                border: "none",
                cursor:
                  loading ||
                  (!message.trim() && !imageUrl) ||
                  (imageUrl && !isImageValid)
                    ? "not-allowed"
                    : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onMouseOver={(e) => {
                if (
                  !(
                    loading ||
                    (!message.trim() && !imageUrl) ||
                    (imageUrl && !isImageValid)
                  )
                ) {
                  e.currentTarget.style.background = "#2b6cb0";
                }
              }}
              onMouseOut={(e) => {
                if (
                  !(
                    loading ||
                    (!message.trim() && !imageUrl) ||
                    (imageUrl && !isImageValid)
                  )
                ) {
                  e.currentTarget.style.background = "#3182ce";
                }
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>

          {/* Optional URL input */}
          <div style={{ padding: "8px 8px 0 8px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginTop: "4px",
              }}
            >
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  validateImageUrl(e.target.value);
                }}
                placeholder="Atau masukkan URL gambar..."
                style={{
                  width: "100%",
                  fontSize: "14px",
                  padding: "8px 12px",
                  border: `1px solid ${!isImageValid ? "#fc8181" : "#4a5568"}`,
                  borderRadius: "6px",
                  background: "#1a202c",
                  color: "#e2e8f0",
                }}
              />
            </div>
          </div>
        </form>

        <div
          style={{
            textAlign: "center",
            fontSize: "12px",
            color: "#718096",
            marginTop: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <span>skiAI powered by Gemini via OpenRouter</span>
          <span style={{ color: "#4a5568" }}>•</span>
          <span>
            {new Date().toLocaleString("id-ID", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </main>

      <style jsx>{`
        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
        }

        ::-webkit-scrollbar-track {
          background: #1a202c;
        }

        ::-webkit-scrollbar-thumb {
          background: #4a5568;
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #718096;
        }

        /* Fade-in animation for messages */
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
