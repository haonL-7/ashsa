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
    // STARFIELD — cosmic depth particles
    // ============================================================
    var starContainer = document.querySelector('.hero-stars');
    if (starContainer) {
      var fragment = document.createDocumentFragment();
      for (var i = 0; i < 60; i++) {
        var star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDuration = (6 + Math.random() * 14) + 's';
        star.style.animationDelay = Math.random() * 12 + 's';
        star.style.width = (1 + Math.random() * 2) + 'px';
        star.style.height = star.style.width;
        fragment.appendChild(star);
      }
      starContainer.appendChild(fragment);
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
