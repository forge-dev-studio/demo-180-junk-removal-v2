/* 180 Junk Removal - site interactions + premium motion system */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  var header = document.querySelector("[data-header]");
  function headerState(){ if(header) header.classList.toggle("shrink", window.scrollY > 40); }
  headerState();

  var progress = document.querySelector("[data-progress]");
  var parallaxEls = Array.prototype.slice.call(document.querySelectorAll(".parallax"));
  var heroEl = document.querySelector(".hero");
  var toTopBtn = document.querySelector("[data-to-top]");

  var ticking = false;
  function onScrollFrame(){
    headerState();
    var sy = window.scrollY;
    if(heroEl) heroEl.classList.toggle("scrolled", sy > 60);
    if(toTopBtn) toTopBtn.classList.toggle("show", sy > 700);
    if (progress){
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      progress.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
    }
    if (!reduce && parallaxEls.length){
      var vh = window.innerHeight;
      for (var i=0;i<parallaxEls.length;i++){
        var el = parallaxEls[i], r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) continue;
        var speed = parseFloat(el.getAttribute("data-speed")) || 0.05;
        var scale = el.getAttribute("data-scale");
        var off = (r.top + r.height/2 - vh/2) * speed;
        el.style.transform = "translateY(" + off.toFixed(1) + "px)" + (scale ? " scale("+scale+")" : "");
      }
    }
    ticking = false;
  }
  function requestScroll(){ if(!ticking){ ticking = true; requestAnimationFrame(onScrollFrame); } }
  window.addEventListener("scroll", requestScroll, { passive: true });
  window.addEventListener("resize", requestScroll, { passive: true });
  onScrollFrame();

  var toggle = document.querySelector("[data-nav-toggle]");
  var drawer = document.querySelector("[data-drawer]");
  var scrim = document.querySelector("[data-scrim]");
  function setDrawer(open){
    if(!drawer) return;
    drawer.classList.toggle("open", open);
    if(scrim) scrim.classList.toggle("open", open);
    if(toggle) toggle.setAttribute("aria-expanded", open?"true":"false");
    document.body.style.overflow = open?"hidden":"";
  }
  if(toggle) toggle.addEventListener("click", function(){ setDrawer(!drawer.classList.contains("open")); });
  if(scrim) scrim.addEventListener("click", function(){ setDrawer(false); });
  if(drawer) drawer.querySelectorAll("a").forEach(function(a){ a.addEventListener("click", function(){ setDrawer(false); }); });
  document.addEventListener("keydown", function(e){ if(e.key==="Escape") setDrawer(false); });

  document.querySelectorAll("[data-ba]").forEach(function(stage){
    var range = stage.querySelector(".ba-range");
    var deg = stage.querySelector(".ba-deg");
    function apply(v){ stage.style.setProperty("--pos", v + "%"); if(deg) deg.textContent = Math.round((v/100)*180) + "\u00B0"; }
    if(range){
      apply(range.value);
      range.addEventListener("input", function(){ apply(range.value); });
      if(!reduce){
        var peeked = false;
        var io = new IntersectionObserver(function(ents){
          ents.forEach(function(en){
            if(en.isIntersecting && !peeked){
              peeked = true; io.disconnect();
              [{v:50,t:0},{v:80,t:520},{v:22,t:1240},{v:50,t:1960}].forEach(function(s){
                setTimeout(function(){ range.value = s.v; apply(s.v); }, s.t + 350);
              });
            }
          });
        }, { threshold: 0.5 });
        io.observe(stage);
      }
    }
  });

  var sizeData = window.__SIZES__ || null;
  var tabs = document.querySelectorAll("[data-size-tab]");
  if(tabs.length && sizeData){
    var titleEl=document.querySelector("[data-size-title]"), popEl=document.querySelector("[data-size-pop]"),
        bestEl=document.querySelector("[data-size-best]"), holdsEl=document.querySelector("[data-size-holds]"),
        dimEl=document.querySelector("[data-size-dim]"), goodEl=document.querySelector("[data-size-good]"),
        noteEl=document.querySelector("[data-size-note]"), boxEl=document.querySelector("[data-size-box]");
    function selectSize(key){
      var d=sizeData[key]; if(!d) return;
      tabs.forEach(function(t){ t.setAttribute("aria-selected", t.getAttribute("data-size-tab")===key?"true":"false"); });
      if(titleEl) titleEl.textContent=d.title;
      if(popEl) popEl.style.display=d.popular?"inline-block":"none";
      if(bestEl) bestEl.textContent=d.best;
      if(holdsEl) holdsEl.textContent=d.holds;
      if(dimEl) dimEl.textContent=d.dim;
      if(goodEl) goodEl.textContent=d.good;
      if(noteEl) noteEl.textContent=d.note;
      if(boxEl) boxEl.style.setProperty("--h", d.scale);
    }
    tabs.forEach(function(t){ t.addEventListener("click", function(){ selectSize(t.getAttribute("data-size-tab")); }); });
    selectSize(tabs[0].getAttribute("data-size-tab"));
  }

  var reveals = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
  reveals.forEach(function(el){
    var count=0, sib=el.previousElementSibling;
    while(sib){ if(sib.hasAttribute && sib.hasAttribute("data-reveal")) count++; sib=sib.previousElementSibling; }
    el._stagger = Math.min(count,5)*70;
  });
  if(reduce || !("IntersectionObserver" in window)){
    reveals.forEach(function(el){ el.classList.add("in"); });
  } else {
    var rio = new IntersectionObserver(function(ents){
      ents.forEach(function(en){
        if(en.isIntersecting){
          var el=en.target, delay = el.getAttribute("data-delay") || el._stagger || 0;
          el.style.transitionDelay = delay + "ms";
          el.classList.add("in"); rio.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -7% 0px" });
    reveals.forEach(function(el){ rio.observe(el); });
  }

  document.querySelectorAll(".map-wrap").forEach(function(wrap){
    var pins = wrap.querySelectorAll(".map-pin");
    pins.forEach(function(p,i){ p.style.transitionDelay = (reduce?0:(400 + i*55)) + "ms"; });
    if(reduce || !("IntersectionObserver" in window)){ wrap.classList.add("in"); return; }
    var mio = new IntersectionObserver(function(ents){
      ents.forEach(function(en){ if(en.isIntersecting){ wrap.classList.add("in"); mio.unobserve(wrap); } });
    }, { threshold: 0.3 });
    mio.observe(wrap);
  });

  function countUp(el){
    var target=parseFloat(el.getAttribute("data-count"));
    var dec=(el.getAttribute("data-count").split(".")[1]||"").length;
    var suffix=el.getAttribute("data-suffix")||"", prefix=el.getAttribute("data-prefix")||"";
    if(reduce){ el.textContent=prefix+target.toFixed(dec)+suffix; return; }
    var start=null, dur=1500;
    function tick(ts){ if(!start)start=ts; var p=Math.min((ts-start)/dur,1); var e=1-Math.pow(1-p,3);
      el.textContent=prefix+(target*e).toFixed(dec)+suffix;
      if(p<1) requestAnimationFrame(tick); else el.textContent=prefix+target.toFixed(dec)+suffix; }
    requestAnimationFrame(tick);
  }
  var counters=document.querySelectorAll("[data-count]");
  if(counters.length && "IntersectionObserver" in window){
    var cio=new IntersectionObserver(function(ents){ ents.forEach(function(en){ if(en.isIntersecting){ countUp(en.target); cio.unobserve(en.target); } }); }, { threshold:0.6 });
    counters.forEach(function(el){ cio.observe(el); });
  } else { counters.forEach(function(el){ el.textContent=(el.getAttribute("data-prefix")||"")+el.getAttribute("data-count")+(el.getAttribute("data-suffix")||""); }); }

  document.querySelectorAll("[data-reviews]").forEach(function(track){
    var prev=document.querySelector("[data-rev-prev]"), next=document.querySelector("[data-rev-next]");
    if(next) next.addEventListener("click", function(){ track.scrollBy({left:track.clientWidth*0.8,behavior:"smooth"}); });
    if(prev) prev.addEventListener("click", function(){ track.scrollBy({left:-track.clientWidth*0.8,behavior:"smooth"}); });
  });

  if(finePointer && !reduce){
    document.querySelectorAll(".btn-primary").forEach(function(btn){
      btn.addEventListener("pointermove", function(e){
        var r=btn.getBoundingClientRect();
        var mx=e.clientX-(r.left+r.width/2), my=e.clientY-(r.top+r.height/2);
        btn.style.transform="translate("+(mx*0.18).toFixed(1)+"px,"+(my*0.28).toFixed(1)+"px)";
      });
      btn.addEventListener("pointerleave", function(){ btn.style.transform=""; });
    });
  }

  document.querySelectorAll("[data-quote-form]").forEach(function(form){
    var status=form.querySelector("[data-form-status]");
    form.addEventListener("submit", function(e){
      e.preventDefault();
      var data=new FormData(form);
      var name=(data.get("name")||"").toString().trim();
      var phone=(data.get("phone")||"").toString().trim();
      var service=(data.get("service")||"").toString().trim();
      var details=(data.get("details")||"").toString().trim();
      if(!name||!phone){ if(status) status.textContent="Add your name and phone so we can text you a price."; return; }
      var body="New quote request from the 180 website:%0A%0A"+
        "Name: "+encodeURIComponent(name)+"%0A"+"Phone: "+encodeURIComponent(phone)+"%0A"+
        "Service: "+encodeURIComponent(service||"Not specified")+"%0A"+"Details: "+encodeURIComponent(details||"None");
      if(status) status.textContent="Opening your messaging app to send this to 180...";
      window.location.href="sms:+17066766170?&body="+body;
    });
  });
  /* hero cursor spotlight */
  var heroSpot = document.querySelector(".hero-spot");
  if(heroEl && heroSpot && finePointer && !reduce){
    heroEl.addEventListener("pointermove", function(e){
      var r = heroEl.getBoundingClientRect();
      heroEl.style.setProperty("--mx", (((e.clientX-r.left)/r.width)*100).toFixed(1)+"%");
      heroEl.style.setProperty("--my", (((e.clientY-r.top)/r.height)*100).toFixed(1)+"%");
    });
  }

  /* subtle 3D tilt on service cards */
  if(finePointer && !reduce){
    document.querySelectorAll(".svc-card").forEach(function(card){
      card.addEventListener("pointermove", function(e){
        var r = card.getBoundingClientRect();
        var px = (e.clientX-r.left)/r.width - 0.5, py = (e.clientY-r.top)/r.height - 0.5;
        card.style.transform = "rotateX(" + (-py*5).toFixed(2) + "deg) rotateY(" + (px*6).toFixed(2) + "deg) translateY(-6px)";
      });
      card.addEventListener("pointerleave", function(){ card.style.transform = ""; });
    });
  }

  /* back to top */
  if(toTopBtn){
    toTopBtn.addEventListener("click", function(){
      window.scrollTo({ top:0, behavior: reduce ? "auto" : "smooth" });
    });
  }

  /* coverage map - traveling signal pulses from the Rome hub */
  if(!reduce){
    document.querySelectorAll(".map-svg").forEach(function(svg){
      var hub = svg.querySelector(".map-hub .core");
      var dots = svg.querySelectorAll(".map-pin .dot");
      if(!hub || !dots.length) return;
      var hx = parseFloat(hub.getAttribute("cx")), hy = parseFloat(hub.getAttribute("cy"));
      var NS = "http://www.w3.org/2000/svg";
      var g = document.createElementNS(NS, "g");
      svg.appendChild(g);
      var spokes = [];
      dots.forEach(function(d,i){
        var px = parseFloat(d.getAttribute("cx")), py = parseFloat(d.getAttribute("cy"));
        var c = document.createElementNS(NS, "circle");
        c.setAttribute("r","3.4"); c.setAttribute("class","map-pulse"); c.style.opacity = "0";
        g.appendChild(c);
        spokes.push({ x1:hx, y1:hy, x2:px, y2:py, el:c, phase:(i*0.37)%1 });
      });
      var running = false, t0 = null, period = 2800;
      function loop(ts){
        if(!t0) t0 = ts;
        var t = ts - t0;
        for(var i=0;i<spokes.length;i++){
          var s = spokes[i];
          var local = ((t/period) + s.phase) % 1;
          s.el.setAttribute("cx", (s.x1 + (s.x2-s.x1)*local).toFixed(1));
          s.el.setAttribute("cy", (s.y1 + (s.y2-s.y1)*local).toFixed(1));
          s.el.style.opacity = (Math.sin(local*Math.PI) * 0.9).toFixed(2);
        }
        if(running) requestAnimationFrame(loop);
      }
      if("IntersectionObserver" in window){
        var pio = new IntersectionObserver(function(ents){
          ents.forEach(function(en){
            running = en.isIntersecting;
            if(running) requestAnimationFrame(loop);
          });
        }, { threshold:0.2 });
        pio.observe(svg);
      } else { running = true; requestAnimationFrame(loop); }
    });
  }

})();
