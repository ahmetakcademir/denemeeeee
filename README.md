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

Bu revizyonun tasarım yönü ve kontrolleri `DESIGN.md` dosyasındadır. Sayfa dört dilde üretilir; görünür dil seçimi, koleksiyon bağlantıları ve üç sorulu tercih rehberi içerir. Görsellerin 1024px PNG kaynakları korunur; sayfa daha küçük WebP sürümlerini kullanır. Fotoğraf hareketleri destekleyen tarayıcılarda doğal kaydırmaya bağlıdır ve azaltılmış hareket tercihini izler.

Windows'ta kaynak klasör adında apostrof varsa Next.js metadata yükleyicisi derlemeyi bozabilir. Böyle bir durumda geçici bir sürücü eşlemesinden `npm run build -- --webpack` çalıştırıp işlem sonunda eşlemeyi kaldırın; yayın dosyaları yine aynı `out/` klasörüne yazılır.

`out/` klasörünün **içeriği** alan adının web köküne (`public_html`) yüklenir. `out/` klasörünün kendisini alt klasör olarak yüklemeyin. `/` adresi statik `index.html` üzerinden `/tr/` sayfasına gider; `/en/`, `/de/` ve `/fr/` ayrı sayfalardır. Bu kaynakta doğrulanan alan adı `nardparfum.com`dur.

## İçerik ve işlevler

- Ürün kataloğu `src/data/products.json` dosyasındadır. Değişikliklerden sonra yeniden derleyip `out/` içeriğini tekrar yükleyin.
- Bu sürüm ürün tanıtımı ve iletişim içindir. Eski fiyatlar, sepet, sipariş ve WhatsApp akışı yayın paketine dahil değildir. Ürün bağlantıları doğrulanmış AKCA Studio iletişim e-postasına yönlenir.
- Koku eşleştirmesi ziyaretçinin tarayıcısında çalışan sabit bir seçim kuralıdır; sunucu tabanlı yapay zekâ hizmeti değildir.
- Önceki yönetici paneli, dosya yükleme ve API uçları statik sürümde yoktur. Yönetim işlemleri kaynak ve yeniden derleme üzerinden yapılır.

`out/` Git tarafından izlenmez. Eski Node.js uygulamasının kaynak geçmişi Git üzerinde kalır; bu dal statik dağıtım içindir.
