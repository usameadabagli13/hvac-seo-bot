# HeatRank AI — Strateji ve Aksiyon Belgesi

> **Tarih:** 2026-05-08 (güncellendi)
> **Durum:** Phase 10 + 10.11–10.15 shipped. Ürün, copy, conversion altyapısı tamam — eksik olan **dağıtım ve müşteri**.
> **Birinci hedef:** İlk 5-10 ödeyen müşteri, sonra $1K MRR, sonrası uzun vade.
> **Kritik dürüstlük:** Doc'un kendisi "hero başlığını değiştir = 1 numaralı acil iş" diyor. **Hâlâ yapılmadı.** Bunun dışında her şeyi yaptık.

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

| Sorun | Önem | Durum |
|---|---|---|
| `site:heatrankai.com` Google'da görünmüyordu | 🔴 | ✅ GSC kuruldu, sitemap submit edildi |
| Hero başlığı feature-focused, sonuç-focused değil | 🔴 | ❌ **HÂLÂ AÇIK** — doc 1 numara diyor, yapılmadı |
| `AggregateOffer` JSON-LD ve "SOC 2 / 99.9% uptime" trust bar dayanaksızsa hukuki risk | 🔴 | ⚠️ Kısmen — SOC 2 Supabase üzerinden gerçek, "99.9% uptime SLA" copy'si Vercel'in ama bizim adımıza söylüyoruz, **yumuşatılmalı** |
| Sahte gibi duran testimonial'lar (Mike T., Sarah K., James R.) | 🟡 | ❌ Hâlâ duruyor — metric badge'leri ekledik ama "real customer" iddiası hâlâ yanıltıcı |
| `/case-studies` sayfası — mock mu gerçek mi? | 🟡 | ❌ Hâlâ "Real HVAC contractors" diye sunuluyor, gerçek değil |
| Newsletter widget yazıyor ama Supabase tablosu yok | 🟡 | ✅ Tablo oluşturuldu, welcome email + weekly cron canlı |

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
- [x] **Hero başlığını "near me" odaklı değiştir** — ✅ "Show Up First When Locals Google 'HVAC Near Me'"
- [x] GSC kuruldu + sitemap submit + manuel "Request Indexing" yapıldı
- [ ] Trust bar'daki "99.9% uptime SLA" copy'sini yumuşat (Vercel'inki, bizim değil)
- [ ] `/case-studies` sayfasını "Beta Customer Spotlights" / "Sample HVAC Wins" gibi dürüst etikete çevir
- [ ] Homepage testimonial'ları "Sample customer story" disclaimer'ı ile etiketle veya kaldır
- [x] `newsletter_subscribers` tablosu + welcome email + weekly cron tamam

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

## 8. Phase 10 + 10.11–10.15 Shipped (2026-05-07 → 05-08)

### Phase 10 (2026-05-07)
- ✅ 25 şehir + 18 eyalet sayfası
- ✅ 3 vs-kategori sayfası (`/vs-seo-agency`, `/vs-podium`, `/vs-birdeye`)
- ✅ 4 uzun blog yazısı + 22 terimlik glossary
- ✅ 3 ücretsiz SEO aracı (lead magnet, signup yok)
- ✅ /about, /faq, /case-studies, /integrations, /roadmap, /changelog
- ✅ Site-wide JSON-LD schema markup
- ✅ Mobile UX iyileştirmeleri (StickyMobileCTA, MobileNav v1)
- ✅ Dynamic OG images, canonical URLs, sitemap
- ✅ 5 kritik bug fix (favicon, keyword AI, snapshot gate, GBP, reviews)

### 2026-05-08 polish günü
- ✅ Newsletter automation: tablo + welcome email + Pazartesi cron
- ✅ Resend domain verify + DKIM/SPF/DMARC + tracking subdomain
- ✅ Money-back guarantee 9 conversion surface'ında promosyon edildi (hero, founding, bottom CTA, pricing, vs-pages, login, city pages)
- ✅ /login 2-column redesign (marketing + form)
- ✅ MobileNav createPortal + 100dvh rebuild (iOS hero-bleed bug fix)
- ✅ City page heatmap map-style redesign
- ✅ Free tools homepage strip + amber "New" header link
- ✅ /integrations cleanup (backend-only items ayrıldı)
- ✅ Mike → Usame imza
- ✅ Mobile login order: hook → form → details

**Sonuç:** Altyapı + conversion + retention loop'ları bitti. Sıradaki engel feature değil, **dürüstlük düzeltmeleri + müşteri bulmak.**

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

---

## 11. Dürüst Değerlendirme (2026-05-08)

### İronik Durum
Doc kendi 1 numaralı acil işini "Hero başlığını değiştir" diye yazıyor. Geçen 24 saatte:
- ✅ Newsletter otomasyonu (welcome + weekly cron)
- ✅ Money-back garantisi 9 yere serpildi
- ✅ Login sayfası 2-column redesign + mobile reorder
- ✅ MobileNav 2 kez yeniden yazıldı (Portal + 100dvh)
- ✅ City heatmap redesign
- ✅ Free tools strip
- ❌ **Hero başlığı: değişmedi**

Bu bir önceliklendirme hatası. Ürün/conversion polish kolay, copy değişikliği zor (karar vermek istemiyoruz).

### Dürüstlük Riskleri (Hâlâ Açık)
Bunlar yasal/etik açıdan acilen düzeltilmeli — ilk müşteri gelmeden önce:

1. **3 sahte testimonial** (Mike T., Sarah K., James R.) — metric badge ekledik ama "real customer" iddiası yanıltıcı. ABD'de FTC bu konuda sert.
2. **/case-studies** sayfası — "Real HVAC contractors. Real growth." başlığı uydurma datayla satır satır eşleşmiyor. Etiket "Sample HVAC wins" / "Beta spotlights" olmalı.
3. **"99.9% uptime SLA"** — Vercel'in SLA'sı, biz SLA imzalamıyoruz. "99.9% uptime via Vercel edge" daha doğru.
4. **"+147% direct calls from GMB"** ve diğer metric'ler — kaynaksız. Ya disclaimer ya kaldır.

### Hedef Müşteri Yanlış Seçim Riski
Doc "HVAC sahipleri Facebook'ta, Reddit'te değil" diyor. Doğru.
Ama bizim ürünün **ilk kullanıcı kitlesi** muhtemelen şu sıralamada:
1. Tech-aware HVAC sahibi (% küçük)
2. **Marketing yapan kişi** (HVAC için çalışan freelancer / pazarlama danışmanı)
3. Küçük HVAC firmasının oğlu/kızı (dijital takım)

Bu 3 kategori Reddit ve LinkedIn'de aktif. Sadece Facebook'a odaklanmak %1 kitleyi kaçırabilir.

### Öncelik Sırası — Yeniden Yazıldı

**Bugün/yarın (hızlı + acil):**
1. 🔴 **Hero başlığını değiştir** ("Show up #1 when locals search 'HVAC near me'") — 30 dakikalık iş, doc'un 5 günden beri 1 numarası
2. 🔴 **3 sahte testimonial'a "Sample story" disclaimer ekle** veya kaldır — hukuki risk
3. 🔴 **/case-studies başlığını "Sample HVAC wins"** yap, üste disclaimer
4. 🟡 **"99.9% uptime SLA"** copy'sini "via Vercel edge · 99.9% historical uptime" yap
5. 🟡 GSC'de homepage + 5 öncelikli sayfa için "Request Indexing"

**Sonraki 7 gün (müşteri bulma):**
6. Facebook "HVAC Business Owners" grupları → 1 hafta gözle, **post atma**, anlamaya çalış
7. LocalSEOBot 7-day trial'ına kaydol → eksiklerini dökümanla
8. HeatRank'ı kendi siten için kullan (`heatrankai.com`) → 30 günlük kendi case study'n
9. Reddit r/HVAC, r/smallbusiness'ta **soru cevaplama** modunda gez (link verme, sadece yardımcı ol → username'i HVAC SEO ile özdeşleşsin)

### Yapılmaması Gereken (Dikkat)
- ❌ Yeni feature ekleme — ürünü zaten over-built ettik
- ❌ Hero başlığını değiştirmeden müşteri arama → ilk 100 kişi yanlış mesajla karşılaşır, hepsi kaybedilir
- ❌ Cold DM Facebook → ilk 5 müşteri gelmeden önce. Önce gözle, sonra konuş.

### Stratejinin Çalışması İçin Gerekli Tek Şey
**Bir HVAC contractor ile 30 dakika konuş.** 
- Onun gerçek pain point'lerini öğren
- HeatRank'ı göster, neyi sevdiğini neyi sevmediğini söyle
- O konuşmadan 1 gerçek testimonial çıkar
- O testimonial'ı homepage'e koy → 3 sahte gider, 1 gerçek kalır → conversion 5-10x artar

Bu konuşma olmadan yapılan her marketing taktiği boşa kürek çekmek.
