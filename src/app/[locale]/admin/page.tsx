"use client";

import { useState, useEffect, useRef } from "react";
import { useStore, DBProductDataset, CustomProduct } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";
import FluidSimulation from "@/components/canvas/FluidSimulation";

// Boş yeni ürün şablonu
const emptyProduct = {
  nameTR: "", nameEN: "", nameDE: "", nameFR: "",
  descriptionTR: "", descriptionEN: "", descriptionDE: "", descriptionFR: "",
  category: "diger" as CustomProduct["category"],
  pricetr: 0,
  priceen: 0,
  pricede: 0,
  pricefr: 0,
  specs: ["", ""],
};

export default function AdminDashboard() {
  const dbProducts = useStore((s) => s.dbProducts);
  const setDbProducts = useStore((s) => s.setDbProducts);

  // Auth
  const [passcode, setPasscode] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [shakeError, setShakeError] = useState(false);

  // Fiyat & spec durumları
  const [perfumePrices, setPerfumePrices] = useState({ tr: 1250, en: 85, de: 79, fr: 79 });
  const [poloPrices, setPoloPrices] = useState({ tr: 1450, en: 95, de: 89, fr: 89 });
  const [packPrices, setPackPrices] = useState({ tr: 2400, en: 160, de: 148, fr: 148 });
  const [perfumeSpecs, setPerfumeSpecs] = useState<string[]>([
    "Üst Nota: Himalayalar Rüzgarı, Adaçayı, Bergamot",
    "Kalp Nota: Saf Spikenard Yağı, Kuru Gül, Mermer Tozu",
    "Alt Nota: Sıcak Kehribar, Sandal Ağacı, Kadifemsi Misk",
  ]);
  const [poloSpecs, setPoloSpecs] = useState<string[]>([
    "Ağırlık: 280 GSM Heavyweight",
    "Örgü: Teknik Keten & Organik Pamuk",
    "Renk: Sage Green / Antrasit",
  ]);

  // Custom ürünler
  const [customProducts, setCustomProducts] = useState<CustomProduct[]>([]);
  const [adminWhatsappNumber, setAdminWhatsappNumber] = useState("905336113880");

  // Yeni ürün formu
  const [newProduct, setNewProduct] = useState(emptyProduct);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [aiTranslating, setAiTranslating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [creatorLang, setCreatorLang] = useState<"tr" | "en" | "de" | "fr">("tr");
  const addToast = useStore((s) => s.addToast);

  // Kaydetme
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Aktif sekme
  const [activeTab, setActiveTab] = useState<"parfum" | "polo" | "set" | "yeniurun" | "urunlerim">("parfum");

  // Sunucu metrikleri
  const [ping, setPing] = useState(8);

  // Veriyi yükle
  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) {
          setDbProducts(data);
          setPerfumePrices(data.perfume.basePrice);
          setPoloPrices(data.polo.basePrice);
          setPackPrices(data.pack.basePrice);
          if (data.perfume.specs) setPerfumeSpecs(data.perfume.specs.tr);
          if (data.polo.specs) setPoloSpecs(data.polo.specs.tr);
          if (data.customProducts) setCustomProducts(data.customProducts);
          if (data.whatsappNumber) setAdminWhatsappNumber(data.whatsappNumber);
        }
      })
      .catch(() => {});
  }, [setDbProducts]);

  useEffect(() => {
    if (!isAuthorized) return;
    const t = setInterval(() => setPing(Math.floor(Math.random() * 6) + 4), 2000);
    return () => clearInterval(t);
  }, [isAuthorized]);

  // Ses efekti
  const chime = (freq = 600, dur = 0.08) => {
    try {
      const C = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new C();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(freq, ctx.currentTime);
      g.gain.setValueAtTime(0.04, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
      o.connect(g); g.connect(ctx.destination);
      o.start(); o.stop(ctx.currentTime + dur);
    } catch {}
  };

  // Auth handlers
  const handleKey = (c: string) => { chime(750, 0.05); setErrorMsg(""); setPasscode((p) => (p + c).substring(0, 10)); };
  const handleClear = () => { chime(400, 0.1); setPasscode(""); setErrorMsg(""); };
  const handleLogin = () => {
    const cleanPass = passcode.trim().toUpperCase();
    if (cleanPass === "NARD2026" || cleanPass === "20262026") {
      chime(1100, 0.35);
      setIsAuthorized(true);
    } else {
      chime(250, 0.3);
      setShakeError(true);
      setErrorMsg("Yanlış şifre — tekrar deneyin");
      setPasscode("");
      setTimeout(() => setShakeError(false), 600);
    }
  };

  // Keyboard support for passcode lockscreen
  useEffect(() => {
    if (isAuthorized) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleLogin();
      } else if (e.key === "Backspace") {
        e.preventDefault();
        setPasscode((p) => p.slice(0, -1));
        chime(400, 0.05);
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        setPasscode((p) => (p + e.key).substring(0, 10));
        chime(750, 0.05);
        setErrorMsg("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAuthorized, passcode]);

  // Görsel seç
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  // Ürün ekle ve kaydet
  const handleAddProduct = async () => {
    if (!newProduct.nameTR.trim()) { 
      addToast("Lütfen ürün adını (Türkçe) girin.", "error"); 
      return; 
    }
    if (newProduct.pricetr <= 0) { 
      addToast("Lütfen geçerli bir TR fiyatı girin.", "error"); 
      return; 
    }

    setIsAddingProduct(true);
    let imageUrl = "/no-image.png";

    // Görsel yükle
    if (imageFile) {
      try {
        const fd = new FormData();
        fd.append("file", imageFile);
        fd.append("passcode", "20262026");
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (data.url) imageUrl = data.url;
      } catch {}
    }

    // Fiyatları kopyala (eksik olanları TR'den doldur)
    const basePrice = {
      tr: newProduct.pricetr,
      en: newProduct.priceen || Math.round(newProduct.pricetr / 35),
      de: newProduct.pricede || Math.round(newProduct.pricetr / 38),
      fr: newProduct.pricefr || Math.round(newProduct.pricetr / 38),
    };

    const product: CustomProduct = {
      id: `custom_${Date.now()}`,
      name: {
        tr: newProduct.nameTR.trim(),
        en: newProduct.nameEN.trim() || newProduct.nameTR.trim(),
        de: newProduct.nameDE.trim() || newProduct.nameTR.trim(),
        fr: newProduct.nameFR.trim() || newProduct.nameTR.trim(),
      },
      description: {
        tr: newProduct.descriptionTR.trim(),
        en: newProduct.descriptionEN.trim() || newProduct.descriptionTR.trim(),
        de: newProduct.descriptionDE.trim() || newProduct.descriptionTR.trim(),
        fr: newProduct.descriptionFR.trim() || newProduct.descriptionTR.trim(),
      },
      image: imageUrl,
      basePrice,
      category: newProduct.category,
      specs: newProduct.specs.filter((s) => s.trim() !== ""),
      createdAt: new Date().toISOString(),
    };

    const updatedCustomProducts = [...customProducts, product];
    setCustomProducts(updatedCustomProducts);

    // Direkt kaydet
    await saveAll(updatedCustomProducts);
    setIsAddingProduct(false);
    setNewProduct(emptyProduct);
    setImageFile(null);
    setImagePreview("");
    setActiveTab("urunlerim");
    chime(1200, 0.4);
    addToast("Ürün başarıyla eklendi ve yayınlandı!", "success");
  };

  // AI Çeviri ve Fiyatlandırma
  const handleAITranslate = async () => {
    if (!newProduct.nameTR.trim()) {
      addToast("Lütfen önce Türkçe Ürün Adı girin.", "error");
      return;
    }
    if (newProduct.pricetr <= 0) {
      addToast("Lütfen önce geçerli bir TR Fiyatı (₺) girin.", "error");
      return;
    }

    setAiTranslating(true);
    chime(900, 0.1);
    try {
      const res = await fetch("/api/ai/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nameTR: newProduct.nameTR,
          descriptionTR: newProduct.descriptionTR,
          pricetr: newProduct.pricetr,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNewProduct((prev) => ({
          ...prev,
          nameEN: data.name.en || prev.nameEN,
          nameDE: data.name.de || prev.nameDE,
          nameFR: data.name.fr || prev.nameFR,
          descriptionEN: data.description.en || prev.descriptionEN,
          descriptionDE: data.description.de || prev.descriptionDE,
          descriptionFR: data.description.fr || prev.descriptionFR,
          priceen: data.prices.en || prev.priceen,
          pricede: data.prices.de || prev.pricede,
          pricefr: data.prices.fr || prev.pricefr,
        }));
        chime(1200, 0.3);
        addToast("AI Çeviri ve Fiyatlandırma Başarılı!", "success");
      } else {
        addToast("AI Çeviri hatası: " + data.error, "error");
      }
    } catch {
      addToast("AI Çeviri sunucusuna bağlanılamadı.", "error");
    } finally {
      setAiTranslating(false);
    }
  };

  // Ürün sil
  const handleDeleteProduct = async (id: string) => {
    const updated = customProducts.filter((p) => p.id !== id);
    setCustomProducts(updated);
    await saveAll(updated);
    chime(400, 0.12);
  };

  // Tümünü kaydet (fiyatlar + customProducts)
  const saveAll = async (cp: CustomProduct[] = customProducts) => {
    setIsSaving(true);
    setSaveError("");
    setSaveSuccess(false);
    chime(950, 0.15);

    const payload: DBProductDataset = {
      perfume: {
        id: "nard-perfume-01",
        nameKey: "Products.perfumeTitle",
        descKey: "Products.perfumeDesc",
        basePrice: perfumePrices,
        specs: {
          tr: perfumeSpecs,
          en: ["Top Notes: Himalayan Breeze, Clary Sage, Bergamot", "Heart Notes: Pure Spikenard Oil, Dry Rose, Marble Dust", "Base Notes: Warm Amber, Sandalwood, Velvety Musk"],
          de: ["Kopfnote: Himalaja-Wind, Muskatsalbei, Bergamotte", "Herznote: Reines Spiknardenöl, Trockene Rose, Marmorstaub", "Basisnote: Warmer Bernstein, Sandelholz, Samtiger Moschus"],
          fr: ["Note de Tête: Brise de l'Himalaya, Sauge Sclarée, Bergamote", "Note de Cœur: Huile de Nard Pure, Rose Sèche, Poussière de Marbre", "Note de Fond: Ambre Chaud, Bois de Santal, Musc Velouté"],
        },
      },
      polo: {
        id: "nard-polo-01",
        nameKey: "Products.poloTitle",
        descKey: "Products.poloDesc",
        basePrice: poloPrices,
        specs: {
          tr: poloSpecs,
          en: ["Weight: 280 GSM Heavyweight", "Knit: Technical Linen & Organic Cotton", "Color: Sage Green / Anthracite"],
          de: ["Gewicht: 280 GSM Heavyweight", "Strick: Technisches Leinen & Bio-Baumwolle", "Farbe: Salbeigrün / Anthrazit"],
          fr: ["Poids: 280 GSM Heavyweight", "Tricot: Lin Technique & Coton Biologique", "Couleur: Vert Sauge / Anthracite"],
        },
      },
      pack: { id: "nard-sovereign-pack", nameKey: "Quiz.matchPack", descKey: "Quiz.packDesc", basePrice: packPrices },
      customProducts: cp,
      whatsappNumber: adminWhatsappNumber,
    };

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode: "20262026", products: payload }),
      });
      const data = await res.json();
      setIsSaving(false);
      if (data.success) {
        setDbProducts(payload);
        setSaveSuccess(true);
        chime(1300, 0.4);
        setTimeout(() => setSaveSuccess(false), 5000);
      } else {
        setSaveError("Kaydetme başarısız: " + data.error);
      }
    } catch {
      setIsSaving(false);
      setSaveError("Sunucu bağlantı hatası.");
    }
  };

  // Kategori Türkçe etiketi
  const catLabel = (c: string) => ({ parfum: "🌿 Parfüm", giyim: "👕 Giyim", aksesuar: "💎 Aksesuar", diger: "📦 Diğer" }[c] || c);

  // ─── GİRİŞ EKRANI ────────────────────────────────────────────────────────
  if (!isAuthorized) {
    return (
      <main className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden">
        <FluidSimulation />
        <div className="fixed inset-0 -z-40 bg-radial-vignette pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="relative z-10 w-full max-w-xs px-4">
          <div className="text-center mb-8">
            <p className="text-[10px] font-mono text-[#C29F68] tracking-[0.35em] uppercase mb-2">NARD Yönetici Paneli</p>
            <h1 className="text-4xl font-light text-[#ECE8E1] tracking-widest font-serif font-bold">FOUNDER'S DECK</h1>
            <p className="text-[11px] text-[#ECE8E1]/40 mt-3 font-sans">Giriş şifrenizi girin</p>
          </div>
          <motion.div animate={shakeError ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}} transition={{ duration: 0.5 }} className="mb-5">
            <div className={`w-full h-14 border flex items-center justify-center gap-2 mb-2 transition-all duration-300 ${errorMsg ? "border-red-500/50 bg-red-950/30" : "border-white/10 bg-black/40"}`}>
              {Array.from({ length: Math.max(8, passcode.length) }).map((_, i) => (
                <span key={i} className={`w-2 h-2 rounded-full transition-all duration-200 ${i < passcode.length ? "bg-[#C29F68] scale-110" : "bg-white/15"}`} />
              ))}
            </div>
            {errorMsg && <p className="text-center text-[11px] text-red-400 font-sans">{errorMsg}</p>}
            <p className="text-center text-[9px] font-mono text-[#ECE8E1]/35 mt-3 leading-relaxed">
              ⌨ Fiziksel klavyenizden şifreyi doğrudan yazıp <b className="text-[#C29F68]">Enter</b>'a basabilirsiniz.
            </p>
          </motion.div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {["1","2","3","4","5","6","7","8","9"].map((n) => (
              <button key={n} onClick={() => handleKey(n)} className="h-14 bg-white/5 border border-white/8 hover:bg-white/12 hover:border-[#C29F68]/30 active:scale-95 transition-all text-lg font-light text-[#ECE8E1] select-none">{n}</button>
            ))}
            <button onClick={handleClear} className="h-14 bg-red-500/8 border border-red-500/20 hover:bg-red-500/18 active:scale-95 transition-all text-[11px] font-mono text-red-400 uppercase tracking-wider select-none">Sil</button>
            <button onClick={() => handleKey("0")} className="h-14 bg-white/5 border border-white/8 hover:bg-white/12 hover:border-[#C29F68]/30 active:scale-95 transition-all text-lg font-light text-[#ECE8E1] select-none">0</button>
            <button onClick={handleLogin} className="h-14 bg-[#C29F68]/15 border border-[#C29F68]/40 hover:bg-[#C29F68]/25 active:scale-95 transition-all text-[11px] font-mono text-[#C29F68] uppercase tracking-wider select-none">Giriş</button>
          </div>
          <p className="text-center text-[9px] font-mono text-[#ECE8E1]/20 mt-4 tracking-widest">NARD © 2026 — YÖNETİCİ ERİŞİMİ</p>
        </motion.div>
      </main>
    );
  }

  // ─── YÖNETİCİ PANELİ ─────────────────────────────────────────────────────
  return (
    <main className="relative min-h-screen w-full overflow-x-hidden">
      <FluidSimulation />
      <div className="fixed inset-0 -z-40 bg-radial-vignette pointer-events-none" />

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10 w-full max-w-5xl mx-auto px-4 py-8">

        {/* Üst Bar */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/8">
          <div>
            <p className="text-[10px] font-mono text-[#C29F68] tracking-[0.3em] uppercase mb-1">NARD Yönetici Paneli</p>
            <h2 className="text-2xl md:text-3xl font-light text-[#ECE8E1] tracking-wide font-serif">Founder's Deck</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-green-500/8 border border-green-500/20 text-[10px] font-mono text-green-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Çevrimiçi · {ping}ms
            </div>
            <button onClick={() => { setIsAuthorized(false); setPasscode(""); }} className="px-4 py-2 bg-red-500/8 hover:bg-red-500/18 border border-red-500/25 text-red-400 text-[10px] font-mono tracking-widest uppercase transition-all">
              Çıkış
            </button>
          </div>
        </div>

        {/* Bildirimler */}
        <AnimatePresence>
          {saveSuccess && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mb-6 p-4 bg-green-500/10 border border-green-500/25 flex items-center gap-3">
              <span className="text-green-400 text-lg">✓</span>
              <div>
                <p className="text-[12px] font-semibold text-green-400">Değişiklikler kaydedildi!</p>
                <p className="text-[11px] text-green-400/70 mt-0.5">Tüm ziyaretçiler yeni içerikleri görüyor.</p>
              </div>
            </motion.div>
          )}
          {saveError && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mb-6 p-4 bg-red-500/10 border border-red-500/25">
              <p className="text-[12px] text-red-400">{saveError}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ana Izgara */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Sol: Sekmeler */}
          <div className="lg:col-span-2 flex flex-col gap-5">

            {/* Sekme Menüsü */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-1 p-1 bg-white/3 border border-white/8">
              {[
                { key: "parfum", label: "🌿 Parfüm" },
                { key: "polo", label: "👕 Polo" },
                { key: "set", label: "📦 Set" },
                { key: "yeniurun", label: "➕ Yeni Ürün" },
                { key: "urunlerim", label: `🗂 Ürünlerim${customProducts.length > 0 ? ` (${customProducts.length})` : ""}` },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={`py-2.5 px-2 text-[10px] font-mono tracking-wide uppercase transition-all text-center ${activeTab === key ? "bg-[#C29F68]/15 border border-[#C29F68]/30 text-[#C29F68]" : "text-[#ECE8E1]/40 hover:text-[#ECE8E1]/70"}`}
                >
                  {label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">

              {/* ── PARFÜM SEKMESİ ── */}
              {activeTab === "parfum" && (
                <motion.div key="parfum" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-5">
                  <div className="glass-panel p-6 border border-white/8">
                    <h3 className="text-[11px] font-mono text-[#C29F68] tracking-widest uppercase mb-4">💰 Bölgesel Fiyatlar</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[{ label: "🇹🇷 Türkiye", key: "tr", sym: "₺" }, { label: "🌍 Global", key: "en", sym: "$" }, { label: "🇩🇪 Almanya", key: "de", sym: "€" }, { label: "🇫🇷 Fransa", key: "fr", sym: "€" }].map(({ label, key, sym }) => (
                        <div key={key}>
                          <label className="text-[10px] text-[#ECE8E1]/50 font-sans block mb-1.5">{label}</label>
                          <div className="flex items-center border border-white/10 bg-black/30 focus-within:border-[#C29F68]/50 transition-colors">
                            <span className="px-2.5 text-[#C29F68] text-sm font-mono border-r border-white/10">{sym}</span>
                            <input type="number" value={(perfumePrices as any)[key]} onChange={(e) => setPerfumePrices({ ...perfumePrices, [key]: Number(e.target.value) })} className="flex-1 bg-transparent p-2 text-sm font-mono text-[#ECE8E1] focus:outline-none w-full" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="glass-panel p-6 border border-white/8">
                    <h3 className="text-[11px] font-mono text-[#C29F68] tracking-widest uppercase mb-1">🧬 Koku Notaları</h3>
                    <p className="text-[10px] text-[#ECE8E1]/35 font-sans mb-4">Türkçe — diğer dillere otomatik yansır</p>
                    <div className="flex flex-col gap-3">
                      {perfumeSpecs.map((spec, i) => {
                        const labels = ["Üst Nota", "Kalp Nota", "Alt Nota"];
                        return (
                          <div key={i}>
                            <label className="text-[10px] text-[#ECE8E1]/50 font-sans block mb-1.5">{labels[i]}</label>
                            <input type="text" value={spec.includes(":") ? spec.split(":").slice(1).join(":").trim() : spec}
                              onChange={(e) => { const u = [...perfumeSpecs]; const pref = spec.includes(":") ? spec.split(":")[0] + ": " : ""; u[i] = pref + e.target.value; setPerfumeSpecs(u); }}
                              className="w-full bg-black/30 border border-white/10 focus:border-[#C29F68]/50 p-2.5 text-sm text-[#ECE8E1] focus:outline-none font-sans transition-colors" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── POLO SEKMESİ ── */}
              {activeTab === "polo" && (
                <motion.div key="polo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-5">
                  <div className="glass-panel p-6 border border-white/8">
                    <h3 className="text-[11px] font-mono text-[#5E6D62] tracking-widest uppercase mb-4">💰 Bölgesel Fiyatlar</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[{ label: "🇹🇷 Türkiye", key: "tr", sym: "₺" }, { label: "🌍 Global", key: "en", sym: "$" }, { label: "🇩🇪 Almanya", key: "de", sym: "€" }, { label: "🇫🇷 Fransa", key: "fr", sym: "€" }].map(({ label, key, sym }) => (
                        <div key={key}>
                          <label className="text-[10px] text-[#ECE8E1]/50 font-sans block mb-1.5">{label}</label>
                          <div className="flex items-center border border-white/10 bg-black/30 focus-within:border-[#5E6D62]/50 transition-colors">
                            <span className="px-2.5 text-[#5E6D62] text-sm font-mono border-r border-white/10">{sym}</span>
                            <input type="number" value={(poloPrices as any)[key]} onChange={(e) => setPoloPrices({ ...poloPrices, [key]: Number(e.target.value) })} className="flex-1 bg-transparent p-2 text-sm font-mono text-[#ECE8E1] focus:outline-none w-full" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="glass-panel p-6 border border-white/8">
                    <h3 className="text-[11px] font-mono text-[#5E6D62] tracking-widest uppercase mb-1">🧵 Kumaş Özellikleri</h3>
                    <p className="text-[10px] text-[#ECE8E1]/35 font-sans mb-4">Türkçe — diğer dillere otomatik yansır</p>
                    <div className="flex flex-col gap-3">
                      {poloSpecs.map((spec, i) => {
                        const labels = ["Ağırlık", "Örgü / Materyal", "Renk"];
                        return (
                          <div key={i}>
                            <label className="text-[10px] text-[#ECE8E1]/50 font-sans block mb-1.5">{labels[i]}</label>
                            <input type="text" value={spec.includes(":") ? spec.split(":").slice(1).join(":").trim() : spec}
                              onChange={(e) => { const u = [...poloSpecs]; const pref = spec.includes(":") ? spec.split(":")[0] + ": " : ""; u[i] = pref + e.target.value; setPoloSpecs(u); }}
                              className="w-full bg-black/30 border border-white/10 focus:border-[#5E6D62]/50 p-2.5 text-sm text-[#ECE8E1] focus:outline-none font-sans transition-colors" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── SET SEKMESİ ── */}
              {activeTab === "set" && (
                <motion.div key="set" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="glass-panel p-6 border border-white/8">
                    <h3 className="text-[11px] font-mono text-[#C29F68] tracking-widest uppercase mb-1">💰 Sovereign Set — İndirimli Fiyat</h3>
                    <p className="text-[10px] text-[#ECE8E1]/35 font-sans mb-4">Parfüm + Polo birlikte satın alınca uygulanan fiyat</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[{ label: "🇹🇷 Türkiye", key: "tr", sym: "₺" }, { label: "🌍 Global", key: "en", sym: "$" }, { label: "🇩🇪 Almanya", key: "de", sym: "€" }, { label: "🇫🇷 Fransa", key: "fr", sym: "€" }].map(({ label, key, sym }) => (
                        <div key={key}>
                          <label className="text-[10px] text-[#ECE8E1]/50 font-sans block mb-1.5">{label}</label>
                          <div className="flex items-center border border-white/10 bg-black/30 focus-within:border-[#C29F68]/50 transition-colors">
                            <span className="px-2.5 text-[#C29F68] text-sm font-mono border-r border-white/10">{sym}</span>
                            <input type="number" value={(packPrices as any)[key]} onChange={(e) => setPackPrices({ ...packPrices, [key]: Number(e.target.value) })} className="flex-1 bg-transparent p-2 text-sm font-mono text-[#ECE8E1] focus:outline-none w-full" />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-5 pt-4 border-t border-white/8 grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[{ l: "TR", s: perfumePrices.tr + poloPrices.tr, p: packPrices.tr, sym: "₺" }, { l: "EN", s: perfumePrices.en + poloPrices.en, p: packPrices.en, sym: "$" }, { l: "DE", s: perfumePrices.de + poloPrices.de, p: packPrices.de, sym: "€" }, { l: "FR", s: perfumePrices.fr + poloPrices.fr, p: packPrices.fr, sym: "€" }].map(({ l, s, p, sym }) => (
                        <div key={l} className="p-3 bg-green-500/5 border border-green-500/15 text-center">
                          <p className="text-[9px] text-[#ECE8E1]/40 font-mono mb-1">{l} Tasarrufu</p>
                          <p className="text-sm font-mono text-green-400 font-bold">{sym}{Math.max(0, s - p)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── YENİ ÜRÜN SEKMESİ ── */}
              {activeTab === "yeniurun" && (
                <motion.div key="yeniurun" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-5">
                  <div className="glass-panel p-6 border border-white/8 flex flex-col gap-5">
                    <div className="flex items-center justify-between border-b border-white/8 pb-3">
                      <h3 className="text-[11px] font-mono text-[#C29F68] tracking-widest uppercase">➕ Yeni Ürün Ekle</h3>
                      <span className="text-[9px] font-mono text-[#ECE8E1]/30">Ürün sayfaya anında eklenir</span>
                    </div>

                    {/* Görsel Yükleme */}
                    <div>
                      <label className="text-[11px] text-[#ECE8E1]/60 font-sans block mb-2">Ürün Görseli</label>
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative w-full h-48 border-2 border-dashed transition-all cursor-pointer flex items-center justify-center overflow-hidden group ${imagePreview ? "border-[#C29F68]/40" : "border-white/15 hover:border-[#C29F68]/30"}`}
                      >
                        {imagePreview ? (
                          <>
                            <img src={imagePreview} alt="Önizleme" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="text-[11px] font-mono text-white tracking-wider">Görseli Değiştir</span>
                            </div>
                          </>
                        ) : (
                          <div className="text-center">
                            <div className="text-3xl mb-2">📸</div>
                            <p className="text-[11px] text-[#ECE8E1]/50 font-sans">Görsel seçmek için tıklayın</p>
                            <p className="text-[9px] text-[#ECE8E1]/30 font-mono mt-1">JPG · PNG · WebP · GIF</p>
                          </div>
                        )}
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                      </div>
                      {imageFile && (
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-[10px] text-[#ECE8E1]/40 font-sans truncate">{imageFile.name}</p>
                          <button onClick={() => { setImageFile(null); setImagePreview(""); }} className="text-[10px] text-red-400 font-mono hover:text-red-300 ml-2 shrink-0">Kaldır</button>
                        </div>
                      )}
                    </div>

                    {/* Dil Sekmesi Seçici */}
                    <div>
                      <label className="text-[11px] text-[#ECE8E1]/60 font-sans block mb-2">Dil Girişleri</label>
                      <div className="flex border border-white/10 bg-black/40 p-1 mb-2 gap-1 rounded-none">
                        {[{ v: "tr", l: "🇹🇷 TR (Temel)" }, { v: "en", l: "🇬🇧 EN" }, { v: "de", l: "🇩🇪 DE" }, { v: "fr", l: "🇫🇷 FR" }].map(({ v, l }) => (
                          <button
                            key={v}
                            onClick={() => setCreatorLang(v as any)}
                            type="button"
                            className={`flex-1 py-2 text-[10px] font-mono transition-all ${
                              creatorLang === v 
                                ? "bg-[#C29F68] text-[#0b0b0b] font-bold" 
                                : "text-[#ECE8E1]/45 hover:text-[#ECE8E1]/80 bg-transparent"
                            }`}
                          >
                            {l}
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={handleAITranslate}
                        disabled={aiTranslating || !newProduct.nameTR.trim() || newProduct.pricetr <= 0}
                        className="w-full mt-2 py-2.5 bg-[#C29F68]/10 hover:bg-[#C29F68]/20 border border-[#C29F68]/30 hover:border-[#C29F68]/50 text-[#C29F68] text-[10px] font-mono uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed select-none rounded-none cursor-pointer"
                      >
                        {aiTranslating ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
                            AI Tarafından Çevriliyor...
                          </>
                        ) : (
                          "✨ AI ile Otomatik Çevir ve Fiyatlandır"
                        )}
                      </button>
                    </div>

                    {/* Ürün Adı */}
                    <div>
                      <label className="text-[11px] text-[#ECE8E1]/60 font-sans block mb-2">Ürün Adı ({creatorLang.toUpperCase()}) <span className="text-red-400">*</span></label>
                      <input 
                        type="text" 
                        value={
                          creatorLang === "tr" ? newProduct.nameTR : 
                          creatorLang === "en" ? newProduct.nameEN : 
                          creatorLang === "de" ? newProduct.nameDE : 
                          newProduct.nameFR
                        } 
                        onChange={(e) => {
                          const key = `name${creatorLang.toUpperCase()}`;
                          setNewProduct({ ...newProduct, [key]: e.target.value });
                        }}
                        className="w-full bg-black/30 border border-white/10 focus:border-[#C29F68]/50 p-3 text-sm text-[#ECE8E1] focus:outline-none font-sans transition-colors"
                        placeholder={
                          creatorLang === "tr" ? "Örn: NARD Gece Serisi Parfüm" : 
                          creatorLang === "en" ? "e.g., NARD Night Series Perfume" : 
                          creatorLang === "de" ? "z.B., NARD Nacht-Parfüm" : 
                          "ex. Parfum NARD Nuit"
                        } 
                      />
                    </div>

                    {/* Açıklama */}
                    <div>
                      <label className="text-[11px] text-[#ECE8E1]/60 font-sans block mb-2">Açıklama ({creatorLang.toUpperCase()})</label>
                      <textarea 
                        value={
                          creatorLang === "tr" ? newProduct.descriptionTR : 
                          creatorLang === "en" ? newProduct.descriptionEN : 
                          creatorLang === "de" ? newProduct.descriptionDE : 
                          newProduct.descriptionFR
                        } 
                        onChange={(e) => {
                          const key = `description${creatorLang.toUpperCase()}`;
                          setNewProduct({ ...newProduct, [key]: e.target.value });
                        }}
                        rows={3} 
                        className="w-full bg-black/30 border border-white/10 focus:border-[#C29F68]/50 p-3 text-sm text-[#ECE8E1] focus:outline-none font-sans transition-colors resize-none"
                        placeholder={
                          creatorLang === "tr" ? "Ürün hakkında kısa açıklama..." : 
                          creatorLang === "en" ? "Short description about the product..." : 
                          creatorLang === "de" ? "Kurze Beschreibung des Produkts..." : 
                          "Description courte du produit..."
                        } 
                      />
                    </div>

                    {/* Kategori */}
                    <div>
                      <label className="text-[11px] text-[#ECE8E1]/60 font-sans block mb-2">Kategori</label>
                      <div className="grid grid-cols-4 gap-2">
                        {[{ v: "parfum", l: "🌿 Parfüm" }, { v: "giyim", l: "👕 Giyim" }, { v: "aksesuar", l: "💎 Aksesuar" }, { v: "diger", l: "📦 Diğer" }].map(({ v, l }) => (
                          <button key={v} onClick={() => setNewProduct({ ...newProduct, category: v as any })}
                            className={`py-2 text-[10px] font-mono border transition-all ${newProduct.category === v ? "bg-[#C29F68]/15 border-[#C29F68]/40 text-[#C29F68]" : "border-white/10 text-[#ECE8E1]/40 hover:border-white/20"}`}>
                            {l}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Fiyatlar */}
                    <div>
                      <label className="text-[11px] text-[#ECE8E1]/60 font-sans block mb-2">Fiyatlar <span className="text-red-400">*</span></label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[{ label: "🇹🇷 ₺ TR", key: "pricetr", sym: "₺" }, { label: "🌍 $ EN", key: "priceen", sym: "$" }, { label: "🇩🇪 € DE", key: "pricede", sym: "€" }, { label: "🇫🇷 € FR", key: "pricefr", sym: "€" }].map(({ label, key, sym }) => (
                          <div key={key}>
                            <p className="text-[9px] text-[#ECE8E1]/40 font-sans mb-1">{label}</p>
                            <div className="flex items-center border border-white/10 bg-black/30 focus-within:border-[#C29F68]/50 transition-colors">
                              <span className="px-2 text-[#C29F68] text-sm font-mono border-r border-white/10">{sym}</span>
                              <input type="number" value={(newProduct as any)[key] || ""} onChange={(e) => setNewProduct({ ...newProduct, [key]: Number(e.target.value) })}
                                className="flex-1 bg-transparent p-2 text-sm font-mono text-[#ECE8E1] focus:outline-none w-full" placeholder="0" />
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-[9px] text-[#ECE8E1]/30 font-sans mt-2">EN/DE/FR boş bırakılırsa TR fiyatından otomatik dönüştürülür</p>
                    </div>

                    {/* Özellikler */}
                    <div>
                      <label className="text-[11px] text-[#ECE8E1]/60 font-sans block mb-2">Özellikler / Detaylar</label>
                      <div className="flex flex-col gap-2">
                        {newProduct.specs.map((spec, i) => (
                          <input key={i} type="text" value={spec} onChange={(e) => { const u = [...newProduct.specs]; u[i] = e.target.value; setNewProduct({ ...newProduct, specs: u }); }}
                            className="w-full bg-black/30 border border-white/10 focus:border-[#C29F68]/30 p-2.5 text-sm text-[#ECE8E1] focus:outline-none font-sans transition-colors"
                            placeholder={`Özellik ${i + 1} (örn: Materyal: %100 Pamuk)`} />
                        ))}
                        <button onClick={() => setNewProduct({ ...newProduct, specs: [...newProduct.specs, ""] })}
                          className="w-full py-2 border border-dashed border-white/15 hover:border-[#C29F68]/30 text-[10px] text-[#ECE8E1]/40 hover:text-[#C29F68] font-mono uppercase tracking-wider transition-all">
                          + Özellik Ekle
                        </button>
                      </div>
                    </div>

                    {/* Ekle Butonu */}
                    <button onClick={handleAddProduct} disabled={isAddingProduct || !newProduct.nameTR.trim() || newProduct.pricetr <= 0}
                      className="w-full py-4 bg-[#C29F68] hover:bg-transparent border border-[#C29F68] hover:text-[#C29F68] text-[#0b0b0b] text-[11px] font-mono font-bold tracking-[0.25em] uppercase transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                      {isAddingProduct ? (
                        <><span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" /> Ekleniyor...</>
                      ) : "✓ Ürünü Ekle ve Yayınla"}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── ÜRÜNLERİM SEKMESİ ── */}
              {activeTab === "urunlerim" && (
                <motion.div key="urunlerim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="glass-panel border border-white/8">
                    <div className="p-5 border-b border-white/8 flex items-center justify-between">
                      <div>
                        <h3 className="text-[11px] font-mono text-[#C29F68] tracking-widest uppercase">🗂 Eklenen Ürünler</h3>
                        <p className="text-[10px] text-[#ECE8E1]/35 font-sans mt-0.5">{customProducts.length} ürün mağazada gösteriliyor</p>
                      </div>
                      <button onClick={() => setActiveTab("yeniurun")} className="px-4 py-2 bg-[#C29F68]/15 border border-[#C29F68]/30 text-[#C29F68] text-[10px] font-mono uppercase tracking-wider hover:bg-[#C29F68]/25 transition-all">
                        ➕ Yeni Ekle
                      </button>
                    </div>

                    {customProducts.length === 0 ? (
                      <div className="p-12 text-center">
                        <div className="text-4xl mb-3">📦</div>
                        <p className="text-[13px] text-[#ECE8E1]/50 font-sans">Henüz ürün eklenmedi</p>
                        <p className="text-[11px] text-[#ECE8E1]/30 font-sans mt-1">➕ Yeni Ürün sekmesinden başlayın</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-white/5">
                        {customProducts.map((product) => (
                          <div key={product.id} className="p-4 flex items-start gap-4 hover:bg-white/[0.02] transition-colors">
                            {/* Görsel */}
                            <div className="w-16 h-16 shrink-0 bg-white/5 border border-white/10 overflow-hidden">
                              {(() => {
                                const nameText = typeof product.name === "string" ? product.name : (product.name.tr || Object.values(product.name)[0] || "");
                                return (
                                  <img src={product.image} alt={nameText} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' fill='%23222'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dominant-baseline='central' fill='%23555' font-size='20'%3E📦%3C/text%3E%3C/svg%3E"; }} />
                                );
                              })()}
                            </div>
                            {/* Bilgi */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                {(() => {
                                  const nameText = typeof product.name === "string" ? product.name : (product.name.tr || Object.values(product.name)[0] || "");
                                  const descText = typeof product.description === "string" ? product.description : (product.description.tr || Object.values(product.description)[0] || "");
                                  return (
                                    <div>
                                      <p className="text-[13px] font-sans text-[#ECE8E1] font-medium truncate">{nameText}</p>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[9px] font-mono text-[#C29F68]/70 bg-[#C29F68]/10 px-1.5 py-0.5">{catLabel(product.category)}</span>
                                        <span className="text-[9px] font-mono text-[#ECE8E1]/40">₺{product.basePrice.tr.toLocaleString("tr-TR")}</span>
                                      </div>
                                      {descText && (
                                        <p className="text-[11px] text-[#ECE8E1]/40 font-sans mt-1 line-clamp-1">{descText}</p>
                                      )}
                                    </div>
                                  );
                                })()}
                                <button onClick={() => handleDeleteProduct(product.id)}
                                  className="shrink-0 px-3 py-1.5 bg-red-500/8 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-[10px] font-mono uppercase transition-all">
                                  Sil
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sağ: Eylemler */}
          <div className="flex flex-col gap-5">
            {/* Kaydet */}
            <div className="glass-panel p-6 border border-[#C29F68]/20 flex flex-col gap-4 text-center">
              <div>
                <p className="text-[10px] font-mono text-[#C29F68] tracking-widest uppercase mb-1">Değişiklikleri Yayınla</p>
                <p className="text-[11px] text-[#ECE8E1]/40 font-sans leading-relaxed">Fiyat ve koku notu değişikliklerini kaydetmek için tıklayın.</p>
              </div>
              <button onClick={() => saveAll()} disabled={isSaving}
                className="w-full py-4 bg-[#C29F68] hover:bg-transparent border border-[#C29F68] hover:text-[#C29F68] text-[#0b0b0b] text-[11px] font-mono font-bold tracking-[0.25em] uppercase transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                {isSaving ? (<><span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />Kaydediliyor...</>) : "💾 Değişiklikleri Kaydet"}
              </button>
              <button onClick={() => { setIsAuthorized(false); setPasscode(""); }} className="w-full py-2.5 border border-white/10 hover:border-red-500/30 text-[#ECE8E1]/40 hover:text-red-400 text-[10px] font-mono tracking-wider uppercase transition-all">
                🔒 Paneli Kilitle
              </button>
            </div>

            {/* WhatsApp Ayarları */}
            <div className="glass-panel p-5 border border-white/8 flex flex-col gap-3">
              <div>
                <p className="text-[10px] font-mono text-[#C29F68] tracking-widest uppercase mb-1">💬 WhatsApp Sipariş Hattı</p>
                <p className="text-[11px] text-[#ECE8E1]/40 font-sans leading-relaxed">Siparişlerin iletileceği telefon numarasını uluslararası formatta girin.</p>
              </div>
              <div className="flex items-center border border-white/10 bg-black/30 focus-within:border-[#C29F68]/50 transition-colors">
                <span className="px-2.5 text-[#C29F68] text-sm font-mono border-r border-white/10">+</span>
                <input 
                  type="text" 
                  value={adminWhatsappNumber} 
                  onChange={(e) => setAdminWhatsappNumber(e.target.value.replace(/[^0-9]/g, ""))} 
                  className="flex-1 bg-transparent p-2 text-sm font-mono text-[#ECE8E1] focus:outline-none w-full"
                  placeholder="905336113880"
                />
              </div>
              <p className="text-[9px] text-[#ECE8E1]/30 font-sans">Not: Numara başında + veya 00 olmadan, ülke kodu ve numara olmalıdır (örn: 905336113880).</p>
            </div>

            {/* Özet */}
            <div className="glass-panel p-5 border border-white/8">
              <p className="text-[10px] font-mono text-[#ECE8E1]/40 tracking-widest uppercase mb-4">📊 Aktif Fiyatlar (TR ₺)</p>
              <div className="flex flex-col gap-2.5">
                {[{ label: "Spikenard Parfüm", price: perfumePrices.tr, sym: "₺" }, { label: "Heavyweight Polo", price: poloPrices.tr, sym: "₺" }, { label: "Sovereign Set", price: packPrices.tr, sym: "₺" }].map(({ label, price, sym }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <span className="text-[11px] text-[#ECE8E1]/60 font-sans">{label}</span>
                    <span className="text-[13px] font-mono text-[#ECE8E1] font-semibold">{sym}{price.toLocaleString("tr-TR")}</span>
                  </div>
                ))}
                {customProducts.length > 0 && (
                  <div className="flex items-center justify-between py-2 border-t border-white/8 mt-1">
                    <span className="text-[11px] text-[#C29F68]/70 font-sans">Özel Ürünler</span>
                    <span className="text-[13px] font-mono text-[#C29F68] font-semibold">{customProducts.length} adet</span>
                  </div>
                )}
              </div>
            </div>

            {/* Sunucu */}
            <div className="glass-panel p-5 border border-white/8">
              <p className="text-[10px] font-mono text-[#ECE8E1]/40 tracking-widest uppercase mb-4">🖥️ Sunucu Durumu</p>
              <div className="grid grid-cols-2 gap-3">
                {[{ l: "Bağlantı", v: "AKTİF", c: "text-green-400", b: "bg-green-500/5 border-green-500/15" }, { l: "Gecikme", v: `${ping}ms`, c: "text-[#C29F68]", b: "bg-white/3 border-white/8" }, { l: "Veritabanı", v: "JSON/0ms", c: "text-[#ECE8E1]/70", b: "bg-white/3 border-white/8" }, { l: "Platform", v: "Hostinger", c: "text-[#ECE8E1]/70", b: "bg-white/3 border-white/8" }].map(({ l, v, c, b }) => (
                  <div key={l} className={`p-3 border text-center ${b}`}>
                    <p className="text-[8px] font-mono text-[#ECE8E1]/40 mb-1 uppercase">{l}</p>
                    <p className={`text-[11px] font-mono font-bold ${c}`}>{v}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Kılavuz */}
            <div className="p-4 border border-white/5 bg-white/[0.01]">
              <p className="text-[10px] font-mono text-[#ECE8E1]/30 tracking-widest uppercase mb-2">💡 Nasıl Çalışır?</p>
              <ul className="flex flex-col gap-1.5">
                {["➕ Yeni Ürün → ürün bilgilerini doldur → Ekle", "🗂 Ürünlerim → eklenen ürünleri gör / sil", "Fiyat değiştir → Kaydet butonuna bas", "Ürünler mağazada anında görünür"].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-[10px] text-[#ECE8E1]/40 font-sans">
                    <span className="text-[#C29F68]/50 mt-0.5 shrink-0">{i + 1}.</span>{tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
