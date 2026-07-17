/**
 * DevOps Radar — RSS Feed Fetcher
 * Run: node scripts/fetch-feeds.js
 * This script is automatically run by GitHub Actions every 6 hours.
 * It fetches all RSS sources and writes them to data/feeds.json.
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

/* ─── RSS Sources ─── */
const FEEDS = [
  // ── DevOps General ──
  { name: 'The New Stack', url: 'https://thenewstack.io/feed/', category: 'Cloud Native', description: 'Cloud native, Kubernetes, and modern software development' },
  { name: 'DevOps.com', url: 'https://devops.com/feed/', category: 'DevOps', description: 'DevOps news, analysis, and best practices' },
  { name: 'DZone DevOps', url: 'https://feeds.dzone.com/devops', category: 'DevOps', description: 'DevOps articles and tutorials' },
  { name: 'InfoQ DevOps', url: 'https://www.infoq.com/devops/rss/', category: 'DevOps', description: 'Enterprise DevOps and software architecture' },
  { name: 'Dev.to DevOps', url: 'https://dev.to/feed/tag/devops', category: 'DevOps', description: 'Community-driven DevOps articles' },
  { name: 'Medium DevOps', url: 'https://medium.com/feed/tag/devops', category: 'DevOps', description: 'DevOps articles from Medium' },
  { name: 'Humanitec Blog', url: 'https://humanitec.com/blog/rss.xml', category: 'DevOps', description: 'Platform engineering and Internal Developer Platforms' },
  { name: 'Spacelift Blog', url: 'https://spacelift.io/blog/feed', category: 'DevOps', description: 'IaC management and CI/CD for infrastructure' },
  { name: 'DevOps Toolkit', url: 'https://www.yourdevopsmentor.com/blog-feed.xml', category: 'DevOps', description: 'DevOps tooling reviews and tutorials' },
  { name: 'The Register DevOps', url: 'https://www.theregister.com/software/devops/headlines.atom', category: 'DevOps', description: 'DevOps industry news and analysis' },

  // ── Kubernetes & Container Orchestration ──
  { name: 'Kubernetes Blog', url: 'https://kubernetes.io/feed.xml', category: 'Kubernetes', description: 'Official Kubernetes blog and release notes' },
  { name: 'CNCF Blog', url: 'https://www.cncf.io/feed/', category: 'Cloud Native', description: 'CNCF projects and cloud native ecosystem' },
  { name: 'Learnk8s Blog', url: 'https://learnk8s.io/rss.xml', category: 'Kubernetes', description: 'Kubernetes tutorials and best practices' },
  { name: 'K8s.dev Blog', url: 'https://www.kubernetes.dev/blog/feed.xml', category: 'Kubernetes', description: 'Kubernetes contributor community blog' },
  { name: 'Kubecost Blog', url: 'https://blog.kubecost.com/rss/', category: 'Kubernetes', description: 'Kubernetes cost management and optimization' },
  { name: 'Komodor Blog', url: 'https://komodor.com/blog/feed/', category: 'Kubernetes', description: 'Kubernetes troubleshooting and management' },
  { name: 'Giant Swarm Blog', url: 'https://www.giantswarm.io/blog/rss.xml', category: 'Kubernetes', description: 'Managed Kubernetes and cloud native platform' },
  { name: 'Loft Labs Blog', url: 'https://loft.sh/blog/feed', category: 'Kubernetes', description: 'Virtual Kubernetes clusters and multi-tenancy' },
  { name: 'Sysdig K8s', url: 'https://sysdig.com/blog/topic/kubernetes/feed/', category: 'Kubernetes', description: 'Kubernetes security and monitoring insights' },

  // ── Cloud Providers ──
  { name: 'AWS Blog - DevOps', url: 'https://aws.amazon.com/blogs/devops/feed/', category: 'Cloud Native', description: 'AWS DevOps tools and best practices' },
  { name: 'AWS Blog - Containers', url: 'https://aws.amazon.com/blogs/containers/feed/', category: 'Containers', description: 'Amazon ECS, EKS, and container services' },
  { name: 'Google Cloud Blog', url: 'https://cloud.google.com/feeds/gcp-blog.xml', category: 'Cloud Native', description: 'Google Cloud Platform news and tutorials' },
  { name: 'Azure DevOps Blog', url: 'https://devblogs.microsoft.com/devops/feed/', category: 'Cloud Native', description: 'Azure DevOps and GitHub integration' },
  { name: 'Azure Blog', url: 'https://azure.microsoft.com/en-us/blog/feed/', category: 'Cloud Native', description: 'Microsoft Azure cloud services and updates' },
  { name: 'DigitalOcean Blog', url: 'https://www.digitalocean.com/blog/feed', category: 'Cloud Native', description: 'Cloud infrastructure and developer tutorials' },
  { name: 'Oracle Cloud Blog', url: 'https://blogs.oracle.com/cloud-infrastructure/rss', category: 'Cloud Native', description: 'Oracle Cloud Infrastructure updates' },
  { name: 'IBM Cloud Blog', url: 'https://www.ibm.com/blog/category/cloud/feed/', category: 'Cloud Native', description: 'IBM Cloud and hybrid cloud strategies' },
  { name: 'Cloudflare Blog', url: 'https://blog.cloudflare.com/rss/', category: 'Cloud Native', description: 'Edge computing, CDN, and network security' },
  { name: 'Akamai Blog', url: 'https://www.akamai.com/blog/feed', category: 'Cloud Native', description: 'Cloud computing and edge platform' },

  // ── IaC & Infrastructure ──
  { name: 'HashiCorp Blog', url: 'https://www.hashicorp.com/blog/feed.xml', category: 'IaC', description: 'Terraform, Vault, Consul, and HashiCorp ecosystem' },
  { name: 'Pulumi Blog', url: 'https://www.pulumi.com/blog/rss/', category: 'IaC', description: 'Infrastructure as Code with general-purpose languages' },
  { name: 'Ansible Blog', url: 'https://www.ansible.com/blog/rss.xml', category: 'IaC', description: 'Ansible automation and configuration management' },
  { name: 'OpenTofu Blog', url: 'https://opentofu.org/blog/rss.xml', category: 'IaC', description: 'Open-source Terraform alternative' },
  { name: 'env0 Blog', url: 'https://www.env0.com/blog/rss.xml', category: 'IaC', description: 'Infrastructure automation and governance' },
  { name: 'Gruntwork Blog', url: 'https://blog.gruntwork.io/feed', category: 'IaC', description: 'Terraform modules and DevOps best practices' },
  { name: 'Crossplane Blog', url: 'https://blog.crossplane.io/rss/', category: 'IaC', description: 'Kubernetes-native infrastructure management' },
  { name: 'Chef Blog', url: 'https://www.chef.io/blog/feed', category: 'IaC', description: 'Configuration management and compliance automation' },

  // ── CI/CD & GitOps ──
  { name: 'GitHub Blog', url: 'https://github.blog/feed/', category: 'DevOps', description: 'GitHub Actions, Copilot, and developer tools' },
  { name: 'GitLab Blog', url: 'https://about.gitlab.com/atom.xml', category: 'DevOps', description: 'GitLab CI/CD and DevSecOps platform' },
  { name: 'CircleCI Blog', url: 'https://circleci.com/blog/feed.xml', category: 'DevOps', description: 'Continuous integration and delivery pipelines' },
  { name: 'Argo Project', url: 'https://blog.argoproj.io/feed', category: 'DevOps', description: 'ArgoCD, Argo Workflows, and GitOps' },
  { name: 'Flux CD Blog', url: 'https://fluxcd.io/blog/index.xml', category: 'DevOps', description: 'GitOps toolkit for Kubernetes' },
  { name: 'Harness Blog', url: 'https://www.harness.io/blog/rss.xml', category: 'DevOps', description: 'Software delivery platform and CI/CD' },
  { name: 'Codefresh Blog', url: 'https://codefresh.io/blog/feed/', category: 'DevOps', description: 'GitOps and Kubernetes CI/CD' },
  { name: 'Jenkins Blog', url: 'https://www.jenkins.io/blog/rss.xml', category: 'DevOps', description: 'Jenkins automation server and plugins' },
  { name: 'Tekton Blog', url: 'https://tekton.dev/blog/index.xml', category: 'DevOps', description: 'Cloud-native CI/CD pipelines' },
  { name: 'Buildkite Blog', url: 'https://buildkite.com/blog/feed.xml', category: 'DevOps', description: 'CI/CD pipelines and build automation' },
  { name: 'Drone.io Blog', url: 'https://blog.drone.io/feed/', category: 'DevOps', description: 'Container-native CI/CD platform' },

  // ── Containers & Runtime ──
  { name: 'Docker Blog', url: 'https://www.docker.com/blog/feed/', category: 'Containers', description: 'Docker, containerd, and container ecosystem' },
  { name: 'Podman Blog', url: 'https://podman.io/blogs/index.xml', category: 'Containers', description: 'Daemonless container engine' },
  { name: 'Red Hat Blog', url: 'https://www.redhat.com/en/blog/rss.xml', category: 'Containers', description: 'Enterprise Linux, OpenShift, and containers' },
  { name: 'VMware Tanzu Blog', url: 'https://tanzu.vmware.com/content/blog/feed', category: 'Containers', description: 'Kubernetes platform and Spring development' },
  { name: 'Rancher Blog', url: 'https://www.rancher.com/blog/feed', category: 'Containers', description: 'Kubernetes management platform' },
  { name: 'Containerd Blog', url: 'https://containerd.io/blog/feed.xml', category: 'Containers', description: 'Industry-standard container runtime' },

  // ── Security & DevSecOps ──
  { name: 'Sysdig Blog', url: 'https://sysdig.com/blog/feed/', category: 'Security', description: 'Container security, Falco, and runtime security' },
  { name: 'Snyk Blog', url: 'https://snyk.io/blog/feed/', category: 'Security', description: 'Application security and DevSecOps' },
  { name: 'Aqua Security Blog', url: 'https://blog.aquasec.com/rss.xml', category: 'Security', description: 'Cloud native security and compliance' },
  { name: 'Palo Alto Prisma Blog', url: 'https://www.paloaltonetworks.com/blog/prisma-cloud/feed/', category: 'Security', description: 'Cloud security and CWPP' },
  { name: 'Chainguard Blog', url: 'https://www.chainguard.dev/unchained/rss.xml', category: 'Security', description: 'Supply chain security and distroless images' },
  { name: 'Sigstore Blog', url: 'https://blog.sigstore.dev/feed', category: 'Security', description: 'Software signing and verification' },
  { name: 'Wiz Blog', url: 'https://www.wiz.io/blog/rss.xml', category: 'Security', description: 'Cloud security posture management' },
  { name: 'OWASP Blog', url: 'https://owasp.org/feed.xml', category: 'Security', description: 'Open-source application security' },
  { name: 'Trail of Bits', url: 'https://blog.trailofbits.com/feed/', category: 'Security', description: 'Security research and engineering' },
  { name: 'Krebs on Security', url: 'https://krebsonsecurity.com/feed/', category: 'Security', description: 'In-depth security news and investigation' },

  // ── Observability & Monitoring ──
  { name: 'Grafana Labs Blog', url: 'https://grafana.com/blog/news/feed.xml', category: 'Observability', description: 'Grafana, Loki, Tempo, and observability stack' },
  { name: 'Prometheus Blog', url: 'https://prometheus.io/blog/feed.xml', category: 'Observability', description: 'Prometheus metrics ecosystem' },
  { name: 'Datadog Blog', url: 'https://www.datadoghq.com/blog/feed/', category: 'Observability', description: 'Cloud monitoring and APM' },
  { name: 'New Relic Blog', url: 'https://newrelic.com/blog/feed', category: 'Observability', description: 'Full-stack observability platform' },
  { name: 'Elastic Blog', url: 'https://www.elastic.co/blog/feed', category: 'Observability', description: 'Elasticsearch, Kibana, and ELK stack' },
  { name: 'OpenTelemetry Blog', url: 'https://opentelemetry.io/blog/index.xml', category: 'Observability', description: 'Open standard for telemetry data' },
  { name: 'Honeycomb Blog', url: 'https://www.honeycomb.io/blog/rss/', category: 'Observability', description: 'Observability and debugging distributed systems' },
  { name: 'Lightstep Blog', url: 'https://lightstep.com/blog/feed', category: 'Observability', description: 'Distributed tracing and observability' },
  { name: 'VictoriaMetrics Blog', url: 'https://victoriametrics.com/blog/feed/', category: 'Observability', description: 'Time series database and monitoring' },
  { name: 'Last9 Blog', url: 'https://last9.io/blog/rss.xml', category: 'Observability', description: 'SRE and reliability engineering' },

  // ── Architecture & SRE ──
  { name: 'Martin Fowler', url: 'https://martinfowler.com/feed.atom', category: 'Architecture', description: 'Software architecture, microservices, and refactoring' },
  { name: 'Google SRE', url: 'https://sre.google/resources/feed.xml', category: 'Architecture', description: 'Site Reliability Engineering methodology' },
  { name: 'Netflix Tech Blog', url: 'https://netflixtechblog.com/feed', category: 'Architecture', description: 'Distributed systems and scalability at Netflix' },
  { name: 'Uber Engineering', url: 'https://www.uber.com/blog/engineering/rss/', category: 'Architecture', description: 'Infrastructure and platform engineering at Uber' },
  { name: 'Spotify Engineering', url: 'https://engineering.atspotify.com/feed/', category: 'Architecture', description: 'Backstage, platform engineering at Spotify' },
  { name: 'Cloudflare Engineering', url: 'https://blog.cloudflare.com/tag/engineering/rss/', category: 'Architecture', description: 'Systems engineering and performance' },
  { name: 'Meta Engineering', url: 'https://engineering.fb.com/feed/', category: 'Architecture', description: 'Large-scale infrastructure and systems' },
  { name: 'LinkedIn Engineering', url: 'https://engineering.linkedin.com/blog/feed.xml', category: 'Architecture', description: 'Data infrastructure and platform engineering' },
  { name: 'Stripe Engineering', url: 'https://stripe.com/blog/feed.rss', category: 'Architecture', description: 'API design and infrastructure reliability' },
  { name: 'Airbnb Engineering', url: 'https://medium.com/feed/airbnb-engineering', category: 'Architecture', description: 'Data platform and service architecture' },

  // ── AI/MLOps ──
  { name: 'MLflow Blog', url: 'https://mlflow.org/blog/atom.xml', category: 'AI/MLOps', description: 'MLflow and ML lifecycle management' },
  { name: 'Kubeflow Blog', url: 'https://blog.kubeflow.org/feed.xml', category: 'AI/MLOps', description: 'ML on Kubernetes' },
  { name: 'Weights & Biases Blog', url: 'https://wandb.ai/fully-connected/rss.xml', category: 'AI/MLOps', description: 'ML experiment tracking and MLOps' },
  { name: 'Neptune.ai Blog', url: 'https://neptune.ai/blog/feed', category: 'AI/MLOps', description: 'ML metadata management and experiment tracking' },
  { name: 'Hugging Face Blog', url: 'https://huggingface.co/blog/feed.xml', category: 'AI/MLOps', description: 'ML models, datasets, and inference' },
  { name: 'Google AI Blog', url: 'https://blog.research.google/feeds/posts/default', category: 'AI/MLOps', description: 'AI research and ML infrastructure' },
  { name: 'OpenAI Blog', url: 'https://openai.com/blog/rss/', category: 'AI/MLOps', description: 'AI models and safety research' },

  // ── Platform Engineering & Developer Experience ──
  { name: 'Platform Engineering', url: 'https://platformengineering.org/blog/rss.xml', category: 'DevOps', description: 'Platform engineering community and practices' },
  { name: 'Backstage Blog', url: 'https://backstage.io/blog/rss.xml', category: 'DevOps', description: 'Internal Developer Portal by Spotify' },
  { name: 'Port Blog', url: 'https://www.getport.io/blog/rss.xml', category: 'DevOps', description: 'Internal developer portal and service catalog' },
  { name: 'Cortex Blog', url: 'https://www.cortex.io/blog/rss.xml', category: 'DevOps', description: 'Engineering intelligence platform' },
  { name: 'OpsLevel Blog', url: 'https://www.opslevel.com/blog/rss.xml', category: 'DevOps', description: 'Service ownership and developer portal' },
];

