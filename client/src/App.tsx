import { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./App.css";

type Kpi = {
  label: string;
  value: string;
};

type ChartResult = {
  title: string;
  type: "bar" | "line" | "pie";
  xKey: string;
  yKey: string;
  data: Record<string, string | number>[];
};

type AgentResult = {
  answer: string;
  kpis: Kpi[];
  chart: ChartResult;
};

function App() {
  const [question, setQuestion] = useState("");
  const [csvData, setCsvData] = useState("");
  const [fileName, setFileName] = useState("");
  const [recordCount, setRecordCount] = useState(0);
  const [result, setResult] = useState<AgentResult | null>(null);
  const [loading, setLoading] = useState(false);

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

  async function askAgent() {
    setLoading(true);
    setResult(null);

    const response = await fetch("http://localhost:4000/api/agent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question, csvData }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error);
      setLoading(false);
      return;
    }

    setResult(data);
    setLoading(false);
  }

  function renderChart(chart: ChartResult) {
    if (chart.type === "line") {
      return (
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chart.data}>
            <XAxis dataKey={chart.xKey} />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey={chart.yKey} strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    if (chart.type === "pie") {
      return (
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={chart.data}
              dataKey={chart.yKey}
              nameKey={chart.xKey}
              outerRadius={110}
              label
            >
              {chart.data.map((_, index) => (
                <Cell key={index} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chart.data}>
          <XAxis dataKey={chart.xKey} />
          <YAxis />
          <Tooltip />
          <Bar dataKey={chart.yKey} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  const exampleQuestions = [
    "Show revenue by region as a bar chart",
    "Show sales trend by date",
    "Show product share as a pie chart",
    "Give me KPI cards and top business insights",
  ];

  return (
    <main className="app">
      <section className="sidebar">
        <h2>Data Agent</h2>
        <p>AI-powered analytics</p>

        <div className="stat-card">
          <span>Total Records</span>
          <strong>{recordCount || "-"}</strong>
        </div>

        <div className="stat-card">
          <span>Data Source</span>
          <strong>{fileName || "No file"}</strong>
        </div>

        <div className="stat-card">
          <span>Status</span>
          <strong className="online">Online</strong>
        </div>
      </section>

      <section className="dashboard">
        <div className="hero">
          <p className="badge">AI Data Analyst Agent</p>
          <h2>Ask your data. Generate insights and visuals.</h2>
          <p>
            Upload a CSV file and ask for KPI cards, charts, trends, and
            business insights.
          </p>
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
              <label>Ask your data</label>

              <textarea
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Example: Show revenue by region as a bar chart"
              />

              <button onClick={askAgent} disabled={loading || !question}>
                {loading ? "Generating dashboard..." : "Generate Analysis"}
              </button>
            </>
          )}
        </div>

        {csvData && (
          <div className="examples">
            {exampleQuestions.map((item) => (
              <button key={item} onClick={() => setQuestion(item)}>
                {item}
              </button>
            ))}
          </div>
        )}

        {result && (
          <>
            <div className="kpi-grid">
              {result.kpis.map((kpi) => (
                <div className="kpi-card" key={kpi.label}>
                  <span>{kpi.label}</span>
                  <strong>{kpi.value}</strong>
                </div>
              ))}
            </div>

            <div className="answer-card">
              <div className="answer-header">
                <span>🤖</span>
                <div>
                  <h2>AI Insight</h2>
                  <p>Generated from uploaded CSV</p>
                </div>
              </div>

              <div className="answer-body">{result.answer}</div>
            </div>

            <div className="chart-card">
              <h2>{result.chart.title}</h2>
              {renderChart(result.chart)}
            </div>
          </>
        )}
      </section>
    </main>
  );
}

export default App;