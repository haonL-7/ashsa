/**
 * ASHSA — Asian Sports Health Association
 * Shared JavaScript for bilingual conference website
 */

document.addEventListener('DOMContentLoaded', function () {

  // --- Mobile Navigation Toggle ---
  const toggleBtn = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener('click', function () {
      navLinks.classList.toggle('show');
      toggleBtn.setAttribute('aria-expanded',
        navLinks.classList.contains('show'));
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('show');
        toggleBtn.setAttribute('aria-expanded', 'false');
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function (e) {
      if (!toggleBtn.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('show');
        toggleBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // --- Smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // --- Active nav link detection ---
  var currentPath = window.location.pathname;
  document.querySelectorAll('.nav-links a').forEach(function (link) {
    var href = link.getAttribute('href');
    if (href && currentPath.includes(href.replace(/^\//, '')) && href !== '../index.html') {
      link.classList.add('active');
    }
    // Special case: homepage
    if ((currentPath.endsWith('index.html') || currentPath === '/' || currentPath.endsWith('/en/') || currentPath.endsWith('/zh/')) && href.includes('index.html')) {
      link.classList.add('active');
    }
  });

});
