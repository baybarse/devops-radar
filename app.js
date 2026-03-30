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
      ['Platform Engineering: The Next DevOps Evolution', 'Platform Engineering', 'DevOps'],
      ['Kubernetes 1.30 Release: What\'s New', 'Kubernetes Release', 'Kubernetes'],
      ['GitOps vs. Traditional CI/CD: A Deep Dive', 'GitOps Deep Dive', 'DevOps'],
      ['OpenTelemetry: Unified Observability Standard', 'OpenTelemetry Guide', 'Observability'],
      ['Terraform vs OpenTofu: 2024 Comparison', 'IaC Comparison', 'IaC'],
      ['Securing Kubernetes Supply Chain with Sigstore', 'K8s Security', 'Security'],
      ['eBPF: Revolutionizing Linux Kernel Observability', 'eBPF Guide', 'Observability'],
      ['Backstage: Building Internal Developer Portals', 'IDP Tutorial', 'DevOps'],
      ['Docker vs. Podman: Container Wars in 2024', 'Container Comparison', 'Containers'],
      ['SRE Error Budgets: A Practical Guide', 'SRE Guide', 'Architecture'],
      ['ArgoCD + Helm: Production GitOps Patterns', 'GitOps Patterns', 'Kubernetes'],
      ['AI/ML Model Serving with Kubernetes', 'MLOps Tutorial', 'AI/MLOps'],
      ['Chaos Engineering: Building Resilient Systems', 'Chaos Engineering', 'DevOps'],
      ['FinOps: Cloud Cost Optimization Strategies', 'FinOps Guide', 'Cloud Native'],
      ['Crossplane: Infrastructure from Kubernetes', 'Crossplane Tutorial', 'IaC'],
      ['Service Mesh Showdown: Istio vs Cilium', 'Service Mesh', 'Kubernetes'],
      ['SBOM: Why Software Bill of Materials Matters', 'Security SBOM', 'Security'],
      ['Karpenter: Smart Kubernetes Node Provisioning', 'Karpenter Tutorial', 'Kubernetes'],
      ['WebAssembly on the Server: WASI and Kubernetes', 'WASM Guide', 'Cloud Native'],
      ['Dagger: CI/CD Pipelines as Code', 'CI/CD Tutorial', 'DevOps'],
      ['VictoriaMetrics vs Prometheus: Scalable Metrics', 'Metrics Comparison', 'Observability'],
      ['Falco Runtime Security: Practical Guide', 'Security Falco', 'Security'],
      ['Dapr: Portable Microservices Runtime', 'Dapr Tutorial', 'Architecture'],
      ['Flux CD 2.0: GitOps for the Enterprise', 'Flux CD Guide', 'DevOps'],
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
        summary: summary + ': Bu makale ' + src.category + ' alanındaki en son gelişmeleri kapsamlı şekilde ele almaktadır.',
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
    const cats    = [...new Set(data.items.map(i => i.category))];

    if (lastUpdated) {
      const d = new Date(data.lastUpdated);
      lastUpdated.textContent = data._demo
        ? 'Demo Modu'
        : 'Son güncelleme: ' + d.toLocaleString('tr-TR');
    }
    if (totalItems)   totalItems.textContent = data.totalItems + ' makale';
    if (sourceCount)  sourceCount.textContent = sources.length + ' kaynak';
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
      ? new Date(item.pubDate).toLocaleDateString('tr-TR', {
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
      card.style.animationDelay = (i * 40) + 'ms';
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

  function showToast(msg, ms = 3000) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), ms);
  }

  /* ═══════════════════════════════════════════
     6. INIT
  ═══════════════════════════════════════════ */

  async function init() {
    handleURLParams();

    const data = await loadFeedData();
    state.allItems = data.items || [];
    state.filteredItems = [...state.allItems];

    renderStatusBar(data);
    renderKPIs(data);
    applyFilters();

    if (data._demo) {
      showToast('📡 Demo modu: Gerçek feed için GitHub Actions\'ı çalıştırın.');
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
