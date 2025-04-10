"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ChatPage = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [chatId, setChatId] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const recognitionRef = useRef<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
        const newChatId = uuidv4();
        setChatId(newChatId);
        fetchMessages(session.user.id, newChatId);
      } else {
        router.push("/");
      }
    };
    fetchUser();
  }, [router]);

  const fetchMessages = async (uid: string, cid: string) => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("user_id", uid)
      .eq("chat_id", cid)
      .order("created_at", { ascending: true });
    if (!error && data) setMessages(data);
  };

  const sendMessage = async () => {
    if (!input.trim() || !userId || !chatId) return;

    setIsLoading(true);

    const { data, error } = await supabase.from("messages").insert([
      {
        content: input,
        role: "user",
        user_id: userId,
        chat_id: chatId,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error || !data) {
      console.error("Gagal kirim:", error);
      setIsLoading(false);
      return;
    }

    setMessages((prev) => [...prev, data[0]]);
    setInput("");

    const aiResponse = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: input }),
    });

    const result = await aiResponse.json();

    const { data: assistantData, error: assistantError } = await supabase
      .from("messages")
      .insert([
        {
          content: result.text,
          role: "assistant",
          user_id: userId,
          chat_id: chatId,
          created_at: new Date().toISOString(),
        },
      ]);

    if (!assistantError && assistantData) {
      setMessages((prev) => [...prev, assistantData[0]]);
    }

    setIsLoading(false);
  };

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition)
      return alert("Browser tidak mendukung Speech Recognition");

    const recognition = new SpeechRecognition();
    recognition.lang = "id-ID";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech error:", event);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Chat AI</h2>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-3 py-1 rounded-md"
        >
          Logout
        </button>
      </div>
      <div className="space-y-2 h-[70vh] overflow-y-auto border p-4 rounded-md">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-2 rounded-md ${
              msg.role === "user"
                ? "bg-blue-100 text-right"
                : "bg-gray-200 text-left"
            }`}
          >
            {msg.content}
          </div>
        ))}
        {isLoading && (
          <div className="text-sm italic">AI sedang mengetik...</div>
        )}
      </div>
      <div className="flex gap-2 mt-4">
        <input
          className="flex-1 border p-2 rounded-md"
          placeholder="Tulis pesan..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
          onClick={sendMessage}
          disabled={isLoading}
        >
          Kirim
        </button>
        <button
          className="bg-green-500 text-white px-3 py-2 rounded-md"
          onClick={startListening}
        >
          🎤
        </button>
      </div>
    </div>
  );
};

export default ChatPage;
