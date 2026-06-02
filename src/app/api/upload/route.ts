import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const passcode = formData.get("passcode") as string;

    if (passcode !== "20262026") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    if (!file) {
      return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 });
    }

    // Dosya tipini kontrol et
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Sadece JPG, PNG, WebP veya GIF görseller yüklenebilir" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const filename = `product_${Date.now()}.${ext}`;

    // Next.js public/uploads/ dizinine kaydet — /uploads/filename.ext olarak erişilir
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    fs.writeFileSync(path.join(uploadDir, filename), buffer);

    // Hostinger'da public_html/uploads/ klasörüne de kaydet (web sunucusu doğrudan servis eder)
    try {
      const publicHtmlDir = path.join(process.cwd(), "..", "public_html", "uploads");
      if (!fs.existsSync(publicHtmlDir)) {
        fs.mkdirSync(publicHtmlDir, { recursive: true });
      }
      fs.writeFileSync(path.join(publicHtmlDir, filename), buffer);
    } catch {
      // Local geliştirmede public_html yoktur, hata bekleniyor
    }

    return NextResponse.json({
      success: true,
      filename,
      url: `/uploads/${filename}`,
    });
  } catch (error) {
    console.error("Upload API error:", error);
    return NextResponse.json({ error: "Görsel yükleme başarısız" }, { status: 500 });
  }
}
