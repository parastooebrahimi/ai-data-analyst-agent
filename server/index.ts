import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

type Sale = {
  product: string;
  region: string;
  units: number;
  price: number;
};

const salesData: Sale[] = [
  { product: "Laptop", region: "QLD", units: 3, price: 1200 },
  { product: "Mouse", region: "QLD", units: 20, price: 40 },
  { product: "Laptop", region: "NSW", units: 2, price: 1200 },
  { product: "Keyboard", region: "VIC", units: 10, price: 90 },
  { product: "Mouse", region: "NSW", units: 15, price: 40 },
  { product: "Laptop", region: "VIC", units: 1, price: 1200 },
];

function analyseSalesData() {
  const totalRevenue = salesData.reduce(
    (sum, item) => sum + item.units * item.price,
    0
  );

  const revenueByProduct: Record<string, number> = {};
  const revenueByRegion: Record<string, number> = {};

  for (const item of salesData) {
    const revenue = item.units * item.price;

    revenueByProduct[item.product] =
      (revenueByProduct[item.product] || 0) + revenue;

    revenueByRegion[item.region] =
      (revenueByRegion[item.region] || 0) + revenue;
  }

  return {
    totalRevenue,
    revenueByProduct,
    revenueByRegion,
  };
}

app.post("/api/agent", async (req, res) => {
  try {
    const { question } = req.body;

    const analysis = analyseSalesData();

const response = await openai.responses.create({
  model: "openrouter/free",
  instructions: `
You are a simple AI data analyst agent.
You explain sales data clearly for a beginner.
Use the provided analysis result.
Give short, business-friendly answers.
`,
  input: `
User question: ${question}

Sales analysis result:
${JSON.stringify(analysis, null, 2)}
`,
});

    res.json({
      answer: response.output_text,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Something went wrong",
    });
  }
});

app.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
});