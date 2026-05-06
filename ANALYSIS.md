# HVAC SEO Bot — Proje Analizi, Strateji & Yol Haritası
> **Tarih: 2026-05-02 | Son güncelleme: tüm sayfalar incelendi, fiyatlandırma güncellendi.**

---

## ⚡ HEMEN YAPILACAKLAR (Bu Hafta)

| # | Aksiyon | Sayfa | Süre | Neden Acil |
|---|---|---|---|---|
| 1 | Settings Billing tab: "$49" → "$69" + yeni plan adları | Settings | 15 dk | Fiyat tutarsızlığı — landing page $69, settings hâlâ $49 |
| 2 | Settings Usage tab: FREE limitleri güncelle (2 kw → 1, 5 reply → 3) | Settings | 15 dk | Yeni Starter limitleriyle tutarsız |
| 3 | "Billing is coming in Phase 6" mesajını kaldır | Settings | 5 dk | Internal roadmap müşteriye görünmemeli |
| 4 | "Phase 4" label kaldır | Rank | 5 dk | İç etiket müşteriye gösterilmez |
| 5 | "Phase 3.4" mesajı kaldır | Reviews | 5 dk | Aynı sorun |
| 6 | LemonSqueezy hesabı aç, API key al | — | 30 dk | Ödeme alamıyorsun |
| 7 | Mobil responsive pass — tüm sayfalar 390px'de test | Tümü | 2-3 saat | Hedef kitle %70+ mobil |
| 8 | `loading.tsx` skeleton dosyaları ekle | Tümü | 1 saat | Server fetch sırasında beyaz ekran |
| 9 | `error.tsx` eksik sayfalar: `/rank`, `/schema`, `/settings` | Tümü | 30 dk | Crash = beyaz ekran |

---

## 📊 KISA VADE (2 Hafta)

| # | Aksiyon | Öncelik |
|---|---|---|
| 1 | LemonSqueezy/Stripe entegrasyonu — ödeme alma | ⭐⭐⭐ |
| 2 | 14-day trial logic: signup → `trial_ends_at` column → middleware freeze | ⭐⭐⭐ |
| 3 | Onboarding wizard: Profile → Add Business → Generate Keywords → Done | ⭐⭐ |
| 4 | `/dashboard/businesses/[id]` detail page | ⭐⭐ |
| 5 | 3 HVAC Facebook grubuna katıl, "free audit" postla | ⭐⭐ |

## 📅 ORTA VADE (1 Ay)

| # | Aksiyon |
|---|---|
| 1 | SEO Crawler (Phase 5) — en çok istenen 2. feature |
| 2 | PDF Reports (Phase 7) — retention silahı |
| 3 | Multi-business support: rank + schema sayfalarına business selector |
| 4 | Blog/content marketing: "HVAC SEO keywords for [city]" AI-generated pages |
| 5 | Email onboarding sequence (Resend): Day 1, 3, 7, 12 |

---

# BÖLÜM 1: PAZAR & REKABETANALİZİ

## 🏪 Pazar Büyüklüğü

| Metrik | Değer | Kaynak |
|---|---|---|
| ABD'deki HVAC firması sayısı | ~120,000+ | IBISWorld, BLS |
| Yıllık HVAC pazar büyüklüğü (ABD) | ~$31B (2025) | Grand View Research |
| Dijital marketing harcayan HVAC oranı | ~35-40% | Contractor Commerce Survey |
| Ortalama ajans SEO maliyeti | $1,500–$5,000/ay | Clutch.co |
| Self-serve SEO tool bütçesi | $29–$99/ay | Semrush SMB data |

## TAM / SAM / SOM

```
TAM = 120,000 firma × $69/ay × 12 = ~$99M/yıl
SAM = ~40,000 (dijital marketing yapanlar) × $69 × 12 = ~$33M/yıl
SOM (ilk yıl gerçekçi) = 200 ödenen kullanıcı × $69 × 12 = ~$165,600/yıl
```

200 ödenen kullanıcı ilk yıl için zorlu ama ulaşılabilir. **$10K MRR (≈150 kullanıcı × $69) solo founder için çok iyi.**

## Rekabet Analizi

| Rakip | Güçlü Yanı | Zayıf Yanı | Fiyat |
|---|---|---|---|
| **BrightLocal** | Tam local SEO suite, köklü | Generic (tüm sektörler), pahalı | $39–$79/ay |
| **Whitespark** | Citation tracking | Sadece citation, UI eski | $20–$100/ay |
| **ServiceTitan** | Tam iş yönetimi | Çok büyük, çok pahalı, SEO yüzeysel | $250+/ay |
| **Podium** | Review management, messaging | Çok pahalı, lock-in | $399+/ay |
| **Broadly** | Review + invoice | SEO yok | $249+/ay |
| **Sen** | HVAC-spesifik, AI-first, ucuz | Yeni, tek geliştirici, küçük feature set | $69/ay |

### Senin Avantajların
1. **Niş odak** — HVAC'a özel, rakipler generic
2. **AI-first** — Gemini review reply + keyword gen, rakipler ya sunmuyor ya $399'da
3. **Fiyat** — $69/ay = rakiplerin %10-20'si
4. **Solo founder** — burn rate düşük, $10k MRR'da karlısın

### Potansiyel Tehditler

| Tehdit | Olasılık | Etki | Çözüm |
|---|---|---|---|
| BrightLocal "HVAC mode" çıkarır | Düşük | Orta | Niş derinliğiyle yenilmezsin |
| Google GBP API kısıtlaması | Orta | Yüksek | Manuel copy-paste backup sun |
| Gemini API fiyat artışı | Düşük | Orta | OpenAI/Anthropic fallback hazırla |
| Tek geliştirici burnout | **Yüksek** | **Yüksek** | MVP scope'u küçült |

## 💡 Müşteri Kazanım Kanalları

| Kanal | Maliyet | Beklenen ROI | Öncelik |
|---|---|---|---|
| **HVAC Facebook grupları** | $0 | Yüksek — direkt hedef kitle | ⭐ 1 |
| **"HVAC SEO" blog yazıları** | $0 (AI-written) | Orta-Yüksek — 3-6 ay organic | ⭐ 2 |
| **Google Ads: "HVAC SEO tools"** | $5–15/click | Yüksek intent, pahalı | ⭐ 3 |
| **Agency partnership outreach** | $0 | Çok yüksek LTV | ⭐ 4 |
| **AppSumo launch** | Revenue share | Yüksek hacim, düşük LTV | İlk 100 kullanıcı |

**İlk 50 kullanıcı planı:**
1. 5-10 HVAC Facebook grubuna katıl
2. "Free HVAC SEO audit" postla
3. Cevap verenlere "beta tester olur musun, 14 gün free" teklif et
4. Feedback'le ürünü pişir → sonra $69'a geç

---

# BÖLÜM 2: ÖDEME & FİYATLANDIRMA STRATEJİSİ

## 🏢 Ödeme Alma: ABD Şirketi Şart Değil

### Seçenek A: LemonSqueezy (⭐ Önerim)
- **Merchant of Record** — sen şirket kurmuyorsun, onlar satıcı
- Vergi, fatura, PCI, chargebacks hepsini onlar halleder
- Türkiye'den kullanılabilir, Wise/PayPal'a ödeme alırsın
- Komisyon: %5 + $0.50 ($69'dan net: $65.55)
- Next.js webhook desteği var

### Seçenek B: Paddle
- Benzer MoR modeli, %5 + $0.50
- Daha kurumsal, API biraz daha karmaşık

### Seçenek C: Stripe Atlas ($500)
- ABD'de LLC kurar, Stripe açar
- İlk $5K MRR'a kadar gereksiz

**Tavsiye:** LemonSqueezy ile başla → $5K MRR'da Stripe Atlas'a geç.

## 💰 Fiyatlandırma: Decoy Pricing Stratejisi

**Hedef: Pro ($69) planı kullanıcıların %70'ine satmak.**

Starter kasıtlı olarak "sinir bozucu ama ucuz" → kullanıcı düşünsün:
> "$39'a ayda 1 keyword + 3 reply mi? Hiçbir işe yaramaz.
> Pro sadece $30 daha fazla ve HER ŞEY unlimited. Bariz Pro almalıyım."

### Fiyat Matrisi

| Özellik | Starter $39/ay | Pro $69/ay ⭐ | Agency $199/ay |
|---|---|---|---|
| İşletme sayısı | 1 | 5 | Sınırsız |
| AI Keyword üretimi | 1/ay | Sınırsız | Sınırsız |
| AI Review Reply | 3/ay | Sınırsız | Sınırsız |
| SEO Audit | — | Sınırsız | Sınırsız |
| Rank Snapshot | — | Haftalık | Günlük |
| Competitor Tracking | — | 3 rakip | 10 rakip |
| Schema Markup | ✓ (basic) | ✓ (full) | ✓ (full) |
| PDF Reports | — | Haftalık | Günlük |
| White-label | — | — | ✓ |
| Priority Support | — | ✓ | ✓ |

### Yıllık Fiyatlar (~20% indirim)

| Plan | Aylık | Yıllık (aylık) | Yıllık Toplam | Tasarruf |
|---|---|---|---|---|
| Starter | $39/ay | $32/ay | $384/yıl | $84/yıl |
| Pro ⭐ | $69/ay | $55/ay | $660/yıl | $168/yıl |
| Agency | $199/ay | $159/ay | $1,908/yıl | $480/yıl |

### Psikolojik Tasarım Kuralları
1. **Starter kartı = kasıtlı olarak "meh":** Soluk renk, çok "—", ghost buton
2. **Pro kartı = parlak:** "MOST POPULAR" badge, beyaz CTA, tüm satırlar ✓
3. **Agency = prestij ama erişilemez:** "Contact Sales" → kararsızı Pro'ya iter
4. **Yıllık toggle default açık:** Daha yüksek LTV, ~~$69~~ çizili fiyat göster

> ✅ Bu değişiklikler zaten landing page'e uygulandı (PricingToggle component).

## ⏱️ Freemium vs Free Trial

**14 gün free trial seçildi. Model:**

```
📅 14 Gün — Tüm Pro Özellikleri Açık (kredi kartı isteme)
   ↓
⏰ 12. gün: "Trial 2 gün sonra bitiyor" email
   ↓
💳 14. gün: Ödeme sayfasına yönlendir
   ↓
✅ Ödediyse → devam
❌ Ödemediyse → hesap frozen (read-only)
```

---

# BÖLÜM 3: TÜM SAYFALAR DETAYLI İNCELEME

## 1. Dashboard (`/dashboard`)

**Durum:** ✅ Çalışıyor — stats, business form, saved businesses listesi

| Sorun | Fix |
|---|---|
| "Reports Generated: —" boş, değer katmıyor | Report yoksa kartı gizle |
| "Add New Business" CTA mobilde çok altta | Stats strip'in altına taşı |
| Business'a tıklanınca hiçbir yere gitmiyor | `/dashboard/businesses/[id]` linki ekle |
| Saved Businesses mobilde erişilemiyor | Accordion/collapsible yap |

## 2. Reviews (`/reviews`)

**Durum:** ✅ En olgun sayfa — monetization için hazır

- Stats strip (4 kart), filter tabs, review cards, AI reply, GBP connect, rating chart
- Freemium gate çalışıyor (429 → upgrade uyarısı)
- Save Reply + router.refresh() çalışıyor

| Sorun | Fix |
|---|---|
| "Post to Google" → "Phase 3.4 coming" | Kaldır veya "Copy and paste to GBP" yap |
| Platform badge mobilde gizli (`hidden sm:`) | Her zaman göster (küçült) |
| Mock data watermark yok | "SAMPLE DATA" badge ekle |
| Regenerate = +1 usage uyarısı yok | "This uses 1 credit" uyarı ekle |

## 3. Rank Tracker (`/rank`)

**Durum:** 🟡 Mock data ile çalışıyor — live API yok

- Mapbox GL heatmap (5×5 grid), renk kodlaması, trend arrows
- Business card + empty state

| Sorun | Fix |
|---|---|
| **"Phase 4" label sayfada** | Kaldır, "Local SEO" yap |
| Sadece 1 business, 1 keyword | Dropdown selectors ekle |
| "Run Snapshot" butonu yok | Placeholder buton koy |
| Mapbox key client-side? | `.env.local` kontrol et |

## 4. Schema Generator (`/schema`)

**Durum:** ✅ Çok iyi — quick win olarak doğru

- Business selector, real-time JSON-LD preview, copy button
- Phone/address/hours extra fields
- HTML/WordPress embed talimatları

| Sorun | Fix |
|---|---|
| Schema validation butonu yok | "Test with Google" external link ekle |
| Weekend hours yok | Sat checkbox + saat input'u |
| DB'ye kaydetmiyor | Save + versiyon history (sonra) |

## 5. Settings (`/settings`)

**Durum:** ⚠️ Çalışıyor ama fiyat tutarsızlığı var

- 4 tab: Profile ✅, Usage ✅, Billing ⚠️, Danger Zone ✅

| Sorun | Öncelik | Fix |
|---|---|---|
| **Billing: "$49" yazıyor** | ⭐ ACİL | `SettingsTabs.tsx` L271 → "$69" |
| **"Phase 6" mesajı** | ⭐ ACİL | Kaldır |
| **Usage limitleri eski** | ⭐ ACİL | 2 kw → 1, 5 reply → 3 |
| "FREE" badge | Orta | "STARTER" olarak güncelle |

## 6. Landing Page (`/`)

**Durum:** ✅ Güncel — decoy pricing + yıllık toggle uygulandı

| Sorun | Fix |
|---|---|
| Header CTA "Start Free" | "Start Free Trial" yap |
| Testimonials sahte | İlk gerçek kullanıcılardan sonra değiştir |
| Video/GIF demo yok | Dashboard screen recording ekle |

---

# BÖLÜM 4: MOBİL UYUMLULUK

**HVAC owner'lar masaüstünde oturmuyor — %70-80'i telefonda.**

```
06:00 — Kamyonete bin, telefondansın
07:00 — İlk iş yerine git
12:00 — Öğle molası, telefonda review kontrol et
17:00 — İş bitir, kamyonette SaaS'a bak
20:00 — Evde tabletten
```

### Kontrol Edilecek Noktalar
1. **Sidebar** → mobilde bottom nav (✅ zaten yapılmış)
2. **BusinessForm** — input'lar ve tag alanı sığmalı
3. **Rank Heatmap** — touch/pinch-zoom
4. **Review cards** — expand/collapse
5. **Settings tabs** — mobilde sadece ikonlar görünüyor (tooltip ekle)

### Yaklaşım (2-3 saat)
- Her sayfayı Chrome DevTools'ta 390px'de test et
- Overflow → `overflow-x-hidden` + flex-wrap
- Touch target minimum 44×44px
- Font size'ları mobilde biraz büyüt

---

# BÖLÜM 5: MİMARİ İYİLEŞTİRMELER

| # | İyileştirme | Etki | Effort |
|---|---|---|---|
| 1 | `loading.tsx` her route segment'e | Skeleton gösterir, beyaz ekran yok | 1 saat |
| 2 | `error.tsx` `/rank`, `/schema`, `/settings`'e | Crash → graceful error | 30 dk |
| 3 | Supabase generated types | Tip güvenliği, `as` cast'leri kaldır | 30 dk |
| 4 | `gemini.ts` singleton | Tek yerden yönet | 30 dk |
| 5 | Rate limit IP bazlı | Abuse prevention | 1 saat |

---

# BÖLÜM 6: EN BÜYÜK RİSK — FEATURE BLOAT

> **9 phase, ~60+ feature, 1 developer. Hepsini bitirmek ~12-18 ay.**
> Ama pazarda ilk 3 ay kritik — ya kullanıcı çekiyorsun ya projeyi bırakıyorsun.

### Monetizable MVP = Phase 1 + 3 + 6

| Parça | Durum |
|---|---|
| Landing page | ✅ Done |
| Review Engine + AI Reply | ✅ %80 done |
| Stripe/LemonSqueezy paywall | ❌ Henüz yok — **en acil eksik** |

Phase 4 (Rank), Phase 5 (Crawler), Phase 9 (Citations, Schema) güzel ama **para ödemek isteyen kimse bunları beklemiyor.** İlk ödeme review reply'dan gelecek.

---

# BÖLÜM 7: 6 AYLIK SPRINT PLANI

| Ay | Odak | Hedef |
|---|---|---|
| **1** | Ödeme + Trial + İlk Kullanıcılar | LemonSqueezy entegre, 14-day trial, 50 beta user |
| **2** | Review Engine polish + GBP approval | Production GBP, gerçek review data, ilk ödeme |
| **3** | SEO Crawler + Citations MVP | Phase 5 + 9.1 — feature set genişle |
| **4** | Rank Tracker live + Competitors | Phase 4 — "wow" feature, Pro retention |
| **5** | PDF Reports + Agency tier push | Phase 7 + 9.5 — agency outreach |
| **6** | Admin dashboard + Automation | Phase 8 + 9.3 — operasyonel olgunluk |

---

> **Sonuç:** Proje çok mantıklı. Gerçek bir ağrı noktası, doğru fiyat, modern tech stack.
> **En kritik eksik: ödeme entegrasyonu.** Onu bitir, ilk 50 beta user'ı topla, gerisini gelir geldikçe yap.