/* ─── Helper: Clean text ─── */
function cleanText(str, maxLen = 280) {
  if (!str) return '';
  return str
    .replace(/<[^>]+>/g, '')    // Remove HTML tags
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen);
}

/* ─── Helper: URL validation ─── */
function isValidUrl(str) {
  try { new URL(str); return true; } catch { return false; }
}

/* ─── Main fetch function ─── */
async function fetchFeed(feedConfig) {
  const items = [];
  try {
    const feed = await parser.parseURL(feedConfig.url);
    const entries = (feed.items || []).slice(0, 15); // max 15 articles per source

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

    console.log(`✅ ${feedConfig.name}: ${items.length} articles`);
    return { items, error: null };
  } catch (err) {
    console.error(`❌ ${feedConfig.name}: ${err.message}`);
    return { items: [], error: { feed: feedConfig.name, url: feedConfig.url, message: err.message } };
  }
}

/* ─── Dedup: Prevent duplicate URLs ─── */
function deduplicateItems(items) {
  const seen = new Set();
  return items.filter(item => {
    if (seen.has(item.link)) return false;
    seen.add(item.link);
    return true;
  });
}

/* ─── Main script ─── */
async function main() {
  console.log('🚀 DevOps Radar Feed Fetcher starting...');
  console.log(`📡 ${FEEDS.length} sources to process\n`);

  const allItems  = [];
  const allErrors = [];

  // Parallel fetch (batches of 5)
  const chunkSize = 5;
  for (let i = 0; i < FEEDS.length; i += chunkSize) {
    const chunk   = FEEDS.slice(i, i + chunkSize);
    const results = await Promise.all(chunk.map(fetchFeed));
    results.forEach(r => {
      allItems.push(...r.items);
      if (r.error) allErrors.push(r.error);
    });
  }

  // Dedup + sort by date
  const unique = deduplicateItems(allItems);
  unique.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  // Category statistics
  const categoryStats = {};
  const sourceStats   = {};
  unique.forEach(item => {
    categoryStats[item.category] = (categoryStats[item.category] || 0) + 1;
    sourceStats[item.source]     = (sourceStats[item.source]     || 0) + 1;
  });

  // Output object
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

  // Create directory
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  // Write JSON
  const outPath = path.join(dataDir, 'feeds.json');
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf8');

  console.log('\n📊 Summary:');
  console.log(`   Total articles : ${unique.length}`);
  console.log(`   Successful     : ${FEEDS.length - allErrors.length}/${FEEDS.length} sources`);
  console.log(`   Errors         : ${allErrors.length}`);
  console.log(`\n✅ data/feeds.json updated: ${outPath}`);

  if (allErrors.length > 0) {
    console.log('\n⚠️  Failed sources:');
    allErrors.forEach(e => console.log(`   - ${e.feed}: ${e.message}`));
  }
}

main().catch(err => {
  console.error('💥 Script error:', err);
  process.exit(1);
});
