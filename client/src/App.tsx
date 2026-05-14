import { useState } from "react";
import "./App.css";

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  async function askAgent() {
    setLoading(true);
    setAnswer("");

    const response = await fetch("http://localhost:4000/api/agent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    });

    const data = await response.json();

    setAnswer(data.answer);
    setLoading(false);
  }

  return (
    <main className="app">
      <section className="card">
        <h1>AI Data Analyst Agent</h1>

        <p>
          Ask a question about the sales data. The AI agent will analyse it and
          explain the answer.
        </p>

        <input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Example: Which region has the highest revenue?"
        />

        <button onClick={askAgent} disabled={loading || !question}>
          {loading ? "Thinking..." : "Ask Agent"}
        </button>

        {answer && (
          <div className="answer">
            <h2>Agent Answer</h2>
            <p>{answer}</p>
          </div>
        )}
      </section>
    </main>
  );
}

export default App;