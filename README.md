# NARD Parfüm — statik vitrin

Bu sürüm, önceki NARD mağaza tasarımını Hostinger'ın dosya barındırması için statik HTML, CSS ve JavaScript olarak üretir. Canlı ortamda Node.js süreci, veritabanı veya API gerekmez.

## Yerel geliştirme

```bash
npm ci
npm run dev
```

## Yayın dosyalarını oluşturma

```bash
npm ci
npm run lint
npm run build
```

`out/` klasörünün **içeriği** alan adının web köküne (`public_html`) yüklenir. `out/` klasörünün kendisini alt klasör olarak yüklemeyin. `/` adresi statik `index.html` üzerinden `/tr/` sayfasına gider; `/en/`, `/de/` ve `/fr/` ayrı sayfalardır. Bu kaynakta doğrulanan alan adı `nardparfum.com`dur.

## İçerik ve işlevler

- Ürünler ve bölgesel fiyatlar `src/data/products.json` dosyasındadır. Değişikliklerden sonra yeniden derleyip `out/` içeriğini tekrar yükleyin.
- Sepet tarayıcıda çalışır; ödeme almak yerine mevcut mağaza WhatsApp hattına bir sipariş talebi açar. Gerçek sipariş ve fiyatların işletme tarafından ayrıca teyit edilmesi gerekir.
- Koku eşleştirmesi ziyaretçinin tarayıcısında çalışan sabit bir seçim kuralıdır; sunucu tabanlı yapay zekâ hizmeti değildir.
- Önceki yönetici paneli, dosya yükleme ve API uçları statik sürümde yoktur. Yönetim işlemleri kaynak ve yeniden derleme üzerinden yapılır.

`out/` Git tarafından izlenmez. Eski Node.js uygulamasının kaynak geçmişi Git üzerinde kalır; bu dal statik dağıtım içindir.
