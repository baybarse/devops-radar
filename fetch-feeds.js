/**
 * DevOps Radar — RSS Feed Fetcher
 * Çalıştırma: node scripts/fetch-feeds.js
 * Bu script GitHub Actions tarafından otomatik çalıştırılır.
 * Tüm RSS kaynaklarını çekip data/feeds.json dosyasına yazar.
 */

const Parser = require('rss-parser');
const fs     = require('fs');
const path   = require('path');
const https  = require('https');
const http   = require('http');

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'DevOps-Radar/1.0 (https://github.com/baybarse/devops-radar)',
    'Accept': 'application/rss+xml, application/xml, application/atom+xml, text/xml;q=0.9, */*;q=0.8',
  },
});

/* ─── RSS Kaynakları ─── */
const FEEDS = [
  // ── DevOps Genel ──
  {
    name: 'The New Stack',
    url: 'https://thenewstack.io/feed/',
    category: 'Cloud Native',
    description: 'Cloud native, Kubernetes ve modern yazılım geliştirme',
  },
  {
    name: 'DevOps.com',
    url: 'https://devops.com/feed/',
    category: 'DevOps',
    description: 'DevOps haberleri, analizler ve best practices',
  },
  {
    name: 'DZone DevOps',
    url: 'https://feeds.dzone.com/devops',
    category: 'DevOps',
    description: 'DevOps makaleleri ve öğreticiler',
  },
  {
    name: 'InfoQ DevOps',
    url: 'https://www.infoq.com/devops/rss/',
    category: 'DevOps',
    description: 'Enterprise DevOps ve yazılım mimarisi',
  },

  // ── Cloud & Kubernetes ──
  {
    name: 'Kubernetes Blog',
    url: 'https://kubernetes.io/feed.xml',
    category: 'Kubernetes',
    description: 'Resmi Kubernetes blog ve sürüm notları',
  },
  {
    name: 'CNCF Blog',
    url: 'https://www.cncf.io/feed/',
    category: 'Cloud Native',
    description: 'CNCF projeleri ve cloud native ekosistemi',
  },
  {
    name: 'AWS Blog - DevOps',
    url: 'https://aws.amazon.com/blogs/devops/feed/',
    category: 'Cloud Native',
    description: 'AWS DevOps araçları ve best practices',
  },
  {
    name: 'Google Cloud Blog',
    url: 'https://cloud.google.com/feeds/gcp-blog-topics-containers.xml',
    category: 'Cloud Native',
    description: 'Google Cloud container ve Kubernetes haberleri',
  },

  // ── IaC & Platform ──
  {
    name: 'HashiCorp Blog',
    url: 'https://www.hashicorp.com/blog/feed.xml',
    category: 'IaC',
    description: 'Terraform, Vault, Consul ve HashiCorp ekosistemi',
  },
  {
    name: 'GitHub Blog',
    url: 'https://github.blog/feed/',
    category: 'DevOps',
    description: 'GitHub Actions, Copilot ve geliştirici araçları',
  },

  // ── Containers ──
  {
    name: 'Docker Blog',
    url: 'https://www.docker.com/blog/feed/',
    category: 'Containers',
    description: 'Docker, containerd ve container ekosistemi',
  },

  // ── Security ──
  {
    name: 'Sysdig Blog',
    url: 'https://sysdig.com/blog/feed/',
    category: 'Security',
    description: 'Container security, Falco ve runtime güvenliği',
  },
  {
    name: 'Snyk Blog',
    url: 'https://snyk.io/blog/feed/',
    category: 'Security',
    description: 'Uygulama güvenliği ve DevSecOps',
  },

  // ── Observability ──
  {
    name: 'Grafana Labs Blog',
    url: 'https://grafana.com/blog/news/feed.xml',
    category: 'Observability',
    description: 'Grafana, Loki, Tempo ve observability stack',
  },
  {
    name: 'Prometheus Blog',
    url: 'https://prometheus.io/blog/feed.xml',
    category: 'Observability',
    description: 'Prometheus ve metrics ekosistemi',
  },

  // ── Architecture & SRE ──
  {
    name: 'Martin Fowler',
    url: 'https://martinfowler.com/feed.atom',
    category: 'Architecture',
    description: 'Yazılım mimarisi, microservices ve refactoring',
  },
  {
    name: 'Google SRE',
    url: 'https://sre.google/resources/feed.xml',
    category: 'Architecture',
    description: 'Site Reliability Engineering metodolojisi',
  },

  // ── AI/MLOps ──
  {
    name: 'MLflow Blog',
    url: 'https://mlflow.org/blog/atom.xml',
    category: 'AI/MLOps',
    description: 'MLflow ve ML lifecycle yönetimi',
  },
];

