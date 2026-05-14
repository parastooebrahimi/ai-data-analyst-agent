import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import { parse } from "csv-parse/sync";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

function extractJson(text: string) {
  const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
  return JSON.parse(cleaned);
}

app.post("/api/agent", async (req, res) => {
  try {
    const { question, csvData } = req.body;

    if (!question || !csvData) {
      return res.status(400).json({
        error: "Question and CSV data are required.",
      });
    }

    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const columns = Object.keys(records[0] || {});

    const response = await openai.responses.create({
      model: "openrouter/free",
      instructions: `
You are an AI data analyst agent similar to Power BI Copilot.

The user uploads CSV data and asks for analysis.

You must return ONLY valid JSON. No markdown. No explanation outside JSON.

JSON format:
{
  "answer": "short business explanation",
  "kpis": [
    { "label": "Total Revenue", "value": "$12000" },
    { "label": "Top Region", "value": "QLD" }
  ],
  "chart": {
    "title": "Revenue by Region",
    "type": "bar",
    "xKey": "name",
    "yKey": "value",
    "data": [
      { "name": "QLD", "value": 1000 },
      { "name": "NSW", "value": 800 }
    ]
  }
}

Rules:
- chart.type must be one of: "bar", "line", "pie"
- kpis should have 2 to 4 items
- chart.data values must be numbers
- Use the uploaded CSV records only
- If the user asks for trend over time, use line chart
- If the user asks for comparison, use bar chart
- If the user asks for share/percentage, use pie chart
`,
      input: `
User question:
${question}

CSV columns:
${JSON.stringify(columns)}

CSV records:
${JSON.stringify(records)}
`,
    });

    const result = extractJson(response.output_text);

    res.json(result);
  } catch (error: any) {
    console.error("SERVER ERROR:", error);

    res.status(500).json({
      error: error.message || "Something went wrong",
    });
  }
});

app.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
});