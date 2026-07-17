/**
 * DevOps Radar — Main Application JS
 * Handles: Feed loading, filtering, search, theme toggle, UI state
 */

(function () {
  'use strict';

  /* ── Config ── */
  const CONFIG = {
    feedDataUrl: 'data/feeds.json',
    itemsPerPage: 12,
    searchDebounceMs: 300,
  };

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
      console.warn('Feed data not found, using fallback demo data.', err);
      return getFallbackData();
    }
  }

  function getFallbackData() {
    // Demo data while GitHub Actions hasn't run yet
    const sources = [
      { name: 'The New Stack',   category: 'Cloud Native' },
      { name: 'DevOps.com',      category: 'DevOps'       },
      { name: 'CNCF Blog',       category: 'Cloud Native' },
      { name: 'Kubernetes Blog', category: 'Kubernetes'   },
      { name: 'HashiCorp Blog',  category: 'IaC'          },
      { name: 'GitHub Blog',     category: 'DevOps'       },
      { name: 'Docker Blog',     category: 'Containers'   },
      { name: 'Martin Fowler',   category: 'Architecture' },
      { name: 'InfoQ DevOps',    category: 'DevOps'       },
      { name: 'Sysdig Blog',     category: 'Security'     },
    ];

    const demoTitles = [
      ['Platform Engineering: The Next DevOps Evolution', 'An in-depth exploration of how platform engineering is reshaping DevOps workflows and developer productivity across the industry.', 'DevOps'],
      ['Kubernetes 1.30 Release: What\'s New', 'A comprehensive breakdown of the latest Kubernetes release, including new features, deprecations, and upgrade considerations.', 'Kubernetes'],
      ['GitOps vs. Traditional CI/CD: A Deep Dive', 'Comparing GitOps-based deployment strategies with traditional CI/CD pipelines — pros, cons, and real-world use cases.', 'DevOps'],
      ['OpenTelemetry: Unified Observability Standard', 'How OpenTelemetry is becoming the industry standard for traces, metrics, and logs across distributed systems.', 'Observability'],
      ['Terraform vs OpenTofu: 2024 Comparison', 'A detailed comparison of Terraform and OpenTofu, examining licensing, community support, and feature parity.', 'IaC'],
      ['Securing Kubernetes Supply Chain with Sigstore', 'Best practices for securing your container supply chain using Sigstore, SBOM generation, and image verification.', 'Security'],
      ['eBPF: Revolutionizing Linux Kernel Observability', 'How eBPF is transforming networking, security, and observability at the Linux kernel level without modifying kernel code.', 'Observability'],
      ['Backstage: Building Internal Developer Portals', 'A practical guide to implementing Backstage as your Internal Developer Portal to improve developer experience.', 'DevOps'],
      ['Docker vs. Podman: Container Wars in 2024', 'An updated comparison of Docker and Podman for container development, focusing on rootless containers and Kubernetes compatibility.', 'Containers'],
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
    ];

    const now = new Date();
    const items = demoTitles.map(([title, summary, catOverride], i) => {
      const src = sources[i % sources.length];
      const daysAgo = Math.floor(i * 1.5);
      const d = new Date(now);
      d.setDate(d.getDate() - daysAgo);
      return {
        title,
        link: '#demo-' + i,
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
      _demo: true,
    };
  }

  /* ═══════════════════════════════════════════
     2. RENDERING
  ═══════════════════════════════════════════ */

  function renderStatusBar(data) {
    const sources = [...new Set(data.items.map(i => i.source))];

    if (lastUpdated) {
      const d = new Date(data.lastUpdated);
      lastUpdated.textContent = data._demo
        ? 'Demo Mode'
        : 'Last updated: ' + d.toLocaleString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
          });
    }
    if (totalItems)   totalItems.textContent = data.totalItems + ' articles';
    if (sourceCount)  sourceCount.textContent = sources.length + ' sources';
  }

  function renderKPIs(data) {
    const sources = [...new Set(data.items.map(i => i.source))];
    const cats    = [...new Set(data.items.map(i => i.category))];

    animateCounter(kpiArticles,   0, data.totalItems, 1000);
    animateCounter(kpiSources,    0, sources.length,  800);
    animateCounter(kpiCategories, 0, cats.length,     600);
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

    // Clear skeletons on first render
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

  /* ── Filter buttons ── */
  $$('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeCategory = btn.dataset.category;
      applyFilters();
    });
  });

  /* ── Search ── */
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

  /* ── Handle ?q= URL parameter ── */
  function handleURLParams() {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (q && searchInput) {
      searchInput.value = q;
      state.searchQuery = q;
    }
  }

  /* ── Load More ── */
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

  /* Active nav on scroll */
  const sections = ['feed', 'stats', 'tools', 'learning'];
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

  /* Hamburger */
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

  /* Theme Toggle */
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

  /* Smooth scroll for anchor links */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  /* ── Scroll to Top Button ── */
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

  /* ── Reveal on Scroll (Staggered Entrance Animations) ── */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Add a staggered delay based on the element's position among siblings
        const siblings = entry.target.parentElement
          ? [...entry.target.parentElement.querySelectorAll('.reveal')]
          : [];
        const siblingIndex = siblings.indexOf(entry.target);
        const delay = siblingIndex >= 0 ? siblingIndex * 60 : 0;

        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);

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

    // Update all stat year badges to show today's date
    $$('.stat-year').forEach(el => {
      el.textContent = dateStr;
    });

    // Update source text — replace any hardcoded year with current year
    $$('.stat-source').forEach(el => {
      el.textContent = el.textContent.replace(/\b20\d{2}\b/g, String(year));
    });

    // Update trend section title year range
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

    const data = await loadFeedData();
    state.allItems = data.items || [];
    state.filteredItems = [...state.allItems];

    renderStatusBar(data);
    renderKPIs(data);
    applyFilters();

    if (data._demo) {
      showToast('📡 Demo mode: Run GitHub Actions to fetch live feeds.');
    }
  }

  // Animate stat bars when scrolled into view
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
