/* ----------------------------------------------------------------
   NAVBAR — scroll shadow + active link
---------------------------------------------------------------- */
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
  highlightActiveLink();
}, { passive: true });

function highlightActiveLink() {
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 120) current = s.id;
  });
  navLinks.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + current);
  });
}

/* ----------------------------------------------------------------
   HAMBURGER / MOBILE NAV
---------------------------------------------------------------- */
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');
let navOpen = false;

hamburger.addEventListener('click', toggleMobileNav);
hamburger.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleMobileNav(); }
});

function toggleMobileNav() {
  navOpen = !navOpen;
  mobileNav.classList.toggle('open', navOpen);
  hamburger.setAttribute('aria-expanded', navOpen);
  const spans = hamburger.querySelectorAll('span');
  if (navOpen) {
    spans[0].style.transform = 'rotate(45deg) translate(5px,5px)';
    spans[1].style.opacity   = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px,-5px)';
  } else {
    spans.forEach(x => { x.style.transform = ''; x.style.opacity = ''; });
  }
}

function closeMobileNav() {
  navOpen = false;
  mobileNav.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.querySelectorAll('span').forEach(x => {
    x.style.transform = '';
    x.style.opacity   = '';
  });
}

document.addEventListener('click', e => {
  if (navOpen && !mobileNav.contains(e.target) && !hamburger.contains(e.target)) {
    closeMobileNav();
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && navOpen) closeMobileNav();
});

/* ----------------------------------------------------------------
   SMOOTH SCROLL
---------------------------------------------------------------- */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
      closeMobileNav();
    }
  });
});

/* ----------------------------------------------------------------
   SCROLL REVEAL
---------------------------------------------------------------- */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal, .reveal-left, .reveal-right')
  .forEach(el => revealObserver.observe(el));

/* ----------------------------------------------------------------
   PROGRESS BARS — animate on scroll
---------------------------------------------------------------- */
const progressObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.progress-fill').forEach(bar => {
        bar.style.width = bar.dataset.width;
      });
      progressObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.sv-card, .db-card').forEach(el => progressObserver.observe(el));

/* ----------------------------------------------------------------
   ANIMATED COUNTERS
---------------------------------------------------------------- */
function animateValue(el, target, prefix, suffix, isFloat, duration) {
  duration = duration || 1600;
  var start = 0;
  var startTime = performance.now();
  function tick(now) {
    var elapsed  = now - startTime;
    var progress = Math.min(elapsed / duration, 1);
    var ease     = 1 - Math.pow(1 - progress, 3);
    var current  = start + (target - start) * ease;
    el.textContent = prefix + (isFloat ? current.toFixed(1) : Math.floor(current).toLocaleString()) + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.querySelectorAll('[data-target]').forEach(el => {
      var target  = parseFloat(el.dataset.target);
      var prefix  = el.dataset.prefix  || '';
      var suffix  = el.dataset.suffix  || '';
      var isFloat = el.dataset.float === 'true';
      animateValue(el, target, prefix, suffix, isFloat);
    });
    counterObserver.unobserve(entry.target);
  });
}, { threshold: 0.4 });

document.querySelectorAll('.stats-strip').forEach(el => counterObserver.observe(el));

/* Dashboard counters */
const dbCounterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    var savingsEl = document.getElementById('counterSavings');
    var spentEl   = document.getElementById('counterSpent');
    if (savingsEl) animateValue(savingsEl, 840,  'EUR', '', false);
    if (spentEl)   animateValue(spentEl,   2360, 'EUR', '', false);
    dbCounterObserver.unobserve(entry.target);
  });
}, { threshold: 0.3 });

var dbSection = document.getElementById('dashboard');
if (dbSection) dbCounterObserver.observe(dbSection);

/* Hero balance count-up */
window.addEventListener('load', function() {
  var el = document.getElementById('heroBalance');
  if (el) animateValue(el, 8420, 'EUR', '', false, 1200);
});

