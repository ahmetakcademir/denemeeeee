# NARD — yaşayan koku anlatısı

## Yön

Kullanıcının sabitlediği Dala/AKCA dili: koyu ve ferah sahne, normal ağırlıklı büyük sans başlık, metin/görselin karşılıklı yerleşimi, malzemeli ana eylem. NARD'ın pirinç ve botanik yeşil paleti, gerçek ürün fotoğrafları ve NR mühür kimliği korunur.

Üç doğal bölüm: koku şeridi → Spikenard şişe çizgisi → mevcut NR mühür. Kopya kısa tutulur; gerçek üç ürünün fotoğraf ve özellikleri aşağıdaki koleksiyondadır. Her bölümün bağlantısı ilgili içerik veya rehbere gider. Kaydırma hiçbir zaman engellenmez.

## Hareket bütçesi

- Bir Canvas 2D, ek bağımlılık yok; masaüstü 2.300, mobil 1.200 küçük üçgen.
- Çizim tavanı 40/30 FPS; DPR 1,5/1,25. Bunlar sınır değerleridir, gerçek cihaz performansı ölçümü değildir.
- Görünürken sürekli dalga, nefes ve ışık hareketi; kaydırma bu hareketin üzerine geometrik dönüşüm ekler. Dönüşüm tamamlandığında hareket sürer.
- Giriş veya geçiş kullanıcı etkileşimini engellemez. Görünür durdurma düğmesi kullanıcı talebine göre yoktur.
- Sekme gizli veya canvas ekran dışındayken RAF iptal edilir. Azaltılmış hareket tercihinde statik ilk kompozisyon; sticky görsel hareketi kapanır.
- Mobilde bölüm yüksekliği en uzun metne göre ölçülür; görsel için ayrıca alan bırakılır. Dil değişikliği ResizeObserver ile yeniden ölçülür.
- JavaScript yokken SVG koku şeridi ve tüm metin/bağlantılar görünür.

## Marka varlıkları

Mevcut NR mühründen SVG, 32 px PNG, çok boyutlu ICO, 180 px dokunmatik ikon ve 192/512 px manifest ikonları üretildi. Yeni, ilgisiz bir işaret eklenmedi.

## Doğrulama

- ESLint ve `tsc --noEmit`: geçti.
- Next üretim webpack derlemesi: 7/7 çıktı; TR/EN/DE/FR statik rotalar.
- Dört dil statik HTML'inde tek H1, eksiksiz yerel görsel/script dosyaları, çözülen sayfa içi bağlantılar ve tekil kimlikler.
- Canvas yaşam döngüsü kontrollü Node VM ortamında iki varyant ve iki ekran sınıfında sınandı: sürekli idle hareket, scroll morph, gizli/ekran dışı durma, azaltılmış hareket ve cleanup başarılı.
- Gerçek tarayıcı görsel kontrolü ve yayın koordinatörün QA aşamasıdır. Bu belge gerçek FPS veya Lighthouse ölçümü iddia etmez.

## Yayın

`output: export` korunur. Yalnız `out/` içeriği Hostinger'a yayınlanır. Node üretim servisi gerekmez. Mevcut katalog, dört dil ve iletişim bağlantıları korunur; ödeme veya stok iddiası eklenmez.
