import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "src/data/products.json");

export async function POST(request: Request) {
  try {
    const { answers, locale = "tr" } = await request.json();

    if (!answers || !Array.isArray(answers) || answers.length < 3) {
      return NextResponse.json({ error: "Answers array with 3 elements is required" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OpenAI API Key is not configured on the server." }, { status: 500 });
    }

    // Read products database to match against
    let catalog = [];
    if (fs.existsSync(filePath)) {
      try {
        const fileContent = fs.readFileSync(filePath, "utf-8");
        const data = JSON.parse(fileContent);
        
        // Build a simplified catalog list for GPT context
        catalog.push({
          id: data.perfume.id,
          name: "NARD Spikenard Perfume",
          description: data.perfume.descKey,
          category: "perfume"
        });
        catalog.push({
          id: data.polo.id,
          name: "NARD Heavyweight Polo Sage Green",
          description: data.polo.descKey,
          category: "clothing"
        });
        catalog.push({
          id: data.pack.id,
          name: "NARD Sovereign Pack (Set)",
          description: data.pack.descKey,
          category: "set"
        });

        if (data.customProducts && Array.isArray(data.customProducts)) {
          data.customProducts.forEach((p: any) => {
            const name = typeof p.name === "string" ? p.name : (p.name[locale] || p.name.tr || "");
            const desc = typeof p.description === "string" ? p.description : (p.description[locale] || p.description.tr || "");
            catalog.push({
              id: p.id,
              name,
              description: desc,
              category: p.category
            });
          });
        }
      } catch (err) {
        console.error("NARD AI Synthesis: Failed to load catalog:", err);
      }
    }

    // Map quiz answers to descriptive words
    const frequencies = [
      "Sakin & Doğal / Tranquil & Organic (Earth/Stone)",
      "Gizemli & Derin / Mysterious & Deep (Nocturnal lights)",
      "Enerjik & Çarpıcı / Bold & Radiant (Cyber Gold)"
    ];
    
    const scents = [
      "Forest & stone after rain / Yağmur sonrası orman ve taş",
      "Antique library & warm wood / Antik kütüphane ve ahşap",
      "Incense, amber & metallic breeze / Tütsü, kehribar ve metalik esintiler"
    ];

    const textures = [
      "Organic linen & cotton breeze / Organik keten ve pamuk",
      "Heavy velvet & dark anthracite / Ağır kadife ve antrasit",
      "Soft linen & gold highlights / Yumuşak keten ve altın sarısı"
    ];

    const chosenFreq = frequencies[answers[0] - 1] || "Unknown";
    const chosenScent = scents[answers[1] - 1] || "Unknown";
    const chosenTexture = textures[answers[2] - 1] || "Unknown";

    const systemPrompt = `You are the AI Molecular Scent Alchemist at NARD, an ultra-luxury, high-fashion niche fragrance house.
A customer has just completed our Emotional Scent Synthesizer Quiz with these inputs:
- Frequency: ${chosenFreq}
- Inner Vision: ${chosenScent}
- Tactile Texture: ${chosenTexture}

Analyze their emotional profile, determine their scent aura breakdown (e.g. 60% Earthy Spikenard, 40% Sovereign), and select the absolute BEST matching product or set from our product catalog.

Here is the NARD Catalog to match against:
${JSON.stringify(catalog, null, 2)}

Provide your response strictly in the language specified ("${locale}").
The recipe explanation must sound exceptionally poetic, mystical, and luxurious. Explain why the selected product perfectly suits their quiz profile and aura.
Provide the response strictly in this JSON format:
{
  "breakdown": "e.g., 65% Spikenard Dünyevi, 35% Sovereign Asil",
  "recipeExplanation": "Beautiful, poetic explanation in the requested language...",
  "matchedProductId": "ID of matched product (e.g., nard-perfume-01 or nard-sovereign-pack or custom_xyz)"
}
`;

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
          { role: "user", content: "Synthesize my personal luxury NARD profile." }
        ],
        response_format: { type: "json_object" },
        temperature: 0.75,
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

    const synthesisResult = JSON.parse(resultString);
    return NextResponse.json({ success: true, ...synthesisResult });

  } catch (error) {
    console.error("NARD AI Synthesis route error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