/* ----------------------------------------------------------------
   CARD TILT EFFECT
---------------------------------------------------------------- */
function addTilt(selector, maxAngle) {
  maxAngle = maxAngle || 4;
  document.querySelectorAll(selector).forEach(card => {
    card.addEventListener('mousemove', e => {
      var r = card.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width  - 0.5;
      var y = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transform =
        'perspective(700px) rotateX(' + (-y * maxAngle * 2) + 'deg) rotateY(' + (x * maxAngle * 2) + 'deg) translateY(-5px)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}
addTilt('.feat-card', 3);
addTilt('.testi-card', 2.5);
addTilt('.price-card', 2);

/* ----------------------------------------------------------------
   FEATURE CARDS — staggered entrance
---------------------------------------------------------------- */
(function initFeatureStagger() {
  var grid = document.querySelector('.features-grid');
  if (!grid) return;

  var obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      var cards = entry.target.querySelectorAll('.feat-card');
      cards.forEach((card, i) => {
        card.style.opacity   = '0';
        card.style.transform = 'translateY(28px)';
        setTimeout(() => {
          card.style.transition = 'opacity .55s ease, transform .55s ease';
          card.style.opacity    = '1';
          card.style.transform  = 'translateY(0)';
        }, i * 100);
      });
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.1 });

  obs.observe(grid);
})();

/* ----------------------------------------------------------------
   SAVINGS PROGRESS BARS — trigger on scroll
---------------------------------------------------------------- */
(function initProgressBars() {
  var obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.querySelectorAll('.progress-fill[data-width]').forEach(bar => {
        setTimeout(() => { bar.style.width = bar.dataset.width; }, 200);
      });
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.25 });

  document.querySelectorAll('.sv-card, .db-card, .savings-section, .dashboard-section')
    .forEach(el => obs.observe(el));
})();

/* ----------------------------------------------------------------
   SECURITY ITEMS — staggered entrance
---------------------------------------------------------------- */
(function initSecurityStagger() {
  var visual = document.querySelector('.security-visual');
  if (!visual) return;

  var obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.querySelectorAll('.sec-item').forEach((item, i) => {
        item.style.opacity   = '0';
        item.style.transform = 'translateX(20px)';
        setTimeout(() => {
          item.style.transition = 'opacity .45s ease, transform .45s ease';
          item.style.opacity    = '1';
          item.style.transform  = 'translateX(0)';
        }, i * 120);
      });
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.2 });

  obs.observe(visual);
})();

/* ----------------------------------------------------------------
   BADGE HOVER — pop animation
---------------------------------------------------------------- */
document.querySelectorAll('.badge-item:not(.locked)').forEach(badge => {
  var emoji = badge.querySelector('.badge-emoji');
  if (!emoji) return;
  badge.addEventListener('mouseenter', () => {
    emoji.style.transition = 'transform .25s cubic-bezier(.34,1.56,.64,1)';
    emoji.style.transform  = 'scale(1.3) rotate(-8deg)';
  });
  badge.addEventListener('mouseleave', () => {
    emoji.style.transform = '';
  });
});

/* ----------------------------------------------------------------
   PRICING — highlight better deal
---------------------------------------------------------------- */
(function highlightBetterPricingDeal() {
  var savings = 840;
  var perfFee = +(savings * 0.005).toFixed(2);
  var flatFee = 4.99;
  var cards   = document.querySelectorAll('.price-card');
  if (cards.length < 2) return;
  if (perfFee < flatFee) {
    cards[1].style.boxShadow = '0 0 0 4px rgba(29,185,84,.2), 0 20px 48px rgba(0,0,0,.10)';
  } else {
    cards[0].style.boxShadow = '0 0 0 4px rgba(29,185,84,.2), 0 20px 48px rgba(0,0,0,.10)';
  }
})();

