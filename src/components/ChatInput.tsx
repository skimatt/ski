"use client";
import { useState } from "react";

type Props = {
  onSend: (message: string) => void;
};

export default function ChatInput({ onSend }: Props) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSend(input.trim());
    setInput("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
      <input
        className="flex-1 p-2 border rounded"
        placeholder="Ketik sesuatu..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        type="submit"
      >
        Kirim
      </button>
    </form>
  );
}
