type Props = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatMessage({ role, content }: Props) {
  return (
    <div
      className={`p-2 my-1 rounded-md ${
        role === "user" ? "bg-blue-100" : "bg-gray-200"
      }`}
    >
      <strong>{role === "user" ? "Kamu" : "AI"}:</strong> {content}
    </div>
  );
}
