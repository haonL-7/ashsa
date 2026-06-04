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
    // DEEP SPACE STARFIELD — stars scattered in cosmic void
    // ============================================================
    var canvas = document.querySelector('.hero-canvas');
    if (canvas && canvas.getContext) {
      var ctx = canvas.getContext('2d');
      var stars = [];
      var mouse = { x: -9999, y: -9999, active: false };
      var STAR_COUNT = 250;
      var animId;
      var frame = 0;

      function resize() {
        var rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width || canvas.parentElement.offsetWidth || 1200;
        canvas.height = rect.height || canvas.parentElement.offsetHeight || 700;
      }
      setTimeout(resize, 100);
      window.addEventListener('resize', resize);

      // Mouse
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

      // Star — fixed in space, twinkles independently
      function Star() {
        this.x = Math.random() * (canvas.width || 1200);
        this.y = Math.random() * (canvas.height || 700);
        this.ox = this.x; // original position (gravitational anchor)
        this.oy = this.y;

        // Size tier: most tiny/distant, some medium, few bright/nearby
        var tier = Math.random();
        if (tier < 0.75) {
          this.radius = Math.random() * 0.5 + 0.2;       // distant
          this.baseAlpha = Math.random() * 0.25 + 0.1;
        } else if (tier < 0.95) {
          this.radius = Math.random() * 0.8 + 0.5;        // mid
          this.baseAlpha = Math.random() * 0.35 + 0.25;
        } else {
          this.radius = Math.random() * 1.2 + 0.6;        // bright nearby
          this.baseAlpha = Math.random() * 0.5 + 0.4;
        }

        this.twinkleSpeed = Math.random() * 0.03 + 0.005;
        this.twinkleAmp = Math.random() * 0.5 + 0.3;
        this.phase = Math.random() * Math.PI * 2;

        // Star color temperature
        var temp = Math.random();
        if (temp < 0.08) {
          this.r = 255; this.g = 220; this.b = 150; // warm gold
        } else if (temp < 0.2) {
          this.r = 180; this.g = 210; this.b = 255; // blue-white
        } else {
          this.r = 235; this.g = 245; this.b = 255; // pure white
        }
      }

      Star.prototype.update = function () {
        this.phase += this.twinkleSpeed;
        frame += 0.0001;

        // Gravitational lensing — mouse gently pulls nearby stars
        if (mouse.active) {
          var dx = mouse.x - this.x;
          var dy = mouse.y - this.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200 && dist > 2) {
            var g = (200 - dist) / 200;
            g = g * g * 0.03;
            this.x += dx * g;
            this.y += dy * g;
          }
        }

        // Gentle return to original position
        this.x += (this.ox - this.x) * 0.005;
        this.y += (this.oy - this.y) * 0.005;

        // Subtle cosmic drift
        this.ox += Math.sin(frame + this.phase) * 0.015;
        this.oy += Math.cos(frame * 0.7 + this.phase) * 0.01;

        // Wrap
        if (this.ox < -20) this.ox = canvas.width + 20;
        if (this.ox > canvas.width + 20) this.ox = -20;
        if (this.oy < -20) this.oy = canvas.height + 20;
        if (this.oy > canvas.height + 20) this.oy = -20;

        // Twinkle
        var twinkle = 0.5 + 0.5 * Math.sin(this.phase);
        twinkle = this.baseAlpha * (0.6 + this.twinkleAmp * twinkle);
        return twinkle;
      };

      Star.prototype.draw = function (alpha) {
        if (alpha < 0.03) return;

        // Glow halo
        var halo = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 3);
        halo.addColorStop(0, 'rgba(' + this.r + ',' + this.g + ',' + this.b + ',' + (alpha * 0.9) + ')');
        halo.addColorStop(0.4, 'rgba(' + this.r + ',' + this.g + ',' + this.b + ',' + (alpha * 0.3) + ')');
        halo.addColorStop(1, 'rgba(' + this.r + ',' + this.g + ',' + this.b + ',0)');
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 3, 0, Math.PI * 2);
        ctx.fillStyle = halo;
        ctx.fill();

        // Core point
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + this.r + ',' + this.g + ',' + this.b + ',' + alpha + ')';
        ctx.fill();
      };

      // Init
      for (var i = 0; i < STAR_COUNT; i++) {
        stars.push(new Star());
      }

      function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (var i = 0; i < stars.length; i++) {
          var alpha = stars[i].update();
          stars[i].draw(alpha);
        }

        animId = requestAnimationFrame(animate);
      }

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
