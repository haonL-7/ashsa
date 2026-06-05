/**
 * Lightweight starfield for sub-page headers
 * Targets #sf-canvas and #sf-bg-canvas
 */
(function () {
  var canvas, ctx, stars = [], animId;
  var STAR_COUNT = 200;
  var SPEED = 0.3;

  function init() {
    canvas = document.getElementById('sf-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    resize();
    createStars();
    window.addEventListener('resize', function () {
      stars.length = 0;
      resize();
      createStars();
    });
    animate();
  }

  function resize() {
    var header = document.querySelector('.starfield-header');
    var w = header ? header.offsetWidth : canvas.parentElement.offsetWidth;
    var h = header ? header.offsetHeight : canvas.parentElement.offsetHeight;
    canvas.width = w;
    canvas.height = h;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
  }

  function createStars() {
    for (var i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.3,
        speed: Math.random() * SPEED + 0.1,
        opacity: Math.random() * 0.6 + 0.2
      });
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      s.y += s.speed;
      if (s.y > canvas.height) { s.y = 0; s.x = Math.random() * canvas.width; }
      ctx.beginPath();
      ctx.fillStyle = 'rgba(200,220,255,' + s.opacity + ')';
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    animId = requestAnimationFrame(animate);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
