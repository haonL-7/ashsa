/**
 * Constellation overlay — drawn on hero-ui-canvas above starfield
 */
(function(){
var C=document.getElementById('hero-ui-canvas');if(!C)return;
var X=C.getContext('2d');
var W,H,A,label='',labelA=0,ripple=0,rx=0,ry=0;
var mouse={x:-999,y:-999,on:0,t:0};

function R(){var p=C.parentElement;W=p.offsetWidth||window.innerWidth;H=p.offsetHeight||700;
C.width=W;C.height=H;C.style.width=W+'px';C.style.height=H+'px'}R();window.addEventListener('resize',R);

C.addEventListener('mousemove',function(e){var r=C.getBoundingClientRect();mouse.x=e.clientX-r.left;mouse.y=e.clientY-r.top;mouse.on=1;mouse.t=Date.now()});
C.addEventListener('mouseleave',function(){mouse.on=0});
C.addEventListener('click',function(e){var r=C.getBoundingClientRect();rx=e.clientX-r.left;ry=e.clientY-r.top;ripple=1;checkLabel(rx,ry)});
C.addEventListener('touchmove',function(e){e.preventDefault();var r=C.getBoundingClientRect();mouse.x=e.touches[0].clientX-r.left;mouse.y=e.touches[0].clientY-r.top;mouse.on=1;mouse.t=Date.now()},{passive:0});
C.addEventListener('touchend',function(){mouse.on=0});

var cons=[
  {n:'Orion',x:0.68,y:0.35,s:[[0,0],[9,2],[16,1],[6,9],[-10,17],[-3,4],[4,-6]],ln:[[0,1],[1,2],[3,4],[0,3],[1,4],[5,6]]},
  {n:'Big Dipper',x:0.22,y:0.22,s:[[0,0],[11,-3],[20,1],[31,6],[25,16],[12,13],[3,9]],ln:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,0]]},
  {n:'Cassiopeia',x:0.38,y:0.62,s:[[0,6],[7,0],[14,9],[21,0],[28,6]],ln:[[0,1],[1,2],[2,3],[3,4]]},
  {n:'Pleiades',x:0.74,y:0.33,s:[[0,0],[3,3],[-2,5],[6,-2],[3,7],[-4,2],[5,4],[-3,-3],[2,-4]],ln:[]},
  {n:'Andromeda',x:0.28,y:0.52,s:[[0,0]],ln:[],gx:1}
];

function checkLabel(cx,cy){label='';labelA=0;var best=60;for(var k=0;k<cons.length;k++){var c=cons[k],d=Math.hypot(cx-c.x*W,cy-c.y*H);if(d<best){best=d;label=c.n}}if(label)labelA=1}

function animate(){
  X.clearRect(0,0,W,H);
  if(ripple>0.001)ripple*=0.94;else ripple=0;
  if(labelA>0.001&&!label)labelA*=0.96;else if(label&&labelA<1)labelA+=0.03;

  for(var k=0;k<cons.length;k++){
    var c=cons[k],cx=c.x*W,cy=c.y*H,pts=[],sc=H*0.013;
    for(var j=0;j<c.s.length;j++)pts.push([cx+c.s[j][0]*sc,cy+c.s[j][1]*sc]);
    // Constellation stars — soft glow
    for(var j=0;j<pts.length;j++){
      var sx=pts[j][0],sy=pts[j][1],a=0.2+labelA*0.78;
      if(mouse.on){var d=Math.hypot(mouse.x-sx,mouse.y-sy);if(d<60)a=Math.min(1,a+0.5*(1-d/60))}
      // Glow halo
      var g=X.createRadialGradient(sx,sy,0,sx,sy,5);
      g.addColorStop(0,'rgba(255,255,255,'+(a*0.9)+')');
      g.addColorStop(0.4,'rgba(180,210,245,'+(a*0.2)+')');
      g.addColorStop(1,'rgba(0,0,0,0)');
      X.beginPath();X.arc(sx,sy,5,0,Math.PI*2);X.fillStyle=g;X.fill()
    }
    // Connection lines
    if(c.ln&&c.ln.length){
      X.strokeStyle='rgba(160,200,240,'+(0.06+labelA*0.4)+')';X.lineWidth=0.5;
      for(var j=0;j<c.ln.length;j++){
        var l=c.ln[j];
        X.beginPath();X.moveTo(pts[l[0]][0],pts[l[0]][1]);X.lineTo(pts[l[1]][0],pts[l[1]][1]);X.stroke()
      }
    }
    // Galaxy blob (Andromeda)
    if(c.gx){
      var g=X.createRadialGradient(cx,cy,0,cx,cy,22);
      g.addColorStop(0,'rgba(220,210,240,0.22)');g.addColorStop(1,'rgba(0,0,0,0)');
      X.beginPath();X.ellipse(cx,cy,22,12,-0.3,0,Math.PI*2);X.fillStyle=g;X.fill()
    }
    // Label
    if(label===c.n){
      var a=Math.min(1,labelA);
      X.save();X.font='600 13px \"PingFang SC\",\"Microsoft YaHei\",sans-serif';X.textAlign='center';
      var tw=X.measureText(c.n).width;
      X.fillStyle='rgba(0,0,0,'+(a*0.75)+')';X.beginPath();X.roundRect(cx-tw/2-10,cy-30,tw+20,22,4);X.fill();
      X.fillStyle='rgba(255,255,255,'+a+')';X.fillText(c.n,cx,cy-15);X.restore()
    }
  }

  // Auto-label on long hover
  if(mouse.on&&mouse.t&&Date.now()-mouse.t>2200&&!label){checkLabel(mouse.x,mouse.y);mouse.t=0}
  // Ripple ring on click
  if(ripple>0.02){X.beginPath();X.arc(rx,ry,(1-ripple)*160,0,Math.PI*2);X.strokeStyle='rgba(200,220,255,'+(ripple*0.4)+')';X.lineWidth=1.5;X.stroke()}

  A=requestAnimationFrame(animate)
}
animate()})();