/* ----------------------------------------------------------------
   CHART.JS — Hero Mini Chart
---------------------------------------------------------------- */
(function initHeroChart() {
  var ctx = document.getElementById('heroMiniChart');
  if (!ctx) return;
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Feb','Mar','Apr','May','Jun','Jul'],
      datasets: [
        {
          label: 'Income',
          data: [2800, 3000, 2950, 3100, 3050, 3200],
          backgroundColor: 'rgba(29,185,84,.75)',
          borderRadius: 4,
          borderSkipped: false
        },
        {
          label: 'Expenses',
          data: [2200, 2400, 2100, 2500, 2300, 2360],
          backgroundColor: 'rgba(56,189,248,.65)',
          borderRadius: 4,
          borderSkipped: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        tooltip: { mode: 'index', intersect: false }
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 9 }, color: '#9CA3AF' } },
        y: { display: false, grid: { display: false } }
      },
      animation: { duration: 1200, easing: 'easeOutQuart' }
    }
  });
})();

/* ----------------------------------------------------------------
   CHART.JS — Weekly Savings Chart
---------------------------------------------------------------- */
(function initWeeklyChart() {
  var ctx = document.getElementById('weeklyChart');
  if (!ctx) return;
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
      datasets: [{
        label: 'Daily Spend',
        data: [42, 18, 65, 30, 88, 120, 25],
        borderColor: '#1DB954',
        backgroundColor: 'rgba(29,185,84,.08)',
        borderWidth: 2.5,
        pointBackgroundColor: '#1DB954',
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: { legend: { display: false } },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 9 }, color: '#9CA3AF' }
        },
        y: {
          grid: { color: 'rgba(0,0,0,.04)' },
          ticks: {
            font: { size: 9 },
            color: '#9CA3AF',
            callback: function(v) { return 'EUR' + v; }
          }
        }
      },
      animation: { duration: 1400, easing: 'easeOutQuart' }
    }
  });
})();

/* ----------------------------------------------------------------
   CHART.JS — Spending Trend (Dashboard)
---------------------------------------------------------------- */
(function initSpendingChart() {
  var ctx = document.getElementById('spendingChart');
  if (!ctx) return;
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['February','March','April','May','June','July'],
      datasets: [
        {
          label: 'Income',
          data: [2800, 3000, 2950, 3100, 3050, 3200],
          backgroundColor: 'rgba(29,185,84,.8)',
          borderRadius: 6,
          borderSkipped: false
        },
        {
          label: 'Expenses',
          data: [2200, 2400, 2100, 2500, 2300, 2360],
          backgroundColor: 'rgba(56,189,248,.7)',
          borderRadius: 6,
          borderSkipped: false
        },
        {
          label: 'Savings',
          data: [600, 600, 850, 600, 750, 840],
          backgroundColor: 'rgba(168,85,247,.65)',
          borderRadius: 6,
          borderSkipped: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: { font: { size: 11 }, color: '#6B7280', boxWidth: 12, padding: 16 }
        },
        tooltip: { mode: 'index', intersect: false }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 10 }, color: '#9CA3AF' }
        },
        y: {
          grid: { color: 'rgba(0,0,0,.04)' },
          ticks: {
            font: { size: 10 },
            color: '#9CA3AF',
            callback: function(v) { return 'EUR' + v; }
          }
        }
      },
      animation: { duration: 1400, easing: 'easeOutQuart' }
    }
  });
})();

/* ----------------------------------------------------------------
   CHART.JS — Pie / Doughnut Chart (Dashboard)
---------------------------------------------------------------- */
(function initPieChart() {
  var ctx = document.getElementById('pieChart');
  if (!ctx) return;
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Food','Transport','Bills','Entertainment','Health','Other'],
      datasets: [{
        data: [342, 180, 420, 210, 95, 113],
        backgroundColor: [
          '#1DB954','#38BDF8','#a855f7','#f59e0b','#ef4444','#94a3b8'
        ],
        borderWidth: 2,
        borderColor: '#fff',
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      cutout: '62%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { font: { size: 10 }, color: '#6B7280', boxWidth: 10, padding: 10 }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return ' ' + context.label + ': EUR' + context.parsed;
            }
          }
        }
      },
      animation: { duration: 1400, easing: 'easeOutQuart' }
    }
  });
})();

