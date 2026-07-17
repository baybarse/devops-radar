/**
 * DevOps Radar — Main Application JS
 * Handles: Feed loading, filtering, search, theme toggle, UI state, tracked sources
 */

(function () {
  'use strict';

  /* ── Config ── */
  const CONFIG = {
    feedDataUrl: 'data/feeds.json',
    itemsPerPage: 12,
    searchDebounceMs: 300,
  };

  /* ── All Tracked Sources (matches fetch-feeds.js) ── */
  const TRACKED_SOURCES = [
    { name: 'The New Stack', url: 'https://thenewstack.io', category: 'Cloud Native' },
    { name: 'DevOps.com', url: 'https://devops.com', category: 'DevOps' },
    { name: 'DZone DevOps', url: 'https://dzone.com', category: 'DevOps' },
    { name: 'InfoQ DevOps', url: 'https://infoq.com', category: 'DevOps' },
    { name: 'Dev.to DevOps', url: 'https://dev.to', category: 'DevOps' },
    { name: 'Medium DevOps', url: 'https://medium.com', category: 'DevOps' },
    { name: 'Humanitec Blog', url: 'https://humanitec.com', category: 'DevOps' },
    { name: 'Spacelift Blog', url: 'https://spacelift.io', category: 'DevOps' },
    { name: 'The Register DevOps', url: 'https://theregister.com', category: 'DevOps' },
    { name: 'Platform Engineering', url: 'https://platformengineering.org', category: 'DevOps' },
    { name: 'Kubernetes Blog', url: 'https://kubernetes.io', category: 'Kubernetes' },
    { name: 'CNCF Blog', url: 'https://cncf.io', category: 'Cloud Native' },
    { name: 'Learnk8s Blog', url: 'https://learnk8s.io', category: 'Kubernetes' },
    { name: 'Kubecost Blog', url: 'https://kubecost.com', category: 'Kubernetes' },
    { name: 'Komodor Blog', url: 'https://komodor.com', category: 'Kubernetes' },
    { name: 'Giant Swarm Blog', url: 'https://giantswarm.io', category: 'Kubernetes' },
    { name: 'Loft Labs Blog', url: 'https://loft.sh', category: 'Kubernetes' },
    { name: 'Sysdig K8s', url: 'https://sysdig.com', category: 'Kubernetes' },
    { name: 'AWS Blog - DevOps', url: 'https://aws.amazon.com/blogs/devops/', category: 'Cloud Native' },
    { name: 'AWS Blog - Containers', url: 'https://aws.amazon.com/blogs/containers/', category: 'Containers' },
    { name: 'Google Cloud Blog', url: 'https://cloud.google.com/blog', category: 'Cloud Native' },
    { name: 'Azure DevOps Blog', url: 'https://devblogs.microsoft.com/devops/', category: 'Cloud Native' },
    { name: 'Azure Blog', url: 'https://azure.microsoft.com/blog', category: 'Cloud Native' },
    { name: 'DigitalOcean Blog', url: 'https://digitalocean.com/blog', category: 'Cloud Native' },
    { name: 'Oracle Cloud Blog', url: 'https://blogs.oracle.com', category: 'Cloud Native' },
    { name: 'IBM Cloud Blog', url: 'https://ibm.com/blog', category: 'Cloud Native' },
    { name: 'Cloudflare Blog', url: 'https://blog.cloudflare.com', category: 'Cloud Native' },
    { name: 'Akamai Blog', url: 'https://akamai.com/blog', category: 'Cloud Native' },
    { name: 'HashiCorp Blog', url: 'https://hashicorp.com', category: 'IaC' },
    { name: 'Pulumi Blog', url: 'https://pulumi.com', category: 'IaC' },
    { name: 'Ansible Blog', url: 'https://ansible.com', category: 'IaC' },
    { name: 'OpenTofu Blog', url: 'https://opentofu.org', category: 'IaC' },
    { name: 'env0 Blog', url: 'https://env0.com', category: 'IaC' },
    { name: 'Gruntwork Blog', url: 'https://blog.gruntwork.io', category: 'IaC' },
    { name: 'Crossplane Blog', url: 'https://blog.crossplane.io', category: 'IaC' },
    { name: 'Chef Blog', url: 'https://chef.io', category: 'IaC' },
    { name: 'GitHub Blog', url: 'https://github.blog', category: 'DevOps' },
    { name: 'GitLab Blog', url: 'https://about.gitlab.com', category: 'DevOps' },
    { name: 'CircleCI Blog', url: 'https://circleci.com', category: 'DevOps' },
    { name: 'Argo Project', url: 'https://blog.argoproj.io', category: 'DevOps' },
    { name: 'Flux CD Blog', url: 'https://fluxcd.io', category: 'DevOps' },
    { name: 'Harness Blog', url: 'https://harness.io', category: 'DevOps' },
    { name: 'Codefresh Blog', url: 'https://codefresh.io', category: 'DevOps' },
    { name: 'Jenkins Blog', url: 'https://jenkins.io', category: 'DevOps' },
    { name: 'Tekton Blog', url: 'https://tekton.dev', category: 'DevOps' },
    { name: 'Buildkite Blog', url: 'https://buildkite.com', category: 'DevOps' },
    { name: 'Docker Blog', url: 'https://docker.com/blog', category: 'Containers' },
    { name: 'Podman Blog', url: 'https://podman.io', category: 'Containers' },
    { name: 'Red Hat Blog', url: 'https://redhat.com', category: 'Containers' },
    { name: 'VMware Tanzu Blog', url: 'https://tanzu.vmware.com', category: 'Containers' },
    { name: 'Rancher Blog', url: 'https://rancher.com', category: 'Containers' },
    { name: 'Sysdig Blog', url: 'https://sysdig.com/blog', category: 'Security' },
    { name: 'Snyk Blog', url: 'https://snyk.io', category: 'Security' },
    { name: 'Aqua Security Blog', url: 'https://blog.aquasec.com', category: 'Security' },
    { name: 'Chainguard Blog', url: 'https://chainguard.dev', category: 'Security' },
    { name: 'Sigstore Blog', url: 'https://blog.sigstore.dev', category: 'Security' },
    { name: 'Wiz Blog', url: 'https://wiz.io', category: 'Security' },
    { name: 'OWASP Blog', url: 'https://owasp.org', category: 'Security' },
    { name: 'Trail of Bits', url: 'https://blog.trailofbits.com', category: 'Security' },
    { name: 'Krebs on Security', url: 'https://krebsonsecurity.com', category: 'Security' },
    { name: 'Grafana Labs Blog', url: 'https://grafana.com', category: 'Observability' },
    { name: 'Prometheus Blog', url: 'https://prometheus.io', category: 'Observability' },
    { name: 'Datadog Blog', url: 'https://datadoghq.com', category: 'Observability' },
    { name: 'New Relic Blog', url: 'https://newrelic.com', category: 'Observability' },
    { name: 'Elastic Blog', url: 'https://elastic.co', category: 'Observability' },
    { name: 'OpenTelemetry Blog', url: 'https://opentelemetry.io', category: 'Observability' },
    { name: 'Honeycomb Blog', url: 'https://honeycomb.io', category: 'Observability' },
    { name: 'VictoriaMetrics Blog', url: 'https://victoriametrics.com', category: 'Observability' },
    { name: 'Last9 Blog', url: 'https://last9.io', category: 'Observability' },
    { name: 'Martin Fowler', url: 'https://martinfowler.com', category: 'Architecture' },
    { name: 'Google SRE', url: 'https://sre.google', category: 'Architecture' },
    { name: 'Netflix Tech Blog', url: 'https://netflixtechblog.com', category: 'Architecture' },
    { name: 'Uber Engineering', url: 'https://uber.com/blog/engineering', category: 'Architecture' },
    { name: 'Spotify Engineering', url: 'https://engineering.atspotify.com', category: 'Architecture' },
    { name: 'Meta Engineering', url: 'https://engineering.fb.com', category: 'Architecture' },
    { name: 'LinkedIn Engineering', url: 'https://engineering.linkedin.com', category: 'Architecture' },
    { name: 'Stripe Engineering', url: 'https://stripe.com/blog', category: 'Architecture' },
    { name: 'Airbnb Engineering', url: 'https://medium.com/airbnb-engineering', category: 'Architecture' },
    { name: 'MLflow Blog', url: 'https://mlflow.org', category: 'AI/MLOps' },
    { name: 'Kubeflow Blog', url: 'https://kubeflow.org', category: 'AI/MLOps' },
    { name: 'Weights & Biases Blog', url: 'https://wandb.ai', category: 'AI/MLOps' },
    { name: 'Neptune.ai Blog', url: 'https://neptune.ai', category: 'AI/MLOps' },
    { name: 'Hugging Face Blog', url: 'https://huggingface.co', category: 'AI/MLOps' },
    { name: 'Google AI Blog', url: 'https://blog.research.google', category: 'AI/MLOps' },
    { name: 'OpenAI Blog', url: 'https://openai.com', category: 'AI/MLOps' },
    { name: 'Backstage Blog', url: 'https://backstage.io', category: 'DevOps' },
    { name: 'Port Blog', url: 'https://getport.io', category: 'DevOps' },
    { name: 'Cortex Blog', url: 'https://cortex.io', category: 'DevOps' },
    { name: 'OpsLevel Blog', url: 'https://opslevel.com', category: 'DevOps' },
    { name: 'Palo Alto Prisma', url: 'https://paloaltonetworks.com', category: 'Security' },
    { name: 'Cloudflare Engineering', url: 'https://blog.cloudflare.com', category: 'Architecture' },
    { name: 'Containerd Blog', url: 'https://containerd.io', category: 'Containers' },
    { name: 'Drone.io Blog', url: 'https://blog.drone.io', category: 'DevOps' },
    { name: 'Lightstep Blog', url: 'https://lightstep.com', category: 'Observability' },
    { name: 'K8s.dev Blog', url: 'https://kubernetes.dev', category: 'Kubernetes' },
  ];

  /* ── State ── */
  const state = {
    allItems: [],
    filteredItems: [],
    activeCategory: 'all',
    searchQuery: '',
    currentPage: 1,
    isLoading: false,
  };

  /* ── DOM Refs ── */
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => [...document.querySelectorAll(sel)];

  const feedGrid      = $('#feedGrid');
  const feedEmpty     = $('#feedEmpty');
  const loadMoreBtn   = $('#loadMoreBtn');
  const searchInput   = $('#searchInput');
  const themeToggle   = $('#themeToggle');
  const hamburger     = $('#hamburger');
  const mainNav       = $('#mainNav');
  const scrollTopBtn  = $('#scrollTopBtn');

  const kpiArticles   = $('#kpiArticles');
  const kpiSources    = $('#kpiSources');
  const kpiCategories = $('#kpiCategories');
  const lastUpdated   = $('#lastUpdated');
  const totalItems    = $('#totalItems');
  const sourceCount   = $('#sourceCount');

  /* ═══════════════════════════════════════════
     1. DATA FETCHING
  ═══════════════════════════════════════════ */

  async function loadFeedData() {
    try {
      const res = await fetch(CONFIG.feedDataUrl + '?t=' + Date.now());
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      return data;
    } catch (err) {
      console.warn('Feed data not available, using curated content.', err);
      return getFallbackData();
    }
  }

  function getFallbackData() {
    const sources = TRACKED_SOURCES.slice(0, 30);

    const articles = [
      ['Platform Engineering: The Next DevOps Evolution', 'An in-depth exploration of how platform engineering is reshaping DevOps workflows and developer productivity across the industry.', 'DevOps'],
      ['Kubernetes 1.30 Release: What\'s New', 'A comprehensive breakdown of the latest Kubernetes release, including new features, deprecations, and upgrade considerations.', 'Kubernetes'],
      ['GitOps vs. Traditional CI/CD: A Deep Dive', 'Comparing GitOps-based deployment strategies with traditional CI/CD pipelines — pros, cons, and real-world use cases.', 'DevOps'],
      ['OpenTelemetry: Unified Observability Standard', 'How OpenTelemetry is becoming the industry standard for traces, metrics, and logs across distributed systems.', 'Observability'],
      ['Terraform vs OpenTofu: Comprehensive Comparison', 'A detailed comparison of Terraform and OpenTofu, examining licensing, community support, and feature parity.', 'IaC'],
      ['Securing Kubernetes Supply Chain with Sigstore', 'Best practices for securing your container supply chain using Sigstore, SBOM generation, and image verification.', 'Security'],
      ['eBPF: Revolutionizing Linux Kernel Observability', 'How eBPF is transforming networking, security, and observability at the Linux kernel level without modifying kernel code.', 'Observability'],
      ['Backstage: Building Internal Developer Portals', 'A practical guide to implementing Backstage as your Internal Developer Portal to improve developer experience.', 'DevOps'],
      ['Docker vs. Podman: Container Runtime Comparison', 'An updated comparison of Docker and Podman for container development, focusing on rootless containers and Kubernetes compatibility.', 'Containers'],
      ['SRE Error Budgets: A Practical Guide', 'How to implement and manage SRE error budgets to balance reliability with feature velocity in your engineering organization.', 'Architecture'],
      ['ArgoCD + Helm: Production GitOps Patterns', 'Proven patterns for running ArgoCD with Helm charts in production Kubernetes environments at scale.', 'Kubernetes'],
      ['AI/ML Model Serving with Kubernetes', 'Deploying and scaling machine learning models on Kubernetes using KServe, Seldon Core, and custom operators.', 'AI/MLOps'],
      ['Chaos Engineering: Building Resilient Systems', 'Implementing chaos engineering practices to proactively discover weaknesses in your distributed systems.', 'DevOps'],
      ['FinOps: Cloud Cost Optimization Strategies', 'Practical FinOps strategies for reducing cloud spend while maintaining performance and reliability.', 'Cloud Native'],
      ['Crossplane: Infrastructure from Kubernetes', 'Using Crossplane to manage cloud infrastructure using Kubernetes-native APIs and custom resources.', 'IaC'],
      ['Service Mesh Showdown: Istio vs Cilium', 'Comparing Istio and Cilium for service mesh capabilities, including performance benchmarks and feature analysis.', 'Kubernetes'],
      ['SBOM: Why Software Bill of Materials Matters', 'Understanding the importance of SBOMs for software supply chain security and regulatory compliance.', 'Security'],
      ['Karpenter: Smart Kubernetes Node Provisioning', 'How Karpenter optimizes Kubernetes node provisioning for cost efficiency and performance.', 'Kubernetes'],
      ['WebAssembly on the Server: WASI and Kubernetes', 'Exploring WebAssembly\'s potential for server-side computing with WASI and Kubernetes integration.', 'Cloud Native'],
      ['Dagger: CI/CD Pipelines as Code', 'Building portable, testable CI/CD pipelines with Dagger using your favorite programming language.', 'DevOps'],
      ['VictoriaMetrics vs Prometheus: Scalable Metrics', 'Comparing VictoriaMetrics and Prometheus for large-scale metrics collection and long-term storage.', 'Observability'],
      ['Falco Runtime Security: Practical Guide', 'Implementing Falco for runtime threat detection and response in Kubernetes environments.', 'Security'],
      ['Dapr: Portable Microservices Runtime', 'Building resilient microservices with Dapr\'s sidecar architecture for state management, pub/sub, and service invocation.', 'Architecture'],
      ['Flux CD 2.0: GitOps for the Enterprise', 'How Flux CD 2.0 brings enterprise-grade GitOps with multi-tenancy, notifications, and image automation.', 'DevOps'],
      ['AWS EKS Blueprints: Production-Ready K8s', 'Setting up production-grade Kubernetes clusters on AWS EKS with best practices for networking, security, and cost.', 'Cloud Native'],
      ['Grafana Alloy: The New OpenTelemetry Collector', 'How Grafana Alloy unifies metrics, logs, traces, and profiles collection in a single agent.', 'Observability'],
      ['Zero Trust Security in Kubernetes Environments', 'Implementing zero trust architecture with service mesh, mTLS, and network policies in K8s.', 'Security'],
      ['Pulumi vs Terraform: IaC Framework Comparison', 'Comparing Pulumi and Terraform approaches to Infrastructure as Code with real-world examples.', 'IaC'],
      ['Netflix Zuul 3: API Gateway Architecture', 'How Netflix evolved their API gateway for handling billions of requests across microservices.', 'Architecture'],
      ['LLMOps: Operating Large Language Models', 'Best practices for deploying, monitoring, and scaling LLMs in production environments.', 'AI/MLOps'],
    ];

    const now = new Date();
    const items = articles.map(([title, summary, catOverride], i) => {
      const src = sources[i % sources.length];
      const hoursAgo = Math.floor(i * 3);
      const d = new Date(now);
      d.setHours(d.getHours() - hoursAgo);
      return {
        title,
        link: '#article-' + i,
        pubDate: d.toISOString(),
        summary,
        source: src.name,
        category: catOverride || src.category,
      };
    });

    return {
      lastUpdated: new Date().toISOString(),
      totalItems: items.length,
      errors: [],
      items,
    };
  }

  /* ═══════════════════════════════════════════
     2. RENDERING
  ═══════════════════════════════════════════ */

  function renderStatusBar(data) {
    const sources = [...new Set(data.items.map(i => i.source))];

    if (lastUpdated) {
      const d = new Date(data.lastUpdated);
      lastUpdated.textContent = 'Last updated: ' + d.toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    }
    if (totalItems)   totalItems.textContent = data.totalItems + ' articles';
    if (sourceCount)  sourceCount.textContent = TRACKED_SOURCES.length + ' sources';
  }

  function renderKPIs(data) {
    const cats = [...new Set(data.items.map(i => i.category))];

    animateCounter(kpiArticles,   0, data.totalItems,           1000);
    animateCounter(kpiSources,    0, TRACKED_SOURCES.length,    800);
    animateCounter(kpiCategories, 0, cats.length,               600);
  }

  function animateCounter(el, from, to, duration) {
    if (!el) return;
    const start = performance.now();
    function update(t) {
      const progress = Math.min((t - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(from + (to - from) * ease);
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  function createArticleCard(item) {
    const isExternal = item.link && !item.link.startsWith('#');
    const card = document.createElement('a');
    card.className = 'article-card fade-in';
    card.href = isExternal ? item.link : '#';
    if (isExternal) {
      card.target = '_blank';
      card.rel = 'noopener noreferrer';
    }

    const dateStr = item.pubDate
      ? new Date(item.pubDate).toLocaleDateString('en-US', {
          day: '2-digit', month: 'short', year: 'numeric'
        })
      : '';

    card.innerHTML = `
      <div class="card-meta">
        <span class="card-source">${escHtml(item.source)}</span>
        <span class="card-category">${escHtml(item.category)}</span>
      </div>
      <h3 class="card-title">${escHtml(item.title)}</h3>
      ${item.summary ? `<p class="card-summary">${escHtml(item.summary)}</p>` : ''}
      <div class="card-footer">
        <span class="card-date">${dateStr}</span>
        <i class="fa fa-external-link-alt card-link-icon"></i>
      </div>
    `;
    return card;
  }

  function renderFeed() {
    const start = (state.currentPage - 1) * CONFIG.itemsPerPage;
    const end   = state.currentPage * CONFIG.itemsPerPage;
    const page  = state.filteredItems.slice(start, end);

    if (state.currentPage === 1) {
      feedGrid.innerHTML = '';
    }

    if (state.filteredItems.length === 0) {
      feedGrid.innerHTML = '';
      feedEmpty.style.display = 'block';
      loadMoreBtn.style.display = 'none';
      return;
    }

    feedEmpty.style.display = 'none';

    page.forEach((item, i) => {
      const card = createArticleCard(item);
      card.style.animationDelay = (i * 50) + 'ms';
      feedGrid.appendChild(card);
    });

    const hasMore = end < state.filteredItems.length;
    loadMoreBtn.style.display = hasMore ? 'block' : 'none';
    loadMoreBtn.disabled = false;
  }

  /* ═══════════════════════════════════════════
     2b. RENDER TRACKED SOURCES
  ═══════════════════════════════════════════ */

  function renderTrackedSources() {
    const grid = $('#trackedSourcesGrid');
    if (!grid) return;

    // Group by category
    const categories = {};
    TRACKED_SOURCES.forEach(src => {
      if (!categories[src.category]) categories[src.category] = [];
      categories[src.category].push(src);
    });

    const catIcons = {
      'DevOps': '⚙',
      'Kubernetes': '☸',
      'Cloud Native': '☁',
      'IaC': '🏗',
      'Containers': '🐳',
      'Security': '🔒',
      'Observability': '🔭',
      'Architecture': '🏛',
      'AI/MLOps': '🤖',
    };

    let html = '';
    Object.entries(categories).sort((a, b) => b[1].length - a[1].length).forEach(([cat, sources]) => {
      const icon = catIcons[cat] || '📡';
      html += `<div class="tracked-cat">
        <div class="tracked-cat-header">
          <span class="tracked-cat-icon">${icon}</span>
          <h4 class="tracked-cat-name">${cat}</h4>
          <span class="tracked-cat-count">${sources.length}</span>
        </div>
        <div class="tracked-cat-list">`;
      sources.forEach(src => {
        html += `<a class="tracked-source" href="${src.url}" target="_blank" rel="noopener">
          <span class="tracked-source-name">${escHtml(src.name)}</span>
          <i class="fa fa-external-link-alt tracked-source-link"></i>
        </a>`;
      });
      html += `</div></div>`;
    });

    grid.innerHTML = html;

    // Update total count
    const countEl = $('#trackedTotalCount');
    if (countEl) countEl.textContent = TRACKED_SOURCES.length;
  }

  /* ═══════════════════════════════════════════
     3. FILTERING & SEARCH
  ═══════════════════════════════════════════ */

  function applyFilters() {
    const q   = state.searchQuery.toLowerCase();
    const cat = state.activeCategory;

    state.filteredItems = state.allItems.filter(item => {
      const matchCat  = cat === 'all' || item.category === cat;
      const matchQ    = !q
        || item.title.toLowerCase().includes(q)
        || (item.summary || '').toLowerCase().includes(q)
        || item.source.toLowerCase().includes(q);
      return matchCat && matchQ;
    });

    state.currentPage = 1;
    renderFeed();
  }

  $$('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeCategory = btn.dataset.category;
      applyFilters();
    });
  });

  let searchTimer;
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        state.searchQuery = searchInput.value.trim();
        applyFilters();
      }, CONFIG.searchDebounceMs);
    });
  }

  function handleURLParams() {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (q && searchInput) {
      searchInput.value = q;
      state.searchQuery = q;
    }
  }

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      loadMoreBtn.disabled = true;
      state.currentPage++;
      renderFeed();
    });
  }

  /* ═══════════════════════════════════════════
     4. NAV & UI
  ═══════════════════════════════════════════ */

  const sections = ['sources', 'feed', 'stats', 'tools', 'learning'];
  const navLinks = $$('.nav-link[data-section]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        const link = document.querySelector(`.nav-link[data-section="${entry.target.id}"]`);
        if (link) link.classList.add('active');
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });

  if (hamburger && mainNav) {
    hamburger.addEventListener('click', () => {
      mainNav.classList.toggle('open');
    });
    document.addEventListener('click', (e) => {
      if (!hamburger.contains(e.target) && !mainNav.contains(e.target)) {
        mainNav.classList.remove('open');
      }
    });
  }

  const savedTheme = localStorage.getItem('devopsradar-theme') || 'dark';
  if (savedTheme === 'light') document.body.classList.add('light-theme');

  if (themeToggle) {
    updateThemeIcon();
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('light-theme');
      const isLight = document.body.classList.contains('light-theme');
      localStorage.setItem('devopsradar-theme', isLight ? 'light' : 'dark');
      updateThemeIcon();
    });
  }

  function updateThemeIcon() {
    if (!themeToggle) return;
    const isLight = document.body.classList.contains('light-theme');
    themeToggle.querySelector('i').className = isLight ? 'fa fa-sun' : 'fa fa-moon';
  }

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    }, { passive: true });

    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const siblings = entry.target.parentElement
          ? [...entry.target.parentElement.querySelectorAll('.reveal')]
          : [];
        const siblingIndex = siblings.indexOf(entry.target);
        const delay = siblingIndex >= 0 ? siblingIndex * 60 : 0;
        setTimeout(() => { entry.target.classList.add('visible'); }, delay);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  $$('.reveal').forEach(el => revealObserver.observe(el));

  /* ═══════════════════════════════════════════
     5. UTILITIES
  ═══════════════════════════════════════════ */

  function escHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function showToast(msg, ms = 4000) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(16px)';
      toast.style.transition = 'all .3s ease';
      setTimeout(() => toast.remove(), 300);
    }, ms);
  }

  /* ═══════════════════════════════════════════
     6. DYNAMIC DATES
  ═══════════════════════════════════════════ */

  function updateDynamicDates() {
    const now = new Date();
    const year = now.getFullYear();
    const dateStr = now.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });

    $$('.stat-year').forEach(el => { el.textContent = dateStr; });
    $$('.stat-source').forEach(el => {
      el.textContent = el.textContent.replace(/\b20\d{2}\b/g, String(year));
    });

    const trendTitle = $('.trend-title');
    if (trendTitle) {
      trendTitle.innerHTML = '🔥 ' + year + '–' + (year + 1) + ' DevOps Trends';
    }
  }

  /* ═══════════════════════════════════════════
     7. INIT
  ═══════════════════════════════════════════ */

  async function init() {
    handleURLParams();
    updateDynamicDates();
    renderTrackedSources();

    const data = await loadFeedData();
    state.allItems = data.items || [];
    state.filteredItems = [...state.allItems];

    renderStatusBar(data);
    renderKPIs(data);
    applyFilters();
  }

  const statBars = $$('.stat-bar');
  const barObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.animationPlayState = 'running';
        barObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  statBars.forEach(b => {
    b.style.animationPlayState = 'paused';
    barObserver.observe(b);
  });

  document.addEventListener('DOMContentLoaded', init);

})();
