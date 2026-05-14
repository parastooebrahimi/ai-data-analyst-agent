import { useState } from "react";
import "./App.css";

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [csvData, setCsvData] = useState("");
  const [fileName, setFileName] = useState("");
  const [recordCount, setRecordCount] = useState(0);

  async function askAgent() {
    setLoading(true);
    setAnswer("");

    const response = await fetch("http://localhost:4000/api/agent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
        body: JSON.stringify({ question, csvData }),    });

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

  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
  const file = event.target.files?.[0];

  if (!file) return;

  setFileName(file.name);

  const reader = new FileReader();

  reader.onload = () => {
    const text = reader.result as string;
    setCsvData(text);
    const lines = text.trim().split("\n");
    setRecordCount(lines.length - 1);
  };

  reader.readAsText(file);
}

  return (
    <main className="app">
      <section className="sidebar">
        <h2>Data Agent</h2>
        <p>AI-powered sales analysis</p>

        <div className="stat-card">
          <span>Total Records</span>
          <strong>{recordCount || "-"}</strong>
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
        </div>

<div className="question-card">
  <div className="upload-box">
    <label htmlFor="csv-upload">Upload CSV file</label>

    <input
      id="csv-upload"
      type="file"
      accept=".csv"
      onChange={handleFileUpload}
    />

    {!fileName && (
      <p className="upload-helper">
        Upload a CSV sales dataset to start analysing.
      </p>
    )}

    {fileName && (
      <div className="uploaded-success">
        <span>✅</span>
        <div>
          <strong>{fileName}</strong>
          <p>Dataset uploaded successfully</p>
        </div>
      </div>
    )}
  </div>

  {csvData && (
    <>
      <label>Ask a business question</label>

      <textarea
        value={question}
        onChange={(event) => setQuestion(event.target.value)}
        placeholder="Example: Which region has the highest revenue?"
      />

      <button onClick={askAgent} disabled={loading || !question}>
        {loading ? "Analysing..." : "Ask Agent"}
      </button>
    </>
  )}
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