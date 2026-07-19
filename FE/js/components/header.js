/**
 * Header Component — Sticky navigation with mobile hamburger menu
 */
function renderHeader() {
  const header = document.getElementById('main-header');
  const currentHash = window.location.hash.slice(1) || '/';

  const navItems = [
    { path: '/', label: 'Beranda', icon: 'home' },
    { path: '/profil', label: 'Profil Desa', icon: 'landmark' },
    { path: '/layanan', label: 'Layanan Surat', icon: 'file-text' },
    { path: '/umkm', label: 'UMKM', icon: 'shopping-bag' },
    { path: '/kontak', label: 'Kontak', icon: 'phone' },
  ];

  const isActive = (path) => {
    if (path === '/') return currentHash === '/';
    return currentHash.startsWith(path);
  };

  header.innerHTML = `
    <div class="site-header" id="site-header">
      <div class="header-inner">
        <a href="#/" class="header-logo" id="header-logo">
          <div class="logo-icon">DS</div>
          <div class="logo-text">
            <span class="logo-title">Desa Sukarama</span>
            <span class="logo-subtitle">Kec. Bojongpicung, Kab. Cianjur</span>
          </div>
        </a>

        <nav class="nav-menu" id="nav-menu">
          ${navItems.map(item => `
            <a href="#${item.path}" class="nav-link ${isActive(item.path) ? 'active' : ''}" data-nav>
              <i data-lucide="${item.icon}"></i>
              ${item.label}
            </a>
          `).join('')}
        </nav>

        <div class="hamburger" id="hamburger" aria-label="Menu">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
    <div class="mobile-nav-overlay" id="mobile-overlay"></div>
  `;

  // Initialize icons
  if (window.lucide) lucide.createIcons();

  // Hamburger toggle
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('nav-menu');
  const overlay = document.getElementById('mobile-overlay');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navMenu.classList.toggle('open');
    overlay.classList.toggle('visible');
    document.body.style.overflow = navMenu.classList.contains('open') ? 'hidden' : '';
  });

  overlay.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navMenu.classList.remove('open');
    overlay.classList.remove('visible');
    document.body.style.overflow = '';
  });

  // Close mobile nav on link click
  navMenu.querySelectorAll('[data-nav]').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navMenu.classList.remove('open');
      overlay.classList.remove('visible');
      document.body.style.overflow = '';
    });
  });

  // Scroll effect
  const siteHeader = document.getElementById('site-header');
  window.addEventListener('scroll', () => {
    siteHeader.classList.toggle('scrolled', window.scrollY > 10);
  });
}
