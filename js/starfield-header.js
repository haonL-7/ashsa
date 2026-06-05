/**
 * Starfield Header v7 — glass fade + comets + meteor showers
 */
(function () {
  var canvas, ctx, W, H, H2, animId;
  var mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
  var explosions = [], comets = [];
  var lastComet = 0, cometInterval = 4500;
  var lastShowerCheck = 0, inShower = false, showerEnd = 0;

  var layers = [
    { count: 200, rMin: 0.4, rMax: 1.2, alpha: 0.6, parallax: 0.6, stars: [] },
    { count: 100, rMin: 0.8, rMax: 2.2, alpha: 0.7, parallax: 0.4, stars: [] },
    { count: 40,  rMin: 1.5, rMax: 3.0, alpha: 0.8, parallax: 0.18, stars: [] }
  ];

  var cons = [
    { name: 'Orion', bx: 0.68, by: 0.33, scale: 0.55,
      pts: [[0,0],[9,2],[16,1],[6,9],[-10,17],[-3,4],[4,-6]],
      lines: [[0,1],[1,2],[3,4],[0,3],[1,4],[5,6]] },
    { name: 'Big Dipper', bx: 0.22, by: 0.22, scale: 0.45,
      pts: [[0,0],[11,-3],[20,1],[31,6],[25,16],[12,13],[3,9]],
      lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,0]] },
    { name: 'Cassiopeia', bx: 0.4, by: 0.58, scale: 0.45,
      pts: [[0,6],[7,0],[14,9],[21,0],[28,6]],
      lines: [[0,1],[1,2],[2,3],[3,4]] },
    { name: 'Pleiades', bx: 0.75, by: 0.28, scale: 0.4,
      pts: [[0,0],[3,3],[-2,5],[6,-2],[3,7],[-4,2],[5,4],[-3,-3],[2,-4]],
      lines: [] },
    { name: 'Andromeda', bx: 0.3, by: 0.48, scale: 0.45,
      pts: [[0,0],[4,2],[8,-1],[12,3],[16,1],[20,4]],
      lines: [[0,1],[1,2],[2,3],[3,4],[4,5]] }
  ];

  function init() {
    canvas = document.getElementById('sf-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    var header = document.querySelector('.starfield-header');
    var el = header || canvas;
    el.addEventListener('mousemove', function (e) {
      var r = canvas.getBoundingClientRect();
      mouse.tx = (e.clientX - r.left) / W;
      mouse.ty = (e.clientY - r.top) / H2;
    });
    el.addEventListener('click', function (e) {
      var r = canvas.getBoundingClientRect();
      triggerSupernova(e.clientX - r.left, e.clientY - r.top);
    });
    resize();
    for (var l = 0; l < layers.length; l++) createStars(l);
    window.addEventListener('resize', function () {
      for (var l = 0; l < layers.length; l++) layers[l].stars.length = 0;
      resize();
      for (var l = 0; l < layers.length; l++) createStars(l);
    });
    animate();
  }

  function resize() {
    var hdr = document.querySelector('.starfield-header');
    W = hdr ? hdr.offsetWidth : canvas.parentElement.offsetWidth;
    H2 = hdr ? hdr.offsetHeight : canvas.parentElement.offsetHeight;
    H = Math.round(H2 * 1.2);
    canvas.width = W; canvas.height = H;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
  }

  function createStars(layerIdx) {
    var layer = layers[layerIdx];
    for (var i = 0; i < layer.count; i++) {
      layer.stars.push({
        x: Math.random() * W, y: Math.random() * H,
        r: Math.random() * (layer.rMax - layer.rMin) + layer.rMin,
        twinkle: Math.random() * Math.PI * 2,
        ts: Math.random() * 0.01 + 0.003,
        hue: Math.random() < 0.08 ? 40 + Math.random() * 20 : 210 + Math.random() * 30,
        rebirth: 0
      });
    }
  }

  // ==================== COMETS ====================

  function spawnComets(now) {
    if (inShower) return; // shower handles its own comets
    var count = 1 + Math.floor(Math.random() * 3); // 1-3 comets
    for (var i = 0; i < count; i++) {
      comets.push(createComet(now + i * 300));
    }
    cometInterval = 4000 + Math.random() * 1000;
    lastComet = now;
  }

  function createComet(startTime) {
    var fromLeft = Math.random() > 0.5;
    return {
      x: fromLeft ? -50 : W + 50,
      y: Math.random() * H2 * 0.7,
      vx: fromLeft ? (80 + Math.random() * 160) : -(80 + Math.random() * 160),
      vy: (Math.random() - 0.5) * 40,
      life: 0,
      maxLife: 1.5 + Math.random() * 1,
      hue: 200 + Math.random() * 40,
      r: 1.5 + Math.random() * 2,
      startTime: startTime,
      tail: []
    };
  }

  function spawnMeteorShower(now) {
    inShower = true;
    showerEnd = now + 3500;
    var count = 8 + Math.floor(Math.random() * 12); // 8-20 meteors
    var angle = (Math.random() - 0.5) * 0.6; // slight variation in direction
    var baseVx = 200 + Math.random() * 150;
    var baseVy = -30 + Math.random() * 60;
    for (var i = 0; i < count; i++) {
      comets.push({
        x: Math.random() * W * 0.3,
        y: Math.random() * H2 * 0.4,
        vx: baseVx + (Math.random() - 0.5) * 80,
        vy: baseVy + (Math.random() - 0.5) * 40,
        life: 0,
        maxLife: 1 + Math.random() * 0.8,
        hue: 210 + Math.random() * 50,
        r: 1.5 + Math.random() * 2.5,
        startTime: now + i * 80,
        tail: []
      });
    }
  }

  function drawComets(t) {
    for (var c = comets.length - 1; c >= 0; c--) {
      var cm = comets[c];
      if (t < cm.startTime) continue;
      cm.life += 0.016;
      var progress = cm.life / cm.maxLife;
      if (progress > 1) { comets.splice(c, 1); continue; }

      cm.x += cm.vx * 0.016;
      cm.y += cm.vy * 0.016;
      cm.tail.push({ x: cm.x, y: cm.y });
      if (cm.tail.length > 30) cm.tail.shift();

      // Draw tail (fading trail)
      for (var ti = 1; ti < cm.tail.length; ti++) {
        var t0 = cm.tail[ti - 1], t1 = cm.tail[ti];
        var alpha = (ti / cm.tail.length) * 0.7 * (1 - progress);
        var width = cm.r * (ti / cm.tail.length) * 2;
        ctx.beginPath();
        ctx.moveTo(t0.x, t0.y);
        ctx.lineTo(t1.x, t1.y);
        ctx.strokeStyle = 'hsla(' + cm.hue + ',60%,80%,' + alpha + ')';
        ctx.lineWidth = width;
        ctx.stroke();
      }

      // Draw head glow
      var alpha = 1 - progress;
      var grad = ctx.createRadialGradient(cm.x, cm.y, 0, cm.x, cm.y, cm.r * 6);
      grad.addColorStop(0, 'rgba(255,255,255,' + (alpha * 0.95) + ')');
      grad.addColorStop(0.1, 'hsla(' + cm.hue + ',60%,85%,' + (alpha * 0.7) + ')');
      grad.addColorStop(0.4, 'hsla(' + cm.hue + ',50%,70%,' + (alpha * 0.2) + ')');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath();
      ctx.arc(cm.x, cm.y, cm.r * 6, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }
  }

  // ==================== SUPERNOVA ====================

  function triggerSupernova(cx, cy) {
    var best = null, bestDist = 45;
    for (var l = 0; l < layers.length; l++) {
      for (var i = 0; i < layers[l].stars.length; i++) {
        var s = layers[l].stars[i];
        if (s.rebirth > 0) continue;
        var px = (mouse.x - 0.5) * 100 * layers[l].parallax;
        var py = (mouse.y - 0.5) * 100 * layers[l].parallax;
        var d = Math.hypot(cx - (s.x + px), cy - (s.y + py));
        if (d < bestDist && s.r > 1.2) { bestDist = d; best = { star: s, layer: l }; }
      }
    }
    if (best) {
      var px = (mouse.x - 0.5) * 100 * layers[best.layer].parallax;
      var py = (mouse.y - 0.5) * 100 * layers[best.layer].parallax;
      var bx = best.star.x + px, by = best.star.y + py;
      best.star.rebirth = 1;
      best.star.rx = Math.random() * W; best.star.ry = Math.random() * H;
      best.star.r0 = best.star.r;
      explosions.push({
        x: bx, y: by, life: 0, maxLife: 2.5, hue: best.star.hue,
        rings: [
          { radius: 0, maxR: 50, alpha: 0.7, width: 3, delay: 0 },
          { radius: 0, maxR: 90, alpha: 0.5, width: 2, delay: 0.1 },
          { radius: 0, maxR: 160, alpha: 0.3, width: 1, delay: 0.25 }
        ],
        particles: createExplosionParticles(bx, by, best.star.hue)
      });
    }
  }

  function createExplosionParticles(x, y, hue) {
    var p = [];
    for (var i = 0; i < 60; i++) {
      var angle = Math.random() * Math.PI * 2;
      var speed = Math.random() * 80 + 30;
      p.push({ x: x, y: y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 1, decay: Math.random() * 0.5 + 0.5, r: Math.random() * 3 + 1.5, hue: hue + (Math.random() - 0.5) * 40, trail: [] });
    }
    for (var i = 0; i < 15; i++) {
      var angle = Math.random() * Math.PI * 2;
      p.push({ x: x, y: y, vx: Math.cos(angle) * (Math.random() * 25 + 5), vy: Math.sin(angle) * (Math.random() * 25 + 5), life: 1, decay: Math.random() * 0.3 + 0.2, r: Math.random() * 2 + 2, hue: 30 + Math.random() * 20, trail: [] });
    }
    return p;
  }

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
  function easeInOutQuad(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }

  function drawExplosions() {
    for (var e = explosions.length - 1; e >= 0; e--) {
      var ex = explosions[e];
      ex.life += 0.016;
      var progress = ex.life / ex.maxLife;
      if (progress > 1) { explosions.splice(e, 1); continue; }
      var ga = progress < 0.15 ? easeInOutQuad(progress / 0.15) : progress > 0.7 ? 1 - easeOutCubic((progress - 0.7) / 0.3) : 1;
      for (var r = 0; r < ex.rings.length; r++) {
        var ring = ex.rings[r];
        var rp = Math.max(0, (ex.life - ring.delay) / (ex.maxLife - ring.delay));
        if (rp <= 0) continue;
        ring.radius = ring.maxR * easeOutCubic(Math.min(1, rp));
        var ra = ring.alpha * ga * (1 - easeOutCubic(rp));
        ctx.beginPath(); ctx.arc(ex.x, ex.y, ring.radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,230,200,' + ra + ')'; ctx.lineWidth = ring.width * (1 - rp * 0.7); ctx.stroke();
        if (r === 0) {
          ctx.beginPath(); ctx.arc(ex.x, ex.y, ring.radius * 0.7, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(180,210,255,' + (ra * 0.6) + ')'; ctx.lineWidth = ring.width * 1.2 * (1 - rp * 0.7); ctx.stroke();
        }
      }
      var glowR = 30 + progress * 200;
      var grad = ctx.createRadialGradient(ex.x, ex.y, 0, ex.x, ex.y, glowR);
      grad.addColorStop(0, 'rgba(255,255,240,' + (ga * 0.95) + ')');
      grad.addColorStop(0.05, 'rgba(255,220,160,' + (ga * 0.7) + ')');
      grad.addColorStop(0.2, 'rgba(255,150,60,' + (ga * 0.3) + ')');
      grad.addColorStop(0.5, 'rgba(100,150,230,' + (ga * 0.08) + ')');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.arc(ex.x, ex.y, glowR, 0, Math.PI * 2); ctx.fillStyle = grad; ctx.fill();
      for (var i = 0; i < ex.particles.length; i++) {
        var p = ex.particles[i];
        p.trail.push({ x: p.x, y: p.y, life: p.life }); if (p.trail.length > 8) p.trail.shift();
        p.x += p.vx * 0.016; p.y += p.vy * 0.016; p.vx *= 0.985; p.vy *= 0.985;
        p.life -= p.decay * 0.016; if (p.life <= 0) continue;
        for (var ti = 0; ti < p.trail.length - 1; ti++) {
          var tr = p.trail[ti], tr2 = p.trail[ti + 1], ta = (ti / p.trail.length) * p.life * ga * 0.5;
          ctx.beginPath(); ctx.moveTo(tr.x, tr.y); ctx.lineTo(tr2.x, tr2.y);
          ctx.strokeStyle = 'hsla(' + p.hue + ',60%,75%,' + ta + ')'; ctx.lineWidth = p.r * 0.5 * (ti / p.trail.length); ctx.stroke();
        }
        var pg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 2);
        pg.addColorStop(0, 'hsla(' + p.hue + ',40%,90%,' + (p.life * ga) + ')'); pg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 2, 0, Math.PI * 2); ctx.fillStyle = pg; ctx.fill();
      }
    }
  }

  // ==================== GRADIENT FADE ====================

  function drawGradient() {
    // Frosted glass effect: fades from clear → light blur → transparent to #f6f8fb
    var fadeTop = H2 * 0.88;
    var grad = ctx.createLinearGradient(0, fadeTop, 0, H);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(0.2, 'rgba(255,255,255,0.12)');
    grad.addColorStop(0.5, 'rgba(246,248,251,0.55)');
    grad.addColorStop(0.8, 'rgba(246,248,251,0.9)');
    grad.addColorStop(1, '#f6f8fb');
    ctx.fillStyle = grad;
    ctx.fillRect(0, fadeTop, W, H - fadeTop);
  }

  // ==================== CONSTELLATIONS ====================

  function drawConstellations(t) {
    var px = (mouse.x - 0.5) * 30, py = (mouse.y - 0.5) * 30;
    for (var k = 0; k < cons.length; k++) {
      var c = cons[k], cx = c.bx * W + px * 0.3, cy = c.by * H + py * 0.3;
      var sc = H * 0.007 * c.scale, pts = [];
      for (var j = 0; j < c.pts.length; j++) pts.push([cx + c.pts[j][0] * sc, cy + c.pts[j][1] * sc]);
      if (c.lines && c.lines.length) {
        ctx.strokeStyle = 'rgba(140,185,230,0.08)'; ctx.lineWidth = 0.4;
        for (var j = 0; j < c.lines.length; j++) {
          var l = c.lines[j]; ctx.beginPath(); ctx.moveTo(pts[l[0]][0], pts[l[0]][1]); ctx.lineTo(pts[l[1]][0], pts[l[1]][1]); ctx.stroke();
        }
      }
      for (var j = 0; j < pts.length; j++) {
        var twinkle = 0.35 + Math.sin(t * 2 + j * 0.7) * 0.06;
        var grad = ctx.createRadialGradient(pts[j][0], pts[j][1], 0, pts[j][0], pts[j][1], 5);
        grad.addColorStop(0, 'rgba(255,255,255,' + (twinkle * 0.9) + ')');
        grad.addColorStop(0.3, 'rgba(190,215,250,' + (twinkle * 0.15) + ')');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath(); ctx.arc(pts[j][0], pts[j][1], 5, 0, Math.PI * 2); ctx.fillStyle = grad; ctx.fill();
      }
    }
  }

  // ==================== STAR RENDER ====================

  function drawStar(s, rx, ry) {
    var alpha = Math.max(0, s.rebirth > 0 ? (1 - s.rebirth) : 1);
    var a = (0.7 + 0.3 * Math.sin(s.twinkle));
    if (s.rebirth > 0) {
      var scale = 0.1 + 0.9 * (1 - s.rebirth);
      rx = s.rx + (rx - s.rx) * scale;
      ry = s.ry + (ry - s.ry) * scale;
      var sr = s.r0 * scale;
      a *= (1 - s.rebirth) * 0.5 + 0.5;
    } else {
      var sr = s.r;
    }
    if (s.rebirth > 0 || sr > 1.5) {
      var glowAlpha = s.rebirth > 0 ? a * (1 - s.rebirth) * 1.5 : a * 0.5;
      var grad = ctx.createRadialGradient(rx, ry, 0, rx, ry, sr * 2.5);
      grad.addColorStop(0, 'hsla(' + s.hue + ',40%,85%,' + glowAlpha + ')');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.arc(rx, ry, sr * 2.5, 0, Math.PI * 2); ctx.fillStyle = grad; ctx.fill();
    }
    ctx.beginPath();
    ctx.fillStyle = 'hsla(' + s.hue + ',30%,85%,' + a + ')';
    ctx.arc(rx, ry, sr, 0, Math.PI * 2);
    ctx.fill();
  }

  // ==================== MAIN LOOP ====================

  function animate() {
    var t = performance.now() * 0.001;
    var now = performance.now();

    // Comet spawning
    if (!inShower && now - lastComet > cometInterval) {
      spawnComets(now);
    }

    // Meteor shower check (every 28s, 1/3 chance)
    if (!inShower && now - lastShowerCheck > 28000) {
      lastShowerCheck = now;
      if (Math.random() < 0.33) {
        spawnMeteorShower(now);
      }
    }

    // End shower
    if (inShower && now > showerEnd) {
      inShower = false;
      lastComet = now;
    }

    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;
    ctx.clearRect(0, 0, W, H);

    // Stars
    for (var l = 0; l < layers.length; l++) {
      var layer = layers[l];
      var px = (mouse.x - 0.5) * 100 * layer.parallax;
      var py = (mouse.y - 0.5) * 100 * layer.parallax;
      for (var i = 0; i < layer.stars.length; i++) {
        var s = layer.stars[i];
        if (s.rebirth > 0) { s.rebirth -= 0.004; if (s.rebirth < 0) s.rebirth = 0; }
        s.x += Math.sin(t * 0.3 + i) * 0.008;
        s.y += Math.cos(t * 0.4 + i) * 0.008;
        if (s.x < -20) s.x = W + 20; if (s.x > W + 20) s.x = -20;
        if (s.y < -20) s.y = H + 20; if (s.y > H + 20) s.y = -20;
        s.twinkle += s.ts;
        drawStar(s, s.x + px, s.y + py);
      }
    }

    drawConstellations(t);
    drawComets(t);
    drawExplosions();
    drawGradient();
    animId = requestAnimationFrame(animate);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
