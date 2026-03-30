# 📡 DevOps Radar

> IT sektörünü gerçek zamanlı izlemek için açık kaynak platform.  
> DevOps, Kubernetes, Cloud Native, CI/CD, SRE ve daha fazlası — tek platformda.

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://baybarse.github.io/devops-radar/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![RSS Sources](https://img.shields.io/badge/RSS%20Sources-18+-blue)](scripts/fetch-feeds.js)
[![Auto Update](https://img.shields.io/badge/Auto%20Update-Every%206h-orange)](.github/workflows/fetch-feeds.yml)

🌐 **Canlı Site:** https://baybarse.github.io/devops-radar/

---

## 🚀 Özellikler

- 📰 **18+ RSS Kaynağı** otomatik olarak çekilir (The New Stack, CNCF, Kubernetes, HashiCorp…)
- ⏱️ **Her 6 saatte bir** GitHub Actions ile otomatik güncelleme
- 🔍 **Gerçek zamanlı arama** ve kategori filtreleme
- 📊 **Sektör istatistikleri** (DORA, CNCF, Flexera verilerinden)
- 🔧 **DevOps araç rehberi** (CI/CD, IaC, Observability, Security…)
- 📚 **Öğrenme kaynakları** (kitaplar, kurslar, podcast, sertifikasyonlar)
- 🌙 **Koyu/Açık tema** desteği
- 📱 **Tam responsive** (mobil, tablet, masaüstü)
- ⚡ **Sıfır bağımlılık** frontend (vanilla JS, CDN fontları)
- 🆓 **Tamamen ücretsiz** (GitHub Pages)

---

## 📁 Proje Yapısı

```
devops-radar/
├── index.html                    # Ana sayfa (tek sayfalık uygulama)
├── assets/
│   ├── css/
│   │   └── style.css             # Tüm stiller
│   └── js/
│       └── app.js                # Uygulama mantığı (feed yükleme, filtreleme, arama)
├── data/
│   └── feeds.json                # ← GitHub Actions tarafından oluşturulur
├── scripts/
│   └── fetch-feeds.js            # RSS çekme scripti (Node.js)
├── .github/
│   └── workflows/
│       ├── fetch-feeds.yml       # RSS güncelleme (her 6 saatte)
│       └── deploy-pages.yml      # GitHub Pages deploy
├── package.json
├── sitemap.xml                   # SEO: Google için site haritası
├── robots.txt                    # SEO: Arama motoru yönergeleri
└── README.md
```

---

## ⚡ Kurulum (Adım Adım)

### 1. Repo'yu Fork veya Clone Et

```bash
# Seçenek A: Fork (GitHub'da fork düğmesine bas)
# Seçenek B: Clone ve yeni repo oluştur
git clone https://github.com/baybarse/devops-radar.git
cd devops-radar
```

### 2. GitHub Repo Oluştur

1. [github.com/new](https://github.com/new) adresine git
2. Repository adı: `devops-radar`
3. **Public** olarak ayarla (GitHub Pages için zorunlu)
4. README oluşturma (zaten var)
5. **Create repository** düğmesine bas

### 3. Kodu Push Et

```bash
git init
git add .
git commit -m "🚀 ilk commit: DevOps Radar"
git branch -M main
git remote add origin https://github.com/baybarse/devops-radar.git
git push -u origin main
```

### 4. GitHub Pages'i Aktif Et

1. Repo'da **Settings** → **Pages** bölümüne git
2. **Source**: `GitHub Actions` seç
3. Kaydet

### 5. `baybarse` Değerlerini Güncelle

Şu dosyalarda `baybarse` yerine GitHub kullanıcı adını yaz:

```bash
# Toplu bul-değiştir (macOS/Linux):
find . -type f \( -name "*.html" -o -name "*.xml" -o -name "*.txt" -o -name "*.json" \) \
  -exec sed -i 's/baybarse/SENIN_KULLANICI_ADIN/g' {} +

# Windows (PowerShell):
Get-ChildItem -Recurse -Include *.html,*.xml,*.txt,*.json |
  ForEach-Object { (Get-Content $_) -replace 'baybarse','SENIN_KULLANICI_ADIN' | Set-Content $_ }
```

### 6. İlk Veriyi Manuel Oluştur

GitHub Actions'ın ilk çalışması için:
1. **Actions** sekmesine git
2. **🔄 RSS Feed Güncelle** workflow'unu seç
3. **Run workflow** → **Run** düğmesine bas
4. ~2-3 dakika bekle

### 7. Siteyi Kontrol Et

`https://baybarse.github.io/devops-radar/` adresine gir.

---

## 🔧 Yerel Geliştirme

```bash
# Bağımlılıkları yükle
npm install

# Yerel sunucu başlat
npm run dev
# → http://localhost:3000

# Feed'i manuel güncelle (Node.js gerekli)
npm run fetch
```

---

## ➕ Yeni RSS Kaynağı Ekle

`scripts/fetch-feeds.js` dosyasındaki `FEEDS` dizisine ekle:

```javascript
{
  name: 'Kaynak Adı',
  url: 'https://example.com/feed.xml',
  category: 'DevOps',   // Mevcut kategorilerden seç
  description: 'Açıklama',
},
```

**Mevcut kategoriler:**
`DevOps`, `Kubernetes`, `Cloud Native`, `IaC`, `Containers`, `Security`, `Observability`, `Architecture`, `AI/MLOps`

---

## 🌍 SEO Rehberi (Ücretsiz Google Sıralaması)

### Teknik SEO (Zaten dahil)
- ✅ `sitemap.xml` — Google'ın sayfaları bulması için
- ✅ `robots.txt` — Arama motoru yönergeleri
- ✅ Open Graph ve Twitter Card meta tags
- ✅ JSON-LD Structured Data (Schema.org)
- ✅ Canonical URL
- ✅ Semantic HTML (`<header>`, `<main>`, `<section>`, `<article>`)
- ✅ Hızlı yükleme (static site, CDN fontları)

### Manuel SEO Adımları
1. **Google Search Console'a ekle:**
   - [search.google.com/search-console](https://search.google.com/search-console)
   - Site ekle → HTML tag doğrulama
   - Sitemap'i gönder: `https://baybarse.github.io/devops-radar/sitemap.xml`

2. **Bing Webmaster Tools:**
   - [bing.com/webmasters](https://www.bing.com/webmasters)
   - Aynı adımları uygula

3. **Sosyal medya:**
   - Twitter/X, LinkedIn'de paylaş
   - r/devops, r/kubernetes subredditlerinde tanıt
   - Dev.to ve Hashnode'da blog yazısı yaz

---

## 📊 Veri API

`data/feeds.json` dosyası herkese açıktır ve JSON API olarak kullanılabilir:

```
GET https://baybarse.github.io/devops-radar/data/feeds.json
```

```json
{
  "lastUpdated": "2025-01-15T06:00:00.000Z",
  "totalItems": 287,
  "totalSources": 18,
  "successSources": 17,
  "categoryStats": { "DevOps": 45, "Kubernetes": 38, ... },
  "items": [
    {
      "title": "Platform Engineering Trends 2025",
      "link": "https://...",
      "pubDate": "2025-01-15T05:30:00.000Z",
      "summary": "...",
      "source": "The New Stack",
      "category": "DevOps"
    }
  ]
}
```

---

## 🤝 Katkıda Bulunma

1. Fork et
2. Feature branch aç: `git checkout -b feat/yeni-kaynak`
3. Değişiklik yap ve commit at: `git commit -m 'feat: yeni RSS kaynağı ekle'`
4. Push et: `git push origin feat/yeni-kaynak`
5. Pull Request aç

---

## 📄 Lisans

MIT © 2025 baybarse
