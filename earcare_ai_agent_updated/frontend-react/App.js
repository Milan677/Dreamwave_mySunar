import React, { useState } from 'react';
import './App.css';

function App() {
  const [question, setQuestion] = useState("");
  const [reply, setReply] = useState("");
  const [diagnosis, setDiagnosis] = useState("");

  const ask = async () => {
    const formData = new URLSearchParams();
    formData.append("text", question);
    const res = await fetch("http://localhost:8000/chat/", {
      method: "POST",
      body: formData
    });
    const data = await res.json();
    setReply(data.response);
  };

  const uploadImage = async (event) => {
    const formData = new FormData();
    formData.append("file", event.target.files[0]);
    const res = await fetch("http://localhost:8000/upload/", {
      method: "POST",
      body: formData
    });
    const data = await res.json();
    setDiagnosis(data.diagnosis);
  };

  return (
    <div className="App">
      <h2>Ask a Question</h2>
      <input type="text" value={question} onChange={e => setQuestion(e.target.value)} />
      <button onClick={ask}>Send</button>
      <p>{reply}</p>

      <h2>Upload Image</h2>
      <input type="file" onChange={uploadImage} />
      <p>{diagnosis}</p>
    </div>
  );
}

export default App;