# HeatRank AI — Büyüme Oyun Planı (Türkçe)

> **Tarih:** 2026-05-13
> **Amaç:** İlk 5-10 ödeyen müşteriye giden somut adımlar. STRATEJI.md = "ne yapacağız"; bu dosya = "tam olarak nasıl".
> **Sahip:** Usame
> **3 paralel iş kolu:**
>   - **C** = Müşteri arama (en aciliyetli, en somut)
>   - **A** = Kendi ürününü kendin için kullanma (gerçek başarı hikayesi için)
>   - **B** = ABD'li danışman bul (güven açığını kapatmak için)

---

## 📖 Sözlük — Bu Dosyada Sık Geçen İngilizce Terimler

| Terim | Türkçe Anlamı |
|---|---|
| **Outreach** | Müşteri adayına soğuk iletişim — DM, email, video atmak |
| **Loom** | Ekran kayıt + yüz/sesinle açıklama yapma uygulaması (loom.com) — kişisel video kaydı için |
| **DM** (Direct Message) | LinkedIn / Facebook / Instagram'da kişiye gönderilen özel mesaj |
| **GBP** (Google Business Profile) | Google İşletme Profili — Maps'te görünen yer |
| **GSC** (Google Search Console) | Google'ın site sahiplerine verdiği panel — kaç tıklama aldı, hangi keyword ile rank |
| **Map Pack** | Google'da arama yapınca harita üstünde gösterilen 3 işletme bloğu |
| **Local Pack** | Map Pack ile aynı şey |
| **Schema Markup** | Sitenin HTML'ine eklenen yapısal etiketler — Google'a "biz HVAC firmasıyız, telefon şu, adres bu" der |
| **Backlink** | Başka sitelerden senin sitene gelen bağlantı (SEO için kritik) |
| **Audit** | Site denetimi — SEO açısından nelerin eksik/yanlış olduğu raporu |
| **Baseline** | Başlangıç ölçümü — sonra ilerlemeyi karşılaştırmak için |
| **Dogfood** | Kendi ürününü kendi işin için kullanma (Silikon Vadisi tabiri: "dog food yemek") |
| **Case Study** | Vaka çalışması — gerçek müşterinin sonuçlarını anlatan başarı hikayesi |
| **Pitch** | Satış konuşması / sunumu |
| **Demo** | Ürün gösterimi — canlı veya video ile |
| **Lead** | Potansiyel müşteri (henüz ödememiş ama ilgili) |
| **Cohort** | Grup, küme — örn. "ilk müşteri kohortu" = ilk müşteri grubu |
| **Tier** | Katman / Seviye (Tier 1 = ilk öncelikli grup) |
| **Conversion** | Dönüşüm — ziyaretçinin müşteriye dönmesi |
| **ICP** (Ideal Customer Profile) | İdeal müşteri profili — kimi hedefliyoruz |
| **Follow-up** | Takip mesajı — ilk mesaja cevap gelmezse atılan ikinci/üçüncü mesaj |
| **CPC** (Cost Per Click) | Reklam tıklama başına maliyet (Google/Meta Ads metriği) |
| **CTR** (Click Through Rate) | Tıklama oranı = tıklama ÷ gösterim |
| **MRR** (Monthly Recurring Revenue) | Aylık yinelenen gelir — SaaS metriği |
| **Churn** | Müşteri kaybı oranı — kaç % müşteri her ay iptal ediyor |
| **Vest / Cliff** | Hisse haklarının zamanla kazanılması (Vest) ve önce beklenen süre (Cliff) |
| **Advisory Equity** | Danışmanlara verilen küçük hisse payı (%0.25-1 arası) |
| **FAST** (Founder/Advisor Standard Template) | ABD'de yaygın kullanılan danışman sözleşme şablonu |
| **HARO** (Help A Reporter Out) | Gazetecilere ücretsiz uzman görüşü verip karşılığında haberde adı geçme platformu |
| **B2B / B2C** | İşletmeden işletmeye satış / İşletmeden son tüketiciye satış |
| **TAM** (Total Addressable Market) | Toplam adreslenebilir pazar büyüklüğü |
| **Onboarding** | Yeni müşterinin ilk kullanım süreci (ürünü tanıma, ilk değer alma) |

---

## C — 30 HVAC Sahibine Soğuk İletişim (Outreach)

**Hedef:** Her HVAC sahibi için 5 dakikalık kişiselleştirilmiş Loom video çek, sonra LinkedIn veya Facebook'tan mesaj at. Bu yöntem soğuk emaildan 5-10x daha yüksek cevap alır.

### C.1 Hedef Şehirler

Mevcut [şehir landing page](src/app/(marketing)/hvac-seo)'lerinle uyumlu, sıcak iklimli şehirlere öncelik. **Mayıs-Eylül peak HVAC sezonu** — bu pencerede acele.

**Tier 1 — Bu hafta 5 firma seç:**
| Şehir | Eyalet | Neden öncelikli |
|---|---|---|
| Dallas | Teksas | En büyük HVAC pazarı, mevcut landing page var |
| Houston | Teksas | Yıl boyu klima ihtiyacı |
| Phoenix | Arizona | Yaz 45°C, klima zorunlu |
| Miami | Florida | Yıl boyu nem + klima |
| Tampa | Florida | Hurricane sonrası HVAC tamir patlaması |

**Tier 2 — Sonraki 10:**
Austin TX, San Antonio TX, Atlanta GA, Orlando FL, Jacksonville FL, Las Vegas NV, San Diego CA, Sacramento CA, Charlotte NC, Raleigh NC

**Tier 3 — Hacim için sonraki 15:**
Indianapolis IN, Columbus OH, Nashville TN, Birmingham AL, Memphis TN, Tulsa OK, Oklahoma City OK, Kansas City MO, St Louis MO, Louisville KY, Greenville SC, Charleston SC, Savannah GA, Mobile AL, Jackson MS

### C.2 Hedef Firma Profili (kimi seçeceksin)

Her şehirde **6 firma** seç. Uyumluluk kriterleri:

✅ **Seç:**
- 2-15 çalışan (LinkedIn şirket sayfasından bak)
- Google İşletme Profili var **ama** 4.0-4.5 yıldız arası → düzeltme alanı var
- Yorum sayısı 20-150 arası → yeni başlamamış ama büyük zincir de değil
- Kendi web sitesi var (Yelp veya Angi profili değil)
- Sahibi LinkedIn'de aktif (son 30 günde post veya beğeni)
- En az 3 yaşında firma → kararlı, geliri var

❌ **Diskalifiye:**
- 1000+ yorumu olan zincir firmalar → büyük, pazarlama departmanı var
- 4.9 yıldız + 200+ yorum → zaten her şeyi doğru yapıyor
- Yelp profilini web sitesi olarak gösteren → SEO'ya hazır değil
- "We Buy Houses" gibi karışık çoklu iş yapan

### C.3 Firma Bulma — 1 Saatte 30 Firma

1. Google Maps: `HVAC contractor [şehir adı]` ara
2. Map pack ve sonraki top 30 firmayı tara
3. Her firma için **30 saniye değerlendirme**:
   - Yıldız + yorum sayısı (kriterlere uyuyor mu?)
   - Sahibin ismi (GBP profilinde veya site About sayfasında)
   - LinkedIn'de sahibi bul, profilini kaydet
4. **Google Sheets** kur, şu sütunlarla:

```
Şirket | Şehir | Yıldız | Yorum# | Site | Sahip | LinkedIn | FB Sayfa | Notlar
```

### C.4 Loom Video Senaryosu (3-5 Dakika)

> **Loom nedir?** Ücretsiz ekran kayıt aracı (loom.com). Bilgisayar ekranını kayıtla, üstte küçük yüzünden video, sesinle anlat. Otomatik link verir, kullanıcıya gönderirsin.

**Yüzünün görünmesi şart değil — sadece ses + ekran paylaşımı da yeterli.**

#### Türkçe Akışın Nasıl Olacağı

1. **Açılış (15 saniye):** Selam ver, firma ismini söyle, "satış yapmıyorum, öğrenmeye geldim" de
2. **Onların GBP'sini incele (90 saniye):** Ekranda Maps'i aç, 3 spesifik düzeltme söyle
3. **Tool demo (60 saniye):** HeatRank'ı 30 saniye göster
4. **Yumuşak istek (30 saniye):** "Demo veya 15dk görüşme?" de — zorlama
5. **Kapanış (15 saniye):** Teşekkür et

#### İngilizce Konuşma Metni (Loom'da söyleyeceğin)

**Açılış:**
```
Hi [Owner First Name], I'm Usame from HeatRank AI. Don't worry —
I'm not selling. I spent 20 minutes looking at [Company Name]'s
Google presence because we built a tool specifically for HVAC
contractors and I want to learn from real owners. Here's what
I found.
```

**Türkçesi:** *"Selam [Sahip Adı], ben HeatRank AI'dan Usame. Korkmayın, satış yapmıyorum. 20 dakika [Firma Adı]'nın Google görünürlüğüne baktım. HVAC firmaları için bir araç geliştirdik ve gerçek sahiplerden öğrenmek istiyorum. İşte bulduklarım."*

**GBP'lerini ekranda göster, 3 spesifik öneri ver:**
```
OK so here's [Company Name] on Google Maps. I see [X] reviews,
[Y] rating. Three things I'd fix today:

1. Your last review reply was 3 weeks ago. Replying within 24
   hours signals 'active business' to Google's algorithm and
   moves you up the local pack.

2. You don't have a service area set. Add Dallas plus 6 surrounding
   zip codes — your competitor [Name] does and that's why they
   outrank you in [neighborhood].

3. Your business hours don't show Saturday — competitor [Name]
   does. HVAC emergencies are 40% weekend. Google prioritizes
   'open now' results.
```

**Türkçesi (özet):** *"İşte [Firma] Google Maps'te. [X] yorum, [Y] yıldız var. Bugün düzelteceğim 3 şey:
1. Son yorum cevabınız 3 hafta önceydi. 24 saat içinde cevaplamak Google'a 'aktif iş' sinyali verir, sizi local pack'te yukarı taşır.
2. Hizmet alanınız tanımlı değil. Dallas + 6 çevre posta kodu ekleyin — rakip [İsim] yaptı, bu yüzden [mahalle]'de sizi geçiyor.
3. İş saatlerinizde Cumartesi yok — rakip [İsim]'de var. HVAC acil durumlarının %40'ı haftasonu. Google 'şu an açık' sonuçlarını öne çıkarır."*

**Tool demo (kısa):**
```
I built a tool that does this analysis automatically — connects
to your Google Business Profile, runs the audit, gives you a
one-page checklist. 30-second demo: [Show product: connect GBP
→ review feed → SEO audit checklist].
```

**Türkçesi:** *"Bu analizi otomatik yapan bir araç geliştirdim — Google İşletme Profilinize bağlanır, denetim çalıştırır, tek sayfa kontrol listesi verir. 30 saniye demo: [Ürünü göster]."*

**Yumuşak istek:**
```
If this is useful, here's a 14-day free trial: heatrankai.com.
No credit card, 30-day money-back guarantee.

But honestly, I'd love 15 minutes of your time to learn about
your HVAC SEO challenges — what you've tried, what didn't work.
Reply with 'yes' and I'll send a 3-question survey, or grab a
slot: [Calendly link].
```

**Türkçesi:** *"Faydalı bulduysanız, 14 gün ücretsiz deneme: heatrankai.com. Kredi kartı yok, 30 gün para iade garantisi. Ama dürüst olmam gerekirse, 15 dakikanızı isteyebilir miyim? HVAC SEO ile yaşadığınız zorlukları öğrenmek istiyorum. 'Evet' yazın 3 soruluk anket gönderirim, ya da takvimden seçin: [Calendly linki]."*

**Kapanış:**
```
Either way, thanks for watching. Hope the 3 fixes help. — Usame
```

**Türkçesi:** *"Her durumda izlediğiniz için teşekkürler. Umarım 3 düzeltme işinize yarar. — Usame"*

#### Üretim İpucu
Her video 4-5 dakikada üretilir. 30 video = 2-3 saat. Senaryo aynı — sadece firma adı + 3 spesifik düzeltme değişiyor. Hızlandırmak için tek bir "boilerplate" Loom kayıt, sonra her firmaya özel sadece "3 düzeltme" kısmını yeniden çek.

### C.5 LinkedIn Mesaj Şablonu

> **Ne diyor:** Video kaydettim, 3 düzeltme buldum, ücretsiz, satış değil.

```
Hi [Name],

Recorded a 5-min video looking at [Company]'s Google presence —
found 3 quick fixes you could do today to bring in more local
calls.

Free, no pitch: [Loom link]

— Usame
heatrankai.com
```

### C.6 Facebook Sayfa Mesaj Şablonu (daha samimi)

> **Ne diyor:** Aynı içerik ama daha rahat dil — HVAC sahipleri Facebook'tan yönetiyor.

```
Hey [Company Name] team!

Made a quick video looking at your Google Maps presence and
spotted 3 easy fixes to bring in more local calls. Sharing
free, no pitch:

[Loom link]

If it's useful, I run a small SEO tool built specifically
for HVAC contractors. heatrankai.com.
```

### C.7 Email Şablonu (eğer GBP veya web sitesinde public email varsa)

> **Ne diyor:** Aynı içerik, email format.

```
Subject: 3 quick fixes for [Company] on Google Maps

Hi [Name],

Spent 20 minutes looking at [Company]'s Google presence this
morning and recorded a 5-min Loom with 3 specific fixes you
can make today:

[Loom link]

Free, no pitch — I run heatrankai.com, an SEO tool built for
HVAC.

— Usame
```

### C.8 Takip Şeması (Follow-up)

| Gün | Aksiyon | İngilizce |
|---|---|---|
| **0. gün** | Loom video + ilk mesaj | Initial outreach |
| **3. gün** | Hatırlatma mesajı | *"Hey, did the video help? Happy to send the actual checklist if you'd rather text."* — "Video işine yaradı mı? İstersen yazılı kontrol listesi de gönderebilirim." |
| **7. gün** | Son nazik mesaj | *"No pressure — closing the loop. If timing's not right, send 'pause' and I'll stop messaging."* — "Baskı yok, son mesaj. Zaman uygun değilse 'pause' yaz, dururum." |
| **14. gün** | Tamamen bırak, başka firma | — |

### C.9 Beklenen Sayılar (Matematik)

- 30 outreach × 4 dk üretim = **2 saat çalışma**
- Loom + DM kombinasyonu cevap oranı: **%15-30** (soğuk email %1-3 vs.)
- Beklenen cevap: **5-10 kişi**
- Demo ayarlama: **3-5 kişi**
- Ücretsiz deneme kaydı: **2-4 kişi**
- Ödeyen müşteri: **1-2 kişi**

**Hedef:** 5 ödeyen müşteriye ulaşmak için **~100-150 outreach** (4-6 hafta yoğun çalışma). İlk 30 = test grubu — mesajları + senaryoyu bu grupta optimize et.

### C.10 Takip Tablosu

Google Sheets'te ek sütunlar:
```
Loom Kaydedildi | Gönderim Tarihi | Cevap Tarihi | Demo Ayarlandı | Trial Kayıt | Ödedi
```

Her Pazartesi: gönderildi / cevap / demo / trial / ödeme oranları.

---

## A — Kendi Ürününü Kendi İçin Kullan (Dogfood)

**Neden?** heatrankai.com'u kendi tool'unla yönetince **30 gün içinde gerçek bir başarı hikayesi** elde edersin. Bu hikaye, anasayfadaki 3 sahte testimonial'ın yerini alır.

### A.1 Onboarding (15 dakika)

heatrankai.com'a kendi hesabınla gir → /onboarding adımlarını tamamla:

- **Business name:** HeatRank AI
- **Service location:** United States (geniş tut, çünkü hedef tüm ABD)
- **Website URL:** https://www.heatrankai.com
- **Target keywords (7 tane):**
  1. `hvac seo software` (HVAC SEO yazılımı)
  2. `local seo for hvac contractors` (HVAC müteahhitleri için yerel SEO)
  3. `hvac google business profile optimization` (HVAC GBP optimizasyonu)
  4. `hvac contractor marketing software` (HVAC pazarlama yazılımı)
  5. `hvac near me ranking tool` (yakınımdaki HVAC sıralama aracı)
  6. `ai seo for hvac` (HVAC için AI SEO)
  7. `hvac local pack ranking` (HVAC yerel paket sıralaması)

### A.2 Google İşletme Profili Kurulumu (opsiyonel ama önerilen)

Eğer HeatRank AI için GBP yoksa:
- business.google.com → "Add business"
- **Kategori:** Software company
- **Adres:** ofis varsa adres, yoksa "service area only" (sadece hizmet alanı)
- **Service area:** United States — geniş tutmak çünkü hedef ABD HVAC

Bu adım atlanırsa: kendi ürününün rank tracking + GBP bağlantı özelliklerini test edemezsin.

### A.3 Başlangıç Ölçümleri — 0. Gün (Screenshot Al)

| Ölçüm | Nereden | Kaydet |
|---|---|---|
| 7 keyword sıralaması | HeatRank Rank Tracker | Screenshot |
| Gösterim sayısı (son 28 gün) | Google Search Console | Screenshot |
| Tıklama sayısı (son 28 gün) | GSC | Screenshot |
| SEO denetim puanı | HeatRank SEO Audit | Screenshot |
| İndekslenmiş sayfa sayısı | GSC > Coverage | Sayı |
| Backlink sayısı | Ahrefs free veya Moz Link Explorer | Sayı |

### A.4 30 Gün İçinde Yapacakların

- **1. hafta:** SEO denetiminden çıkan 3 critical (kritik) item'ı düzelt — title etiketleri, meta açıklamaları, schema markup
- **2. hafta:** 1 yeni keyword-odaklı sayfa yaz (örn. `/hvac-seo-software`), Google'a indekslet
- **3. hafta:** 3 backlink kaynağı kur (HARO + Twitter biyografi + LinkedIn şirket sayfası)
- **4. hafta:** Rank snapshot'ı tekrar al, başlangıçla karşılaştır

### A.5 30. Gün — Case Study Çıktısı

**Başlık (İngilizce):** "How HeatRank Ranked Itself in the Top 3 for 'HVAC SEO Software' in 30 Days"

**Türkçesi:** "HeatRank kendini 30 günde 'HVAC SEO Software' aramasında ilk 3'e nasıl çıkardı"

**Yapı:**
- 3 metrik kartı: sıralama değişimi / tıklama artışı / denetim puanı artışı
- 3 ekran görüntüsü: önce / orta / sonra
- 5 spesifik aksiyon (tam olarak ne yaptın)
- "Aynı aracı dene" çağrısı

**Bu yazı /case-studies sayfasındaki ilk gerçek vakaya dönüşür** — 3 sahte hikayenin yerini alır.

### A.6 Haftalık İlerleme Tablosu

```
Hafta | Yapılan İş | Rank Snapshot | SEO Puan | Notlar
W0    | Baseline   | -             | -        | -
W1    | ...
W2    | ...
W3    | ...
W4    | ...
```

---

## B — ABD'li HVAC Danışmanı Bul (Trust Açığı Kapansın)

**Neden?** Sen Türkiye'desin. ABD HVAC sahibi senden çekinir. Profilinde "Advised by [ABD'li HVAC veteranı]" yazınca **güven %50 artar**, yatırım: %0.5-1 hisse.

### B.1 Hedef Profil — 3 Katman

| Katman | Profil | LinkedIn'de Aramak İçin |
|---|---|---|
| **Tier 1** (en değerli) | Emekli/transition olmuş HVAC sahibi (10+ yıl), ABD'li | `"Former owner" HVAC` veya `"Retired HVAC owner"` |
| **Tier 2** | HVAC pazarlama danışmanı (5+ yıl tecrübe) | `"HVAC marketing consultant"` veya `"HVAC marketing strategist"` |
| **Tier 3** | HVAC sektör veterans (operasyon, dağıtım, eğitim) | `"HVAC industry advisor"` veya `"HVAC business coach"` |

### B.2 LinkedIn Aramasında Kullanılacak Filtreler

- **Anahtar kelime:** yukarıdaki tırnak içi ifadeler
- **Lokasyon:** United States
- **Bağlantı:** 2. + 3. derece (soğuk outreach için)
- **Aktivite:** "Posted within last 30 days" (aktif olanlar)
- **Sektör:** "Construction" veya "Consumer Services"

LinkedIn Sales Navigator (aylık $99) gerekli değil — ücretsiz LinkedIn yeterli. **30 profili 1 saatte tarayabilirsin.**

### B.3 3 Adımlı Outreach

#### Adım 1: Bağlantı isteği (kişiselleştirilmiş not)

> **Ne diyor:** Profilini gördüm, geçmişin ilgimi çekti, HeatRank kurdum, sektör tecrübeni dinlemek isterim.

```
Hi [Name],

Came across your profile — your work at [Company/Role] caught
my attention. I'm building HeatRank AI, an SEO platform for
HVAC contractors, and would love to learn from someone with
your background.

Mind if we connect?

— Usame
```

#### Adım 2: Bağlantı kabul edilince — 24-48 saat sonra DM

> **Ne diyor:** Şirketten kısa bahis, "1 danışman arıyorum, çeyrek saat/quarter, %0.5-1 hisse, 20dk görüşme?"

```
Thanks for connecting, [Name]!

Quick context: HeatRank AI is a self-serve SEO tool built for
HVAC contractors. Launched in [month] 2026.

I'm looking for one HVAC industry advisor to help us with:

  1. Sense-checking our positioning with real HVAC owners
  2. Pointing out 1-2 things we don't see from inside the product

Low commitment: 1 hour/quarter, advisory equity (0.5-1%), no
day-to-day work. Open to a 20-min intro call this week?

Either way, I'd value your perspective.

heatrankai.com

— Usame
```

#### Adım 3: Evet derse → 20 dakikalık Zoom

- Ürünü göster (5 dakika)
- 3 soru sor:
  1. *"HVAC sahiplerinin yaptığı 1 numaralı pazarlama hatası ne?"*
  2. *"Benim yerimde olsan ne yapmazdın?"*
  3. *"Ağındaki kim bu araçtan faydalanır?"*
- Danışmanlık teklif et: *"İşte sözleşme, acele yok, 1 hafta düşün."*

### B.4 Hedef Sayılar

- **20 LinkedIn DM** gönder
- Beklenen bağlantı kabul: **%30-50** → 8-10 kabul
- Beklenen DM cevabı: kabul edenlerin %30-50'si → 3-5 cevap
- Beklenen danışman onboardu: **1-2** (yeterli, fazlasına gerek yok)

### B.5 /about Sayfa Placeholder'ı

Danışman onboard olunca [src/app/(marketing)/about/page.tsx]'e şu eklenecek:

```
## Advised by

[Foto] [Ad Soyad]
Former owner of [Şirket Adı] (1995-2018, $4M yıllık gelir)
[1 cümle danışman görüşü]
```

Bu tek hamle, Türkiye founder identity sorununun **%50'sini** çözer.

### B.6 Hukuki Not

ABD'de danışmanlık sözleşmesi için standart şablon: **FAST** (Founder/Advisor Standard Template) — Founder Institute tarafından ücretsiz hazırlanmış.

- **Hisse oranı:** %0.25-1, 24 ay üzerinden hak ediş (vesting)
- **Cliff yok:** Hemen başlar
- **Trigger:** Aylık minimum 1 saat iletişim

**Şablon linki:** https://www.fi.co/fast

---

## 🎯 Üç İş Kolunun Önceliklenmesi

| İş Kolu | Etki | Süre | Bu Hafta Yapılacak |
|---|---|---|---|
| **C — Outreach** | İlk müşterinin kaynağı | 4-6 hafta | İlk 5 firma seç, 5 Loom kaydet, 5 mesaj gönder |
| **A — Dogfood** | Gerçek case study | 30 gün | Onboarding + başlangıç ölçümleri (1 saat) |
| **B — Advisor** | Güven açığını kapatır | 1-2 hafta | 20 LinkedIn DM gönder |

**Bu haftaki toplam zaman yatırımın:** ~6-8 saat (büyük kısmı C'deki Loom üretimi). A ve B "gönder ve bekle" pattern'ı, paralel yürür. C aktif zaman ister.

---

## 📅 Haftalık Kontrol Şablonu

Her Pazartesi sabahı 15 dakika:

```
HAFTA [N] — [tarih aralığı]

C-Outreach:
  Loom kaydedildi: __ / 30
  DM gönderildi:    __
  Cevap geldi:      __
  Demo ayarlandı:   __
  Trial kayıt:      __
  Ödeyen:           __

A-Dogfood:
  Bu hafta aksiyon: ____________
  Rank değişimi:    ____________
  SEO puan:         ____________

B-Advisor:
  LinkedIn DM:      __ / 20
  Bağlantı kabul:   __
  DM cevap:         __
  Onboarded:        __

Engel: ____________________
Sonraki hafta: ____________________
```

---

## ❌ Yapma Listesi (Bu Playbook'tan Dışarıda Kalanlar)

- ❌ **Toplu soğuk email** (HVAC sahibi email açmıyor — Facebook DM > email)
- ❌ **Telefonla satış** (Türkiye'den ABD'ye telefon güven kırıcı)
- ❌ **Ücretli reklam** (henüz değil — 5 müşteri + 1 testimonial olunca)
- ❌ **Yeni özellik ekleme** (ürün hazır, eksik olan dağıtım)
- ❌ **Plumbing/elektrik genişlemesi** (niche kalkanı, 50 müşteri sonra)
- ❌ **Reddit'te kendini öne çıkarmak** (banlattırır — sadece değerli cevaplar ver)

---

## ❓ Anlamadığın Bir Terim mi Var?

Sözlüğe ekleyebilirim. Hangi kelimeyi/cümleyi açıklayayım, söyle.
