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

    setAnswer(data.answer || data.error);
    setLoading(false);
  }

  const exampleQuestions = [
    "Which region has the highest revenue?",
    "What is the best selling product?",
    "Give me 3 business insights",
    "What is the total revenue?",
  ];

  return (
    <main className="app">
      <section className="sidebar">
        <h2>Data Agent</h2>
        <p>AI-powered sales analysis</p>

        <div className="stat-card">
          <span>Total Records</span>
          <strong>6</strong>
        </div>

        <div className="stat-card">
          <span>Data Source</span>
          <strong>Sales CSV</strong>
        </div>

        <div className="stat-card">
          <span>Status</span>
          <strong className="online">Online</strong>
        </div>
      </section>

      <section className="dashboard">
        <div className="hero">
          <p className="badge">AI Data Analyst Agent</p>
          <h2>Ask your data. Get instant insights.</h2>
          <p>
            This agent analyses sales data, finds patterns, and explains results
            in simple business language.
          </p>
        </div>

        <div className="question-card">
          <label>Ask a business question</label>

          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Example: Which region has the highest revenue?"
          />

          <button onClick={askAgent} disabled={loading || !question}>
            {loading ? "Analysing..." : "Ask Agent"}
          </button>
        </div>

        <div className="examples">
          {exampleQuestions.map((item) => (
            <button key={item} onClick={() => setQuestion(item)}>
              {item}
            </button>
          ))}
        </div>

        {answer && (
          <div className="answer-card">
            <div className="answer-header">
              <span>🤖</span>
              <div>
                <h2>Agent Answer</h2>
                <p>Generated from sales data analysis</p>
              </div>
            </div>

            <div className="answer-body">{answer}</div>
          </div>
        )}
      </section>
    </main>
  );
}

export default App;