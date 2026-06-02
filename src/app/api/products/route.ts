import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "src/data/products.json");

export async function GET() {
  try {
    // Read the products data from local JSON storage
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Seed data not found" }, { status: 404 });
    }
    const fileData = fs.readFileSync(filePath, "utf-8");
    return NextResponse.json(JSON.parse(fileData));
  } catch (error) {
    console.error("NARD API: GET products failed:", error);
    return NextResponse.json({ error: "Failed to read products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { passcode, products } = body;

    // Secure passcode check (Options A+ Security Gate)
    if (passcode !== "20262026") {
      return NextResponse.json({ error: "Unauthorized passcode entry" }, { status: 401 });
    }

    if (!products) {
      return NextResponse.json({ error: "Invalid payload: products is required" }, { status: 400 });
    }

    // Write updated product dataset back to local server file system
    fs.writeFileSync(filePath, JSON.stringify(products, null, 2), "utf-8");
    
    console.log("NARD API: Products updated successfully by Administrator.");
    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error("NARD API: POST products failed:", error);
    return NextResponse.json({ error: "Failed to save products" }, { status: 500 });
  }
}
