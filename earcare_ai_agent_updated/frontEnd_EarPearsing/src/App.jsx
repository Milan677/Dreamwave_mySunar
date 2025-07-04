import React, { useState } from "react";
import QuestionForm from "./components/QuestionForm";
import ImageUploader from "./components/ImageUploader";
import AnswerBox from "./components/AnswerBox";

const App = () => {
  const [response, setResponse] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#2f2f9f] via-[#8050e4] to-[#d17ff7] flex items-center justify-center px-4 py-10 font-sans">
      <div className="w-full max-w-3xl bg-white bg-opacity-20 backdrop-blur-md rounded-2xl p-8 shadow-lg space-y-8 border border-white border-opacity-30">
        <h1 className="text-3xl font-extrabold text-green-400 text-center drop-shadow-lg">
          👂 AI Ear Analysis & Intelligent Q&A
        </h1>

        <div className="space-y-6">
          <QuestionForm onAnswer={setResponse} />
          <ImageUploader onAnalysis={setResponse} />
          <AnswerBox response={response} />
        </div>

        <p className="text-xs text-center text-white opacity-70 mt-4">
          Powered by FastAPI · Gemini Vision · BLIP · GPT · React
        </p>
      </div>
    </div>
  );
};

export default App;
