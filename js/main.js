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
    // INTERACTIVE PARTICLE FIELD — subtle cosmic dust, bottom-up emergence
    // ============================================================
    var canvas = document.querySelector('.hero-canvas');
    if (canvas && canvas.getContext) {
      var ctx = canvas.getContext('2d');
      var particles = [];
      var mouse = { x: -9999, y: -9999, active: false };
      var PARTICLE_COUNT = 100;
      var INTERACT_RADIUS = 70;
      var INTERACT_FORCE = 0.008;
      var CONNECT_DIST = 80;
      var animId;

      function resize() {
        var rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
      resize();
      window.addEventListener('resize', resize);

      // Mouse tracking
      canvas.addEventListener('mousemove', function (e) {
        var rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
        mouse.active = true;
      });
      canvas.addEventListener('mouseleave', function () {
        mouse.active = false;
      });
      canvas.addEventListener('touchmove', function (e) {
        e.preventDefault();
        var rect = canvas.getBoundingClientRect();
        mouse.x = e.touches[0].clientX - rect.left;
        mouse.y = e.touches[0].clientY - rect.top;
        mouse.active = true;
      }, { passive: false });
      canvas.addEventListener('touchend', function () {
        mouse.active = false;
      });

      // Particle — emerges from bottom, drifts upward
      function Particle() {
        this.reset(true);
      }

      Particle.prototype.reset = function (initial) {
        // Spawn predominantly in the lower portion
        this.x = Math.random() * canvas.width;
        this.y = initial
          ? Math.random() * canvas.height
          : canvas.height + 5 + Math.random() * 30;
        this.vx = (Math.random() - 0.5) * 0.25;
        this.vy = -(Math.random() * 0.45 + 0.2);
        this.radius = Math.random() * 1.2 + 0.4;
        this.baseAlpha = Math.random() * 0.35 + 0.15;
        this.alpha = initial ? this.baseAlpha : 0;
        this.emerging = !initial;
        this.twinklePhase = Math.random() * Math.PI * 2;
        this.twinkleRate = Math.random() * 0.015 + 0.005;
      };

      Particle.prototype.update = function () {
        this.twinklePhase += this.twinkleRate;

        // Emerge animation — pop into existence at bottom
        if (this.emerging) {
          this.alpha += 0.008;
          if (this.alpha >= this.baseAlpha) {
            this.alpha = this.baseAlpha;
            this.emerging = false;
          }
        }

        // Mouse interaction — only nearby particles, gentle orbital nudge
        if (mouse.active) {
          var dx = this.x - mouse.x;
          var dy = this.y - mouse.y;
          var dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < INTERACT_RADIUS && dist > 1) {
            var t = 1 - dist / INTERACT_RADIUS;
            var force = t * t * INTERACT_FORCE;
            var angle = Math.atan2(dy, dx);
            // Gentle swirl — tangent dominant, slight repel
            this.vx += Math.cos(angle) * force * 0.4 + Math.sin(angle) * force * 0.9;
            this.vy += Math.sin(angle) * force * 0.4 - Math.cos(angle) * force * 0.9;
          }
        }

        // Move
        this.x += this.vx;
        this.y += this.vy;

        // Damping
        this.vx *= 0.998;
        this.vy *= 0.998;

        // Recycle — if floated above top, respawn from bottom
        if (this.y < -15) {
          this.y = canvas.height + 5 + Math.random() * 20;
          this.x = Math.random() * canvas.width;
          this.vx = (Math.random() - 0.5) * 0.25;
          this.vy = -(Math.random() * 0.45 + 0.2);
          this.alpha = 0;
          this.emerging = true;
        }
        // If drifted too far down, nudge back up
        if (this.y > canvas.height + 40) {
          this.vy = -(Math.random() * 0.45 + 0.2);
        }
        // Horizontal wrap
        if (this.x < -10) this.x = canvas.width + 10;
        if (this.x > canvas.width + 10) this.x = -10;

        return this.alpha * (1 + Math.sin(this.twinklePhase) * 0.25);
      };

      Particle.prototype.draw = function (alpha) {
        if (alpha < 0.02) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(190,215,245,' + alpha + ')';
        ctx.fill();
      };

      // Init particles
      for (var i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
      }

      // Subtle connections between very close particles
      function drawConnections() {
        for (var i = 0; i < particles.length; i++) {
          if (particles[i].alpha < 0.1) continue;
          for (var j = i + 1; j < particles.length; j++) {
            if (particles[j].alpha < 0.1) continue;
            var dx = particles[i].x - particles[j].x;
            var dy = particles[i].y - particles[j].y;
            var dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < CONNECT_DIST) {
              var lineAlpha = (1 - dist / CONNECT_DIST) * 0.04;
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.strokeStyle = 'rgba(190,215,245,' + lineAlpha + ')';
              ctx.lineWidth = 0.3;
              ctx.stroke();
            }
          }
        }
      }

      // Animation loop
      function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (var i = 0; i < particles.length; i++) {
          var alpha = particles[i].update();
          particles[i].draw(alpha);
        }

        drawConnections();
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
