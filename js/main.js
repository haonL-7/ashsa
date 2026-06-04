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
    // INTERACTIVE PARTICLE FIELD — mouse-responsive cosmic canvas
    // ============================================================
    var canvas = document.querySelector('.hero-canvas');
    if (canvas && canvas.getContext) {
      var ctx = canvas.getContext('2d');
      var particles = [];
      var mouse = { x: -9999, y: -9999, active: false };
      var PARTICLE_COUNT = 120;
      var MOUSE_RADIUS = 160;
      var MOUSE_FORCE = 0.025;
      var CONNECT_DIST = 100;
      var animId;

      function resize() {
        var rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
      resize();
      window.addEventListener('resize', resize);

      // Track mouse
      canvas.addEventListener('mousemove', function (e) {
        var rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
        mouse.active = true;
      });
      canvas.addEventListener('mouseleave', function () {
        mouse.active = false;
      });
      // Touch support
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

      // Particle class
      function Particle() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = -(Math.random() * 0.4 + 0.1); // gentle upward drift
        this.radius = Math.random() * 2.2 + 1;
        this.baseOpacity = Math.random() * 0.5 + 0.35;
        this.opacity = this.baseOpacity;
        this.twinkleSpeed = Math.random() * 0.02 + 0.005;
        this.twinkleOffset = Math.random() * Math.PI * 2;
        this.hue = Math.random() < 0.2 ? 42 : 210; // occasional gold, mostly blue-white
      }

      Particle.prototype.update = function () {
        // Mouse interaction — repulsion field
        var dx = this.x - mouse.x;
        var dy = this.y - mouse.y;
        var dist = Math.sqrt(dx * dx + dy * dy);

        if (mouse.active && dist < MOUSE_RADIUS && dist > 0) {
          var force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
          force = force * force * MOUSE_FORCE;
          var angle = Math.atan2(dy, dx);
          // Push away + tangential swirl for organic feel
          this.vx += Math.cos(angle) * force * 1.2 + Math.sin(angle) * force * 0.3;
          this.vy += Math.sin(angle) * force * 1.2 - Math.cos(angle) * force * 0.3;
          this.opacity = Math.min(1, this.baseOpacity + force * 10);
        } else {
          this.opacity += (this.baseOpacity - this.opacity) * 0.05;
        }

        // Twinkle
        this.twinkleOffset += this.twinkleSpeed;
        var twinkle = 1 + Math.sin(this.twinkleOffset) * 0.3;

        // Move
        this.x += this.vx;
        this.y += this.vy;

        // Damping
        this.vx *= 0.999;
        this.vy *= 0.999;

        // Wrap around
        if (this.y < -10) { this.y = canvas.height + 10; this.x = Math.random() * canvas.width; }
        if (this.y > canvas.height + 10) { this.y = -10; this.x = Math.random() * canvas.width; }
        if (this.x < -10) this.x = canvas.width + 10;
        if (this.x > canvas.width + 10) this.x = -10;

        return twinkle;
      };

      Particle.prototype.draw = function (twinkle) {
        var alpha = this.opacity * twinkle;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        if (this.hue === 42) {
          ctx.fillStyle = 'rgba(218,165,32,' + alpha + ')';
        } else {
          ctx.fillStyle = 'rgba(180,210,240,' + alpha + ')';
        }
        ctx.fill();

        // Glow for larger particles
        if (this.radius > 1.2 && alpha > 0.4) {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius * 3, 0, Math.PI * 2);
          var glow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 3);
          glow.addColorStop(0, 'rgba(200,220,255,' + (alpha * 0.4) + ')');
          glow.addColorStop(1, 'rgba(200,220,255,0)');
          ctx.fillStyle = glow;
          ctx.fill();
        }
      };

      // Init particles
      for (var i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
      }

      // Draw connection lines between nearby particles
      function drawConnections() {
        for (var i = 0; i < particles.length; i++) {
          for (var j = i + 1; j < particles.length; j++) {
            var dx = particles[i].x - particles[j].x;
            var dy = particles[i].y - particles[j].y;
            var dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < CONNECT_DIST) {
              var alpha = (1 - dist / CONNECT_DIST) * 0.08;
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.strokeStyle = 'rgba(180,210,240,' + alpha + ')';
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }
      }

      // Mouse glow ring
      function drawMouseGlow() {
        if (!mouse.active) return;
        var glow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, MOUSE_RADIUS);
        glow.addColorStop(0, 'rgba(200,220,255,0.08)');
        glow.addColorStop(0.5, 'rgba(180,200,240,0.03)');
        glow.addColorStop(1, 'rgba(180,200,240,0)');
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, MOUSE_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();
      }

      console.log('Particle field init: ' + PARTICLE_COUNT + ' particles, canvas ' + canvas.width + 'x' + canvas.height);

      // Animation loop
      function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (var i = 0; i < particles.length; i++) {
          var twinkle = particles[i].update();
          particles[i].draw(twinkle);
        }

        drawConnections();
        drawMouseGlow();
        animId = requestAnimationFrame(animate);
      }

      // Only animate when visible
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
