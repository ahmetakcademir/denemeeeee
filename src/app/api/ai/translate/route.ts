import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { nameTR, descriptionTR, pricetr } = await request.json();

    if (!nameTR) {
      return NextResponse.json({ error: "Product name (TR) is required" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OpenAI API Key is not configured on the server." }, { status: 500 });
    }

    const systemPrompt = `You are the Creative Director and Lead Copywriter for NARD, a world-class ultra-luxury niche fragrance and high-fashion brand (comparable to Creed, Byredo, and Tom Ford Private Blend).
Your task is to translate a product's Turkish name and description into English (EN), German (DE), and French (FR).
The translation must sound exceptionally poetic, sophisticated, and align with a haute-couture luxury brand voice. Do not translate literally; capture the essence and elevate it.
Also, calculate the regional prices in USD ($) and EUR (€) based on the Turkish price (${pricetr || 0} TRY). Use these premium conversions:
- EN (USD): Divide TR price by 35, then round to a premium luxury price step ending in 5, 8, 9, or a clean rounded number (e.g., 85, 95, 125, 160).
- DE/FR (EUR): Divide TR price by 38, then round to a premium luxury price step (e.g., 79, 89, 118, 148).
Provide your response strictly in the following JSON format:
{
  "name": {
    "en": "English Name",
    "de": "German Name",
    "fr": "French Name"
  },
  "description": {
    "en": "English description...",
    "de": "German description...",
    "fr": "French description..."
  },
  "prices": {
    "en": 0,
    "de": 0,
    "fr": 0
  }
}`;

    const userPrompt = `Translate this luxury product:
Turkish Name: ${nameTR}
Turkish Description: ${descriptionTR || "No description provided."}
Turkish Price: ${pricetr || 0} ₺`;

    const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      }),
    });

    if (!openAiResponse.ok) {
      const errorData = await openAiResponse.json();
      console.error("OpenAI API error:", errorData);
      return NextResponse.json({ error: "Failed to communicate with OpenAI" }, { status: 502 });
    }

    const completion = await openAiResponse.json();
    const resultString = completion.choices[0]?.message?.content;
    
    if (!resultString) {
      return NextResponse.json({ error: "No response from AI model" }, { status: 500 });
    }

    const translatedDataset = JSON.parse(resultString);
    return NextResponse.json({ success: true, ...translatedDataset });

  } catch (error) {
    console.error("NARD AI Translate route error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
