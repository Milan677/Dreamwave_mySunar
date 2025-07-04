import React, { useState } from "react";

const QuestionForm = ({ onAnswer }) => {
  const [query, setQuery] = useState("");

  const handleAsk = async () => {
    console.log('Q & A button clicked')
    const res = await fetch("http://localhost:8000/ask/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    const data = await res.json();
    onAnswer(data.answer || data.result || "No answer found.");
  };

  return (
    <div className="space-y-2">
      <input
        type="text"
        className="w-full border rounded p-2"
        placeholder="Ask a question..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={handleAsk}
      >
        Ask
      </button>
    </div>
  );
};

export default QuestionForm;