/* ─── Helper: Metin temizleme ─── */
function cleanText(str, maxLen = 280) {
  if (!str) return '';
  return str
    .replace(/<[^>]+>/g, '')    // HTML taglarını kaldır
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen);
}

/* ─── Helper: URL doğrulama ─── */
function isValidUrl(str) {
  try { new URL(str); return true; } catch { return false; }
}

/* ─── Ana fetch fonksiyonu ─── */
async function fetchFeed(feedConfig) {
  const items = [];
  try {
    const feed = await parser.parseURL(feedConfig.url);
    const entries = (feed.items || []).slice(0, 15); // kaynak başına max 15 makale

    for (const item of entries) {
      const title = cleanText(item.title);
      const link  = item.link || item.guid;
      if (!title || !isValidUrl(link)) continue;

      items.push({
        title,
        link,
        pubDate:  item.pubDate || item.isoDate || new Date().toISOString(),
        summary:  cleanText(item.contentSnippet || item.content || item.summary, 280),
        source:   feedConfig.name,
        category: feedConfig.category,
        author:   cleanText(item.author || item.creator || ''),
      });
    }

    console.log(`✅ ${feedConfig.name}: ${items.length} makale`);
    return { items, error: null };
  } catch (err) {
    console.error(`❌ ${feedConfig.name}: ${err.message}`);
    return { items: [], error: { feed: feedConfig.name, url: feedConfig.url, message: err.message } };
  }
}

/* ─── Dedup: Aynı URL'yi tekrar ekleme ─── */
function deduplicateItems(items) {
  const seen = new Set();
  return items.filter(item => {
    if (seen.has(item.link)) return false;
    seen.add(item.link);
    return true;
  });
}

/* ─── Ana script ─── */
async function main() {
  console.log('🚀 DevOps Radar Feed Fetcher başlıyor...');
  console.log(`📡 ${FEEDS.length} kaynak işlenecek\n`);

  const allItems  = [];
  const allErrors = [];

  // Paralel fetch (5'erli gruplar)
  const chunkSize = 5;
  for (let i = 0; i < FEEDS.length; i += chunkSize) {
    const chunk   = FEEDS.slice(i, i + chunkSize);
    const results = await Promise.all(chunk.map(fetchFeed));
    results.forEach(r => {
      allItems.push(...r.items);
      if (r.error) allErrors.push(r.error);
    });
  }

  // Dedup + tarihe göre sırala
  const unique = deduplicateItems(allItems);
  unique.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  // Kategori istatistikleri
  const categoryStats = {};
  const sourceStats   = {};
  unique.forEach(item => {
    categoryStats[item.category] = (categoryStats[item.category] || 0) + 1;
    sourceStats[item.source]     = (sourceStats[item.source]     || 0) + 1;
  });

  // Çıktı objesi
  const output = {
    lastUpdated:    new Date().toISOString(),
    totalItems:     unique.length,
    totalSources:   FEEDS.length,
    successSources: FEEDS.length - allErrors.length,
    categoryStats,
    sourceStats,
    errors:         allErrors,
    items:          unique,
  };

  // Klasörü oluştur
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  // JSON yaz
  const outPath = path.join(dataDir, 'feeds.json');
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf8');

  console.log('\n📊 Özet:');
  console.log(`   Toplam makale : ${unique.length}`);
  console.log(`   Başarılı      : ${FEEDS.length - allErrors.length}/${FEEDS.length} kaynak`);
  console.log(`   Hata          : ${allErrors.length}`);
  console.log(`\n✅ data/feeds.json güncellendi: ${outPath}`);

  if (allErrors.length > 0) {
    console.log('\n⚠️  Başarısız kaynaklar:');
    allErrors.forEach(e => console.log(`   - ${e.feed}: ${e.message}`));
  }
}

main().catch(err => {
  console.error('💥 Script hatası:', err);
  process.exit(1);
});
