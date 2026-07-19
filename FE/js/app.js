/**
 * App Router & Utilities
 * Website Desa Sukarama — SPA Router
 */

// ── Routes ───────────────────────────────────────────────
const routes = {
  '/':            renderBeranda,
  '/profil':      renderProfil,
  '/layanan':     renderLayanan,
  '/layanan/cek': renderCekStatus,
  '/umkm':        renderUMKM,
  '/kontak':      renderKontak,
  '/admin':       renderAdmin,
};

// ── Router ───────────────────────────────────────────────
function router() {
  const hash = window.location.hash.slice(1) || '/';
  const content = document.getElementById('main-content');

  // Find matching route
  let renderFn = routes[hash];

  // Check for partial match (e.g., /admin)
  if (!renderFn) {
    const keys = Object.keys(routes).sort((a, b) => b.length - a.length);
    for (const key of keys) {
      if (hash.startsWith(key) && key !== '/') {
        renderFn = routes[key];
        break;
      }
    }
  }

  if (!renderFn) {
    renderFn = routes['/'];
  }

  // Render
  content.innerHTML = '';
  renderFn(content);
  renderHeader();
  renderFooter();

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'instant' });

  // Initialize Lucide icons
  setTimeout(() => {
    if (window.lucide) lucide.createIcons();
  }, 50);

  // Setup scroll animations
  setupScrollAnimations();
}

// ── Scroll Animations ────────────────────────────────────
function setupScrollAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

// ── Scroll to Top Button ─────────────────────────────────
function setupScrollTopButton() {
  const btn = document.getElementById('scroll-top-btn');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ── Toast Notification ───────────────────────────────────
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const iconMap = {
    success: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    error: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    warning: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${iconMap[type] || iconMap.info}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all .3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ── Utility: Format Currency ─────────────────────────────
function formatRupiah(amount) {
  return 'Rp ' + Number(amount).toLocaleString('id-ID');
}

// ── Utility: Format Date ─────────────────────────────────
function formatTanggal(dateStr) {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const d = new Date(dateStr);
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

// ── Utility: Truncate Text ───────────────────────────────
function truncateText(text, maxLength = 120) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

// ── Utility: API Call ────────────────────────────────────
async function apiCall(url, options = {}) {
  const token = localStorage.getItem('admin_token');
  const headers = { ...options.headers };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, { ...options, headers });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Terjadi kesalahan');
  }

  return data;
}

// ── Utility: Escape HTML ─────────────────────────────────
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ── Utility: Image error handler ─────────────────────────
function handleImageError(img) {
  img.onerror = null;
  img.style.display = 'none';
  const placeholder = document.createElement('div');
  placeholder.className = 'card-img-placeholder';
  placeholder.innerHTML = '<i data-lucide="image" style="width:40px;height:40px"></i>';
  img.parentNode.insertBefore(placeholder, img);
  if (window.lucide) lucide.createIcons();
}

// ── Initialize ───────────────────────────────────────────
window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', () => {
  router();
  setupScrollTopButton();
});