/* ----------------------------------------------------------------
   CHAT — typing animation demo
---------------------------------------------------------------- */
(function initChatTyping() {
  var sendBtn = document.querySelector('.chat-send');
  var input   = document.querySelector('.chat-input-row span');
  var log     = document.querySelector('.chat-messages');
  if (!sendBtn || !input || !log) return;

  var demoQA = [
    {
      q: 'What is my biggest expense category?',
      a: 'Your biggest expense this month is <strong>Bills at EUR420</strong>, followed by Food at EUR342 and Transport at EUR180. Bills are up 8% vs last month.'
    },
    {
      q: 'Am I on track with my savings goal?',
      a: 'Yes! You have saved <strong>EUR840 this month</strong> — that puts your Emergency Fund goal at <strong style="color:#4ade80;">72% complete</strong>. At this rate you will hit it in 6 weeks!'
    },
    {
      q: 'Where can I cut spending this week?',
      a: 'I spotted 3 quick wins: <strong>Cancel unused gym sub (EUR29)</strong>, limit takeaways to 2x/week <strong>(save EUR40)</strong>, and switch to a cheaper phone plan <strong>(save EUR18)</strong>. Total potential saving: <strong style="color:#4ade80;">EUR87/month</strong>.'
    }
  ];

  var demoIndex = 0;

  function appendMessage(text, isUser) {
      var msg = document.createElement('div');
      msg.className = 'chat-msg' + (isUser ? ' user' : '');

      var avatar = document.createElement('div');
      avatar.className = 'chat-avatar ' + (isUser ? 'user-av' : 'ai-av');
      avatar.innerHTML = isUser
          ? '<i data-lucide="user"></i>'
          : '<i data-lucide="bot-message-square"></i>';

      var bubble = document.createElement('div');
      bubble.className = 'chat-bubble ' + (isUser ? 'user-bubble' : 'ai-bubble');
      bubble.innerHTML = text;

      msg.appendChild(avatar);
      msg.appendChild(bubble);
      log.appendChild(msg);
      log.scrollTop = log.scrollHeight;

      lucide.createIcons();
  }

  function showTypingIndicator() {
    var msg    = document.createElement('div');
    msg.className = 'chat-msg';
    msg.id = 'typingIndicator';

    var avatar = document.createElement('div');
    avatar.className = 'chat-avatar ai-av';
    avatar.textContent = 'AI';

    var bubble = document.createElement('div');
    bubble.className = 'chat-bubble ai-bubble';
    bubble.innerHTML = '<span style="letter-spacing:3px;opacity:.6;">&#9679; &#9679; &#9679;</span>';

    msg.appendChild(avatar);
    msg.appendChild(bubble);
    log.appendChild(msg);
    log.scrollTop = log.scrollHeight;
  }

  function removeTypingIndicator() {
    var el = document.getElementById('typingIndicator');
    if (el) el.remove();
  }

  sendBtn.addEventListener('click', function() {
    var qa = demoQA[demoIndex % demoQA.length];
    demoIndex++;
    appendMessage(qa.q, true);
    input.textContent = '';
    showTypingIndicator();
    setTimeout(function() {
      removeTypingIndicator();
      appendMessage(qa.a, false);
      var next = demoQA[demoIndex % demoQA.length];
      input.textContent = next ? next.q : 'Ask anything about your finances...';
    }, 1200);
  });

  input.textContent = demoQA[0].q;
})();

/* ----------------------------------------------------------------
   LAZY INIT DASHBOARD CHARTS on scroll
---------------------------------------------------------------- */
(function lazyInitDashboardCharts() {
  var dashSection = document.getElementById('dashboard');
  if (!dashSection) return;

  var obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      if (typeof Chart !== 'undefined' && Chart.instances) {
        Object.values(Chart.instances).forEach(chart => {
          if (dashSection.contains(chart.canvas)) {
            chart.reset();
            chart.update();
          }
        });
      }
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.15 });

  obs.observe(dashSection);
})();



// Password toggle
document.querySelectorAll('.toggle-password').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = btn.previousElementSibling;
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
  });
});
