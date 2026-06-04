/**
 * ASHSA — Asian Sports Health Association
 * Shared JavaScript for bilingual conference website
 * Features: mobile nav, scroll animations, nav shadow, reveal on scroll
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {

    // ============================================================
    // MOBILE NAVIGATION
    // ============================================================
    var toggleBtn = document.querySelector('.nav-toggle');
    var navLinks = document.querySelector('.nav-links');

    if (toggleBtn && navLinks) {
      toggleBtn.addEventListener('click', function () {
        navLinks.classList.toggle('show');
        toggleBtn.setAttribute('aria-expanded',
          String(navLinks.classList.contains('show')));
      });

      navLinks.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
          navLinks.classList.remove('show');
          toggleBtn.setAttribute('aria-expanded', 'false');
        });
      });

      document.addEventListener('click', function (e) {
        if (!toggleBtn.contains(e.target) && !navLinks.contains(e.target)) {
          navLinks.classList.remove('show');
          toggleBtn.setAttribute('aria-expanded', 'false');
        }
      });
    }

    // ============================================================
    // ============================================================
    // NEBULA PARTICLE FIELD — dispersing/coalescing cloud clusters
    // ============================================================
    var canvas = document.querySelector('.hero-canvas');
    if (canvas && canvas.getContext) {
      var ctx = canvas.getContext('2d');
      var particles = [];
      var nebulae = [];
      var mouse = { x: -9999, y: -9999, active: false };
      var PARTICLE_COUNT = 150;
      var MOUSE_PULL = 0.003;
      var animId;
      var time = 0;

      function resize() {
        var rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width || canvas.parentElement.offsetWidth || 1200;
        canvas.height = rect.height || canvas.parentElement.offsetHeight || 700;
        // Reposition nebulae on resize
        initNebulae();
      }

      // Create nebula core clusters
      function initNebulae() {
        nebulae = [];
        for (var n = 0; n < 4; n++) {
          nebulae.push({
            cx: canvas.width * (0.2 + Math.random() * 0.6),
            cy: canvas.height * (0.2 + Math.random() * 0.5),
            driftVx: (Math.random() - 0.5) * 0.15,
            driftVy: (Math.random() - 0.5) * 0.1,
            radius: 100 + Math.random() * 160,
            hue: Math.random() < 0.25 ? 'gold' : 'blue'
          });
        }
      }

      setTimeout(function () { resize(); }, 100);
      window.addEventListener('resize', resize);

      // Mouse tracking
      canvas.addEventListener('mousemove', function (e) {
        var rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
        mouse.active = true;
      });
      canvas.addEventListener('mouseleave', function () { mouse.active = false; });
      canvas.addEventListener('touchmove', function (e) {
        e.preventDefault();
        var rect = canvas.getBoundingClientRect();
        mouse.x = e.touches[0].clientX - rect.left;
        mouse.y = e.touches[0].clientY - rect.top;
        mouse.active = true;
      }, { passive: false });
      canvas.addEventListener('touchend', function () { mouse.active = false; });

      // Particle orbiting a nebula core
      function Particle(coreIdx) {
        this.coreIdx = coreIdx;
        var core = nebulae[coreIdx];
        var angle = Math.random() * Math.PI * 2;
        var dist = Math.random() * core.radius;
        this.x = core.cx + Math.cos(angle) * dist;
        this.y = core.cy + Math.sin(angle) * dist;
        this.orbitAngle = angle;
        this.orbitDist = dist;
        this.orbitSpeed = (Math.random() - 0.5) * 0.004;
        this.radius = Math.random() * 1.6 + 0.3;
        this.baseAlpha = Math.random() * 0.3 + 0.08;
        this.alpha = this.baseAlpha;
        this.phase = Math.random() * Math.PI * 2;
      }

      Particle.prototype.update = function () {
        time += 0.0003;
        var core = nebulae[this.coreIdx];
        if (!core) return 0;

        // Orbit around nebula core with organic wobble
        this.orbitAngle += this.orbitSpeed + Math.sin(time + this.phase) * 0.002;
        this.orbitDist += Math.sin(time * 0.7 + this.phase) * 0.3;

        // Clamp orbit distance
        this.orbitDist = Math.max(8, Math.min(core.radius * 1.3, this.orbitDist));

        var targetX = core.cx + Math.cos(this.orbitAngle) * this.orbitDist;
        var targetY = core.cy + Math.sin(this.orbitAngle) * this.orbitDist;

        // Mouse pull — particles drift toward cursor
        if (mouse.active) {
          var mdx = mouse.x - targetX;
          var mdy = mouse.y - targetY;
          var mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < 300 && mdist > 1) {
            var pull = MOUSE_PULL * (1 - mdist / 300);
            targetX += mdx * pull * 40;
            targetY += mdy * pull * 40;
            // Boost alpha near mouse
            this.alpha = Math.min(0.7, this.baseAlpha + pull * 0.5);
          } else {
            this.alpha += (this.baseAlpha - this.alpha) * 0.03;
          }
        } else {
          this.alpha += (this.baseAlpha - this.alpha) * 0.02;
        }

        // Smooth movement toward target
        this.x += (targetX - this.x) * 0.04;
        this.y += (targetY - this.y) * 0.04;

        // Twinkle
        var twinkle = 1 + Math.sin(time * 3 + this.phase) * 0.3;
        return Math.max(0, this.alpha * twinkle);
      };

      Particle.prototype.draw = function (alpha) {
        if (alpha < 0.015) return;
        // Soft glow
        var glow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 4);
        if (nebulae[this.coreIdx] && nebulae[this.coreIdx].hue === 'gold') {
          glow.addColorStop(0, 'rgba(255,220,160,' + alpha + ')');
          glow.addColorStop(1, 'rgba(255,220,160,0)');
        } else {
          glow.addColorStop(0, 'rgba(180,210,245,' + alpha + ')');
          glow.addColorStop(1, 'rgba(180,210,245,0)');
        }
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 4, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = nebulae[this.coreIdx].hue === 'gold'
          ? 'rgba(255,240,200,' + (alpha * 1.2) + ')'
          : 'rgba(210,230,255,' + (alpha * 1.2) + ')';
        ctx.fill();
      };

      // Nebula core glow
      function drawNebulaGlow(core) {
        var glow = ctx.createRadialGradient(core.cx, core.cy, 0, core.cx, core.cy, core.radius);
        if (core.hue === 'gold') {
          glow.addColorStop(0, 'rgba(255,200,120,0.04)');
          glow.addColorStop(0.5, 'rgba(255,180,100,0.015)');
        } else {
          glow.addColorStop(0, 'rgba(150,200,240,0.05)');
          glow.addColorStop(0.5, 'rgba(130,180,230,0.02)');
        }
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.arc(core.cx, core.cy, core.radius, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // Drift nebulae slowly
        core.cx += core.driftVx;
        core.cy += core.driftVy;
        // Bounce at edges
        if (core.cx < -50 || core.cx > canvas.width + 50) core.driftVx *= -1;
        if (core.cy < -50 || core.cy > canvas.height + 50) core.driftVy *= -1;
        core.cx = Math.max(-50, Math.min(canvas.width + 50, core.cx));
        core.cy = Math.max(-50, Math.min(canvas.height + 50, core.cy));
      }

      // Init
      initNebulae();
      for (var i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle(i % nebulae.length));
      }

      function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw nebula glows
        for (var n = 0; n < nebulae.length; n++) {
          drawNebulaGlow(nebulae[n]);
        }

        // Draw particles
        for (var i = 0; i < particles.length; i++) {
          var alpha = particles[i].update();
          particles[i].draw(alpha);
        }

        animId = requestAnimationFrame(animate);
      }

      // Pause when off-screen
      var heroObserver = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          if (!animId) animate();
        } else {
          if (animId) { cancelAnimationFrame(animId); animId = null; }
        }
      }, { threshold: 0 });
      heroObserver.observe(canvas.parentElement);

      animate();
    }

    // ============================================================
    // NAV SCROLL SHADOW
    // ============================================================
    var nav = document.querySelector('.nav');
    if (nav) {
      var onScroll = function () {
        if (window.scrollY > 10) {
          nav.classList.add('scrolled');
        } else {
          nav.classList.remove('scrolled');
        }
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll(); // initial check
    }

    // ============================================================
    // ACTIVE NAV LINK DETECTION
    // ============================================================
    var currentPath = window.location.pathname;
    document.querySelectorAll('.nav-links a').forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href) return;

      // Skip language switch links
      if (href.indexOf('../') === 0 && href.indexOf('index.html') === -1) return;

      var linkPath = href.replace(/^\.\.\//, '/').replace(/^\//, '');
      var curPath = currentPath.replace(/^\//, '');

      if (curPath.endsWith(linkPath) ||
          (curPath === '' && linkPath === 'index.html') ||
          (curPath.endsWith('/') && linkPath === 'index.html') ||
          (curPath.endsWith('/en/') && linkPath === 'en/index.html') ||
          (curPath.endsWith('/zh/') && linkPath === 'zh/index.html')) {
        link.classList.add('active');
      }
    });

    // ============================================================
    // SCROLL REVEAL ANIMATIONS (Intersection Observer)
    // ============================================================
    var revealEls = document.querySelectorAll('.reveal, .card, .speaker-card, .stat-card, .reg-box');

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Unobserve after reveal for performance
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -30px 0px'
      });

      revealEls.forEach(function (el) {
        // Only observe elements that have the reveal class or are cards below the fold
        if (el.classList.contains('reveal')) {
          observer.observe(el);
        } else if (el.closest('.section') && !el.closest('.hero')) {
          // Auto-add reveal class to cards in sections (not hero)
          el.classList.add('reveal');
          observer.observe(el);
        }
      });
    } else {
      // Fallback: just show everything
      revealEls.forEach(function (el) { el.classList.add('visible'); });
    }

    // ============================================================
    // SMOOTH SCROLL FOR ANCHOR LINKS
    // ============================================================
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var target = document.querySelector(this.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    // ============================================================
    // COUNTER ANIMATION (stat numbers)
    // ============================================================
    var statNums = document.querySelectorAll('.stat-num[data-count]');

    if ('IntersectionObserver' in window && statNums.length) {
      var countObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var el = entry.target;
            var target = parseInt(el.getAttribute('data-count'), 10);
            var duration = 1500;
            var startTime = null;

            function animate(timestamp) {
              if (!startTime) startTime = timestamp;
              var progress = Math.min((timestamp - startTime) / duration, 1);
              // Ease out cubic
              var eased = 1 - Math.pow(1 - progress, 3);
              var current = Math.floor(eased * target);
              el.textContent = current + '+';
              if (progress < 1) {
                requestAnimationFrame(animate);
              } else {
                el.textContent = target + '+';
              }
            }

            requestAnimationFrame(animate);
            countObserver.unobserve(el);
          }
        });
      }, { threshold: 0.5 });

      statNums.forEach(function (el) { countObserver.observe(el); });
    }

  });

})();
