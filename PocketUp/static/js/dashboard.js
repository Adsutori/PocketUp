/* ================================================================
   POCKETUP — dashboard.js
================================================================ */

document.addEventListener('DOMContentLoaded', () => {

  const sidebar       = document.getElementById('sidebar');
  const mainWrapper   = document.getElementById('mainWrapper');
  const collapseBtn   = document.getElementById('sidebarCollapseBtn');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const overlay       = document.getElementById('sidebarOverlay');
  const navLinks      = document.querySelectorAll('.db-nav-link');

  if (!sidebar || !mainWrapper) return; // nie jesteśmy na dashboardzie

  // ── 1. Collapse / expand ─────────────────────────────────
  const STORAGE_KEY = 'pocketup_sidebar_collapsed';

  const applyCollapsed = (collapsed, animate = true) => {
    if (!animate) {
      sidebar.style.transition     = 'none';
      mainWrapper.style.transition = 'none';
    }
    sidebar.classList.toggle('collapsed', collapsed);
    mainWrapper.classList.toggle('sidebar-collapsed', collapsed);
    if (!animate) {
      requestAnimationFrame(() => {
        sidebar.style.transition     = '';
        mainWrapper.style.transition = '';
      });
    }
    localStorage.setItem(STORAGE_KEY, collapsed ? '1' : '0');
  };

  applyCollapsed(localStorage.getItem(STORAGE_KEY) === '1', false);

  collapseBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    applyCollapsed(!sidebar.classList.contains('collapsed'));
  });

  // ── 2. Mobile sidebar ────────────────────────────────────
  const openSidebar  = () => { sidebar.classList.add('open');    overlay?.classList.add('active');    document.body.style.overflow = 'hidden'; };
  const closeSidebar = () => { sidebar.classList.remove('open'); overlay?.classList.remove('active'); document.body.style.overflow = ''; };

  sidebarToggle?.addEventListener('click', () =>
    sidebar.classList.contains('open') ? closeSidebar() : openSidebar()
  );
  overlay?.addEventListener('click', closeSidebar);
  navLinks.forEach(l => l.addEventListener('click', () => {
    if (window.innerWidth <= 768) closeSidebar();
  }));

// ── 3. Active nav link ────────────────────────────────────
const path = window.location.pathname;
let matched = false;

const sortedLinks = [...navLinks].sort((a, b) => 
  (b.getAttribute('href') || '').length - (a.getAttribute('href') || '').length
);

sortedLinks.forEach(link => {
  const href = link.getAttribute('href');
  if (!href) return;
  if (href === '/') {
    if (path === '/') { link.classList.add('active'); matched = true; }
  } else {
    if (path === href || path.startsWith(href + '?') || path === href.replace(/\/$/, '')) {
      if (!matched) { link.classList.add('active'); matched = true; }
    }
  }
});

if (!matched) {
  document.querySelector('.db-nav-link[data-page="dashboard"]')?.classList.add('active');
}


  // ── 4. Tooltips (jeden globalny, position: fixed) ─────────
  const tooltip = document.createElement('div');
  tooltip.className = 'db-nav-tooltip';
  document.body.appendChild(tooltip);

  navLinks.forEach(link => {
    const label = link.querySelector('.db-nav-label')?.textContent?.trim();
    if (!label) return;
    link.addEventListener('mouseenter', () => {
      if (!sidebar.classList.contains('collapsed')) return;
      const rect = link.getBoundingClientRect();
      tooltip.textContent      = label;
      tooltip.style.top        = `${rect.top + rect.height / 2}px`;
      tooltip.style.left       = `${rect.right + 10}px`;
      tooltip.style.transform  = 'translateY(-50%)';
      tooltip.style.opacity    = '1';
    });
    link.addEventListener('mouseleave', () => {
      tooltip.style.opacity = '0';
    });
  });

  // ── 5. Avatar initials ────────────────────────────────────
  const initialsEl = document.getElementById('avatarInitials');
  if (initialsEl) {
    const nick = document.getElementById('userAvatar')?.dataset.nick
      || document.querySelector('.db-greeting-name')?.textContent?.trim()
      || 'U';
    initialsEl.textContent = nick.replace(/[^a-zA-Z0-9]/g, '').slice(0, 2).toUpperCase() || 'U';
  }

  // ── 6. Scroll reveal ─────────────────────────────────────
  const revealObserver = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); revealObserver.unobserve(e.target); }
    }),
    { threshold: 0.12 }
  );
  document.querySelectorAll('.reveal, .reveal-left, .reveal-right')
    .forEach(el => revealObserver.observe(el));

  // ── 7. Logout confirmation ────────────────────────────────
  document.getElementById('logoutForm')?.addEventListener('submit', e => {
    if (!window.confirm('Are you sure you want to log out?')) e.preventDefault();
  });

});

function toggleFilters() {
  const panel = document.getElementById('filtersPanel');
  const btn   = document.getElementById('filtersToggle');
  panel.classList.toggle('open');
  btn.classList.toggle('open');
}

document.addEventListener('DOMContentLoaded', () => {
  const panel = document.getElementById('filtersPanel');
  const btn   = document.getElementById('filtersToggle');
  if (btn.classList.contains('active')) {
    panel.classList.add('open');
  }
  updateAmountRange();
  updateFiltersCount();
});

// ── Dual range ──
function updateAmountRange(e) {
  const minSlider = document.getElementById('amountMinSlider');
  const maxSlider = document.getElementById('amountMaxSlider');
  const fill      = document.getElementById('amountRangeFill');

  let minVal = parseInt(minSlider.value);
  let maxVal = parseInt(maxSlider.value);

  if (minVal > maxVal) {
    if (e && e.target === minSlider) {
      minSlider.value = maxVal;
      minVal = maxVal;
    } else {
      maxSlider.value = minVal;
      maxVal = minVal;
    }
  }

  const rangeMin = parseInt(minSlider.min);
  const rangeMax = parseInt(minSlider.max);
  const pctLeft  = ((minVal - rangeMin) / (rangeMax - rangeMin)) * 100;
  const pctRight = ((maxVal - rangeMin) / (rangeMax - rangeMin)) * 100;

  fill.style.left  = pctLeft  + '%';
  fill.style.width = (pctRight - pctLeft) + '%';

  document.getElementById('amountMinDisplay').textContent = minVal;
  document.getElementById('amountMaxDisplay').textContent = maxVal;

  document.getElementById('amountMinInput').value = minVal === rangeMin ? '' : minVal;
  document.getElementById('amountMaxInput').value = maxVal === rangeMax ? '' : maxVal;
}


function updateDateDisplay() {
  const from = document.getElementById('dateFrom').value;
  const to   = document.getElementById('dateTo').value;
  document.getElementById('dateFromDisplay').textContent = from || 'Start';
  document.getElementById('dateToDisplay').textContent   = to   || 'Today';
}

function updateFiltersCount() {
  const btn   = document.getElementById('filtersToggle');
  const count = document.getElementById('filtersCount');
  let active  = 0;

  if (btn.classList.contains('active')) {
    const params = new URLSearchParams(window.location.search);
    ['amount_min','amount_max','date_from','date_to','category'].forEach(k => {
      if (params.get(k)) active++;
    });
  }

  if (active > 0) {
    count.textContent    = active;
    count.style.display  = 'flex';
  } else {
    count.style.display  = 'none';
  }
}

// ── Clear search ──
function clearSearch() {
  const input = document.querySelector('.search-input');
  input.value = '';
  input.focus();
}

