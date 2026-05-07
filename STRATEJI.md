# HeatRank AI — Strateji ve Aksiyon Belgesi

> **Tarih:** 2026-05-08
> **Durum:** Phase 10 shipped, ürün marketing açısından tam — eksik olan dağıtım ve müşteri.
> **Birinci hedef:** İlk 5-10 ödeyen müşteri, sonra $1K MRR, sonrası uzun vade.

---

## 1. Stratejik Konumlandırma — Karar Verilenler

### Niche Disiplini
- HeatRank AI **sadece HVAC** kalacak
- Plumbing genişlemesi **şimdi yapılmayacak** — niche kalkanını bozar, içerik bütününü bozar, ürün-pazar uyumunu doğrulamadan dağıtır
- 50+ ödeyen HVAC müşteri olduktan sonra **kardeş ürün** olarak (örn. `piperankai.com`) düşünülecek
- Şu an "Built exclusively for HVAC" en güçlü pazarlama silahı, korunacak

### Ürün Modeli
- Self-serve SaaS modeli korunacak (LocalSEOBot'un done-for-you modelinden farklı kalacak)
- Agency tier landing page'de görünür ama outbound efor HVAC sahibine
- Hibrit servis modeli (strateji call'ları, manuel iş) **yapılmayacak** — ölçeklenmez

---

## 2. Rakip Haritası — Gerçek Resim

| Rakip | Aylık Gelir | Hedef Kitle | Bizim İçin Anlamı |
|---|---|---|---|
| **SEOBOT** | ~$73K | SaaS kurucuları, blog otomasyonu | Rakip değil, farklı pazar |
| **LocalRank.so** | ~$41K | SEO ajansları (10+ konum) | Rakip değil, çok pahalı, ajans odaklı |
| **ChatSEO** | ~$21K | Website sahipleri (GSC odaklı) | Rakip değil, local SEO değil |
| **SEO Stack** | ~$18K | SEO profesyonelleri | Rakip değil |
| **LocalSEOBot** | ~$7K | Yerel işletme (done-for-you) | **Tek direkt rakip** — düşüşte (-%31) |
| **Fusionn** | ~$840 | Genel SEO (Fransa) | Rakip değil |

**Sonuç:** HVAC sahibi için özel yapılmış SaaS yok. Boşluk gerçek.

### Kullanılmayacak Rekabet Taktikleri
- ❌ `/vs/localseobot`, `/vs/localrank` sayfaları yapılmayacak — küçük rakibe direkt saldırı ona reklam vermek demek, hukuki risk taşır
- ✅ `/vs/seo-agency`, `/vs/podium`, `/vs/birdeye` (kategori karşılaştırmaları) tutulacak — büyük oyuncular zarar veremez
- ✅ Yeni eklenebilir: `/vs/hiring-marketing-employee`, `/vs/doing-it-yourself` — kimseyi düşman etmeden alış niyetini yakalar

### LocalSEOBot Stratejisi
- Onların mutsuz kullanıcılarını hedeflemek en sıcak lead havuzu
- Reddit, Facebook gruplarında "LocalSEOBot'tan kötü deneyim yaşayanlar" araması yapılacak
- DM atılacak, alternatif olarak HeatRank tanıtılacak

---

## 3. Pazar Verileri (Google Trends) — Bulgular

### HVAC Sektörü Patlıyor
- 5 yıllık trend: 2022-2024 = 40-50 bandı, 2025 = 60, 2026 = 100 (zirve)
- Doğru ürün, doğru zaman

### En Hızlı Büyüyen Aramalar (Son 3 Ay)
| Arama | Artış |
|---|---|
| best hvac contractors near me | **+%600** |
| emergency hvac repair near me | +%250 |
| hvac emergency repair near me | +%250 |
| emergency hvac service near me | +%200 |
| hvac installation near me | +%190 |
| same day hvac service near me | +%140 |

**Çıkan Ders:** Müşteri "yakınımdaki + acil + en iyisi" diye arıyor. HeatRank'ın vaadi tam olarak bu.

### Önemli Sinyaller
- *"hvac seo agency"* → +%10 (yükseliş), *"hvac seo company"* → -%40 (düşüş) — "ajans" dili artıyor
- *"plumbing & hvac seo"* → BREAKOUT (gelecek genişleme alanı)
- *"ai seo"* → +%30 — AI konumlandırması doğru zamanda
- HVAC sahipleri "software" veya "tool" diye **aramıyor** — "agency", "company", "marketing" diyor

### Pazarlama Diline Etkisi
- Site copy'sinde "tools" yerine "platform" veya "DIY HVAC SEO agency" kullanılacak
- "Near me" anahtar kelimesi hero ve content'te öne çıkarılacak

---

## 4. Site Audit Bulguları (heatrankai.com)

### Acil Düzeltilecekler

| Sorun | Önem | Çözüm |
|---|---|---|
| `site:heatrankai.com` Google'da görünmüyordu (gizli sekmede çıkıyor şimdi) | 🔴 | GSC kuruldu ✅ — sitemap submit + manuel "Request Indexing" |
| Hero başlığı feature-focused, sonuç-focused değil | 🔴 | Yeni başlık (aşağıda copy seçenekleri) |
| `AggregateOffer` JSON-LD ve "SOC 2 / 99.9% uptime" trust bar dayanaksızsa hukuki risk | 🔴 | Gerçekten geçerli mi kontrol et, değilse copy'yi yumuşat |
| Sahte gibi duran testimonial'lar (Mike T., Sarah K., James R.) | 🟡 | Ya gerçek 1 testimonial koy ya hiç koyma |
| `/case-studies` sayfası — mock mu gerçek mi? | 🟡 | Mock ise "Beta Customer Spotlights" gibi dürüst etikete çevir |
| Newsletter widget yazıyor ama Supabase tablosu yok → email'ler kayboluyor | 🟡 | `newsletter_subscribers` tablosu oluştur |

### Mobil UX İyileştirmeleri (Phase 10'da Geldi, Açıklanan)
- **Mobil menü çekmecesi** → telefonda gezinmeyi kolaylaştırır, kayıt artar
- **Yapışkan ücretsiz deneme butonu** → satışa direkt etki eder
- **Ana içeriğe atla linki + odak halkası + hareket azaltma** → ABD'de engelli erişimi davalarına karşı hukuki koruma
- **Bonus:** Google mobil-uyumlu siteleri arama sonuçlarında yukarı taşıyor

---

## 5. Hero Copy Seçenekleri

Mevcut: ❌ *"Local SEO Tools for HVAC Contractors"* (feature-focused, duygu yok)

### Tavsiye Edilen Yeni Başlık (Google Trends Verisine Uygun)
> ⭐ **"Show Up #1 When Locals Search 'HVAC Near Me'"**
>
> *AI-powered local SEO — built for HVAC contractors who want the phone to ring. No agency, no contracts, no $2,000/mo bills.*

### Alternatif Seçenekler
1. **"Stop Losing HVAC Calls to the Guy Ranking Above You"** — kayıp/korku açısı
2. **"The HVAC Contractor Who Shows Up First on Google Gets the Call"** — sonuç açısı
3. **"Local SEO for HVAC — Without the $2,000/Month Agency Bill"** — fiyat karşılaştırma açısı

**Neden 1. seçenek?** Çünkü Google Trends verisi gösteriyor ki müşteri tam olarak "near me" diye arıyor. Anahtar kelimeyi başlığa koyunca hem SEO yardımcısı hem mesaj direkt.

---

## 6. Aksiyon Listesi — Önceliklendirilmiş

### A. Bu Hafta (En Hızlı Etki)
- [ ] Hero başlığını "near me" odaklı değiştir
- [ ] GSC'de homepage + 5 önemli sayfa için "Request Indexing" tıkla
- [ ] Trust bar'daki "SOC 2 / 99.9% uptime" dayanaksızsa kaldır veya yumuşat
- [ ] `/case-studies` sayfasını incele — mock'sa "Beta Spotlights" yap
- [ ] Sahte testimonial'ları kaldır
- [ ] Supabase'de `newsletter_subscribers` tablosunu oluştur

### B. Sonraki 2 Hafta (Müşteri Bulma)
- [ ] Facebook'ta "HVAC Business Owners" grubuna katıl, 1 hafta gözle
- [ ] LocalSEOBot'a kaydol, 7 günlük denemeyi kullan, eksiklerini bizzat gör
- [ ] LocalSEOBot mutsuz kullanıcılarını ara (Reddit, Facebook, Trustpilot)
- [ ] HeatRank AI'ı kendi siten için kullan (dogfood) — sonuçları case study yap
- [ ] `/emergency-hvac-seo` veya `/hvac-near-me-seo` sayfası ekle (rakipsiz arama)

### C. Sonraki Ay (Dağıtım)
- [ ] HVAC sahiplerine Facebook DM (cold email değil, telefon değil)
- [ ] Reddit r/HVAC, r/smallbusiness'ta değerli post'lar
- [ ] LocalRank "Review Booster" özelliğini hatırla — bu Google ToS ihlali. Buna karşı **"Legitimate SEO, no fake reviews"** mesajını öne çıkar
- [ ] Product Hunt launch (backlink ve PR için, müşteri için değil)

### D. Uzun Vade (3+ Ay)
- [ ] LLM Citation özelliği ekle (Phase 9.x): Gemini makale üretsin, Medium/LinkedIn/Reddit için 3 versiyon çıkarsın
- [ ] Blog büyüt (3-6 ayda Google ranklamaya başlar)
- [ ] 50 ödeyen HVAC müşteri sonrası → Plumbing kardeş ürün düşün

---

## 7. Yapılmayacaklar (Karar Verilmiş)

- ❌ Direkt küçük rakibe `/vs/<rakip>` sayfası → ona ücretsiz reklam
- ❌ Plumbing eklemek (şimdi) → niche kalkanını bozar
- ❌ Türkiye'den ABD'ye cold call → güven kırar
- ❌ Cold email kampanyası (HVAC sahibi email açmıyor) → Facebook DM tercih
- ❌ "Done-for-you" / agency hibrit modele geçiş → ölçeklenmez
- ❌ Reddit'i HVAC kanalı olarak öncelik yapmak → HVAC sahipleri Facebook'ta
- ❌ 90 günlük müşteri hedefini blog ile kovalamak → blog 6+ ay sonra etkili olur
- ❌ Product Hunt'ı müşteri kanalı olarak görmek → sadece backlink/PR için iyi

---

## 8. Phase 10 Geldi — Ne Bekleniyor

Phase 10 (2026-05-07 shipped) ile site marketing açısından tam:
- ✅ 25 şehir + 18 eyalet sayfası
- ✅ 3 vs-kategori sayfası (`/vs-seo-agency`, `/vs-podium`, `/vs-birdeye`)
- ✅ 4 uzun blog yazısı + 22 terimlik glossary
- ✅ 3 ücretsiz SEO aracı (lead magnet, signup yok)
- ✅ /about, /faq, /case-studies, /integrations, /roadmap, /changelog
- ✅ Site-wide JSON-LD schema markup
- ✅ Mobile UX iyileştirmeleri
- ✅ Dynamic OG images, canonical URLs, sitemap
- ✅ 5 kritik bug fix (favicon, keyword AI, snapshot gate, GBP, reviews)

**Sonuç:** Altyapı bitti. Sıradaki engel feature değil, **müşteri bulmak.**

---

## 9. Anahtar Mesajlar (Pazarlama Dilinde Kullanılacak)

| Konsept | Pazarlama Dili |
|---|---|
| Hedef kitle | "Built exclusively for HVAC contractors" |
| Aramaya çıkma | "Show up #1 when locals search 'near me'" |
| Fiyat avantajı | "Without the $2,000/mo agency bill" |
| Etik fark | "Legitimate SEO — no fake reviews, no ToS violations" |
| Self-serve değer | "DIY power, agency-grade results" |
| AI konumlandırma | "AI does the SEO work — you stay in the truck" |
| Kontrat yok | "No contracts. Cancel anytime. Card-free trial." |

---

## 10. Önümüzdeki Net Karar

**Bu hafta birinci aksiyon:** Hero başlığını değiştir. Diğer her şey ona bağlı çünkü trafik geldiğinde ilk gördükleri o.

**Sonraki net karar:** GSC manuel indexleme talebi (homepage + 5 sayfa).

Bu ikisi yapıldıktan sonra **müşteri bulma fazına** geç — Facebook gruplarda değerli içerik, LocalSEOBot mutsuz kullanıcı avı, HeatRank'ı kendi siten için kullanma + case study.

İlk 5 müşteri bu kanaldan gelir. Sonrası organik domino etkisi.
