import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const data = await req.json();
    const { zones, incidents } = data;

    const prompt = `You are an expert Venue Operations AI Assistant for the FIFA World Cup. 
Analyze the real-time crowd data and provide 3 immediate actionable recommendations to optimize stadium operations.
You must predict crowd density in different areas, identify potential congestion points, and suggest proactive measures to redirect foot traffic or manage entry/exit points to ensure a safe and smooth experience for all attendees.

Current Zones Data:
${JSON.stringify(zones, null, 2)}

Current Active Incidents:
${JSON.stringify(incidents, null, 2)}

Respond strictly in JSON format with a "recommendations" array containing objects with:
- "title": A short title for the action
- "description": Detailed explanation of the prediction and proactive measure
- "priority": "high", "medium", or "low"
- "zone": The ID or name of the affected zone`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text || "{}";
    const parsed = JSON.parse(text);
    return NextResponse.json({ insights: parsed.recommendations || [] });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 });
  }
}
