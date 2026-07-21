/* ============================================================
   DERMALUX — A Ciência da Luz
   Orquestração GSAP: preloader, smooth scroll, reveals,
   espectro interativo, portfólio pinado, antes/depois, cursor.
   ============================================================ */

(function () {
  "use strict";

  if (!window.gsap) return; // CDN falhou: página permanece estática e legível

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isDesktop = window.matchMedia("(min-width: 900px)").matches;

  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, ScrollToPlugin, SplitText);

  if (!reduced) document.documentElement.classList.add("js");

  /* ---------- Cores do espectro ---------- */
  var COLORS = { blue: "#4e8dff", red: "#ff4b41", nir: "#ffa475" };

  /* ============================================================
     SMOOTH SCROLL
     ============================================================ */
  var smoother = null;
  if (!reduced && isDesktop) {
    smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1.15,
      effects: true,
      smoothTouch: false
    });
  }

  /* ============================================================
     NAV + MENU MOBILE + ÂNCORAS
     ============================================================ */
  var nav = document.getElementById("nav");
  window.addEventListener("scroll", function () {
    nav.classList.toggle("is-scrolled", window.scrollY > 50);
  }, { passive: true });

  var burger = document.getElementById("navBurger");
  var mobmenu = document.getElementById("mobmenu");
  function closeMenu() {
    burger.classList.remove("is-open");
    mobmenu.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    mobmenu.setAttribute("aria-hidden", "true");
  }
  burger.addEventListener("click", function () {
    var open = !mobmenu.classList.contains("is-open");
    burger.classList.toggle("is-open", open);
    mobmenu.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    mobmenu.setAttribute("aria-hidden", String(!open));
  });

  document.querySelectorAll("[data-scroll]").forEach(function (link) {
    link.addEventListener("click", function (e) {
      var target = document.querySelector(link.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      closeMenu();
      if (smoother) {
        smoother.scrollTo(target, true, "top 0");
      } else {
        gsap.to(window, { duration: reduced ? 0 : 1, scrollTo: { y: target, offsetY: 0 }, ease: "power3.inOut" });
      }
    });
  });

  /* ============================================================
     PRELOADER + INTRO DO HERO
     ============================================================ */
  var preloader = document.getElementById("preloader");

  function heroIntro() {
    if (reduced) return;
    var tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from(nav, { y: -40, autoAlpha: 0, duration: 0.9 }, 0.1)
      .from(".hero__eyebrow", { y: 24, autoAlpha: 0, duration: 0.8 }, 0.25);

    try {
      var split = new SplitText("#heroTitle", { type: "lines", linesClass: "hero-line" });
      split.lines.forEach(function (line) {
        var wrap = document.createElement("div");
        wrap.style.overflow = "hidden";
        line.parentNode.insertBefore(wrap, line);
        wrap.appendChild(line);
      });
      tl.from(split.lines, { yPercent: 110, duration: 1.15, stagger: 0.12, ease: "power4.out" }, 0.35);
    } catch (err) {
      tl.from("#heroTitle", { y: 40, autoAlpha: 0, duration: 1 }, 0.35);
    }

    tl.from("#heroSub", { y: 30, autoAlpha: 0, duration: 0.9 }, 0.8)
      .from("#scrollCue", { autoAlpha: 0, duration: 0.8 }, 1.2)
      .from(".hero__video", { scale: 1.18, duration: 2.2, ease: "power2.out" }, 0);
  }

  function exitPreloader() {
    if (reduced) {
      preloader.style.display = "none";
      return;
    }
    var tl = gsap.timeline();
    tl.to(".preloader__beam span", { xPercent: 320, duration: 0.5, ease: "power2.in" })
      .to(".preloader__inner", { autoAlpha: 0, y: -20, duration: 0.4 }, "-=0.15")
      .to(preloader, {
        yPercent: -100,
        duration: 0.9,
        ease: "expo.inOut",
        onComplete: function () {
          preloader.style.display = "none";
          ScrollTrigger.refresh();
        }
      }, "-=0.1")
      .add(heroIntro, "-=0.55");
  }

  if (reduced) {
    exitPreloader();
  } else {
    gsap.timeline()
      .to(".preloader__logo", { autoAlpha: 1, duration: 0.7, ease: "power2.out" }, 0.15)
      .to(".preloader__tag", { autoAlpha: 0.7, duration: 0.7 }, 0.35)
      .fromTo(".preloader__beam span", { xPercent: -110 }, { xPercent: 60, duration: 1.1, ease: "power2.inOut" }, 0.2);

    var ready = Promise.all([
      new Promise(function (res) {
        if (document.readyState === "complete") res();
        else window.addEventListener("load", res, { once: true });
      }),
      document.fonts ? document.fonts.ready : Promise.resolve(),
      new Promise(function (res) { setTimeout(res, 1500); })
    ]);
    ready.then(exitPreloader);
  }

  /* ============================================================
     HERO — parallax de saída
     ============================================================ */
  if (!reduced) {
    gsap.to(".hero__content", {
      yPercent: -18,
      autoAlpha: 0.15,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom 30%", scrub: true }
    });
    gsap.to(".hero__video", {
      scale: 1.14,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
    });
    gsap.to("#scrollCue", {
      autoAlpha: 0,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "18% top", scrub: true }
    });
  }

  /* ============================================================
     REVEALS GENÉRICOS
     ============================================================ */
  if (!reduced) {
    gsap.utils.toArray(".eyebrow, .h2, .section-sub").forEach(function (el) {
      gsap.to(el, {
        autoAlpha: 1, y: 0, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%" }
      });
    });
    [".fact", ".cert", ".voice", ".case"].forEach(function (sel) {
      ScrollTrigger.batch(sel, {
        start: "top 88%",
        onEnter: function (items) {
          gsap.to(items, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.12, ease: "power3.out", overwrite: true });
        }
      });
    });
  }

  /* ============================================================
     MANIFESTO — revelação palavra a palavra no scroll
     ============================================================ */
  if (!reduced) {
    document.fonts.ready.then(function () {
      try {
        var mSplit = new SplitText("#manifesto", { type: "words", wordsClass: "w" });
        gsap.to(mSplit.words, {
          opacity: 1,
          stagger: 0.05,
          ease: "none",
          scrollTrigger: {
            trigger: "#manifesto",
            start: "top 78%",
            end: "bottom 45%",
            scrub: 0.6
          }
        });
      } catch (err) { /* manifesto permanece visível */ }
    });
  }

  /* ============================================================
     CONTADORES
     ============================================================ */
  document.querySelectorAll("[data-counter]").forEach(function (el) {
    var target = parseInt(el.getAttribute("data-counter"), 10);
    if (reduced) { el.textContent = target; return; }
    var start = target > 100 ? target - 80 : 0;
    var obj = { v: start };
    gsap.to(obj, {
      v: target,
      duration: 1.8,
      ease: "power2.out",
      snap: { v: 1 },
      scrollTrigger: { trigger: el, start: "top 88%" },
      onUpdate: function () { el.textContent = Math.round(obj.v); }
    });
  });

  /* ============================================================
     ESPECTRO — simulador de comprimentos de onda
     ============================================================ */
  var WAVES = {
    blue: { nm: 415, name: "Luz Azul", desc: "Ação antibacteriana. Indicada para acne e controle da inflamação.", depth: "34%" },
    red:  { nm: 633, name: "Luz Vermelha", desc: "Estimula a produção de colágeno, melhora a regeneração e reduz a inflamação.", depth: "62%" },
    nir:  { nm: 830, name: "Infravermelho Próximo", desc: "Atua nas camadas mais profundas: recuperação tecidual, modulação inflamatória e fotobiomodulação celular.", depth: "94%" }
  };
  var waveOrder = ["blue", "red", "nir"];
  var currentWave = "blue";
  var spectrumSection = document.querySelector(".spectrum");
  var nmValue = document.getElementById("nmValue");
  var nmName = document.getElementById("nmName");
  var nmDesc = document.getElementById("nmDesc");
  var skinBeam = document.getElementById("skinBeam");
  var waveTabs = document.querySelectorAll(".wavetab");

  function setWave(key, animate) {
    if (key === currentWave && animate !== "force") return;
    var from = WAVES[currentWave];
    currentWave = key;
    var w = WAVES[key];

    waveTabs.forEach(function (tab) {
      var active = tab.getAttribute("data-wave") === key;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
    });

    spectrumSection.style.setProperty("--wave-color", COLORS[key]);

    if (reduced || !animate) {
      nmValue.textContent = w.nm;
      nmName.textContent = w.name;
      nmDesc.textContent = w.desc;
      skinBeam.style.height = w.depth;
      return;
    }

    var obj = { v: from.nm };
    gsap.to(obj, {
      v: w.nm, duration: 0.7, ease: "power2.inOut", snap: { v: 1 },
      onUpdate: function () { nmValue.textContent = Math.round(obj.v); }
    });
    gsap.to(skinBeam, { height: w.depth, duration: 0.9, ease: "power3.inOut", overwrite: "auto" });
    gsap.timeline({ overwrite: "auto" })
      .to([nmName, nmDesc], { autoAlpha: 0, y: -8, duration: 0.22, ease: "power1.in", overwrite: "auto" })
      .add(function () { nmName.textContent = w.name; nmDesc.textContent = w.desc; })
      .to([nmName, nmDesc], { autoAlpha: 1, y: 0, duration: 0.35, ease: "power2.out" });
  }

  setWave("blue", "force");

  /* Seção pinada em todas as telas — o scroll percorre as 3 luzes antes de seguir */
  var wavePin = null;
  var waveSteps = document.querySelectorAll(".spectrum__step");
  var waveBars = [document.getElementById("spectrumBar1"), document.getElementById("spectrumBar2")];
  if (!reduced) {
    wavePin = ScrollTrigger.create({
      trigger: ".spectrum",
      start: "top top",
      end: "+=220%",
      pin: true,
      onUpdate: function (self) {
        var p = self.progress;
        var idx = Math.min(2, Math.floor(p * 3));
        var key = waveOrder[idx];
        if (key !== currentWave) setWave(key, true);
        waveSteps.forEach(function (s, i) {
          s.classList.toggle("is-active", i === idx);
          s.classList.toggle("is-done", i < idx);
        });
        gsap.set(waveBars[0], { scaleX: gsap.utils.clamp(0, 1, p * 3) });
        gsap.set(waveBars[1], { scaleX: gsap.utils.clamp(0, 1, p * 3 - 1) });
      }
    });
  }
  waveTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var key = tab.getAttribute("data-wave");
      if (wavePin) {
        var idx = waveOrder.indexOf(key);
        var y = wavePin.start + ((wavePin.end - wavePin.start) * (idx + 0.5)) / 3;
        gsap.to(window, { duration: 0.8, scrollTo: y, ease: "power2.inOut" });
      } else {
        setWave(key, true);
      }
    });
  });

  /* ============================================================
     DISPOSITIVOS — sequência cinematográfica pinada (desktop)
     ============================================================ */
  var deviceEls = gsap.utils.toArray(".device");
  var deviceColors = ["blue", "red", "nir"];
  var devicesPinEl = document.getElementById("devicesPin");
  var stepEls = document.querySelectorAll(".devices__step");
  var barFills = [document.getElementById("devicesBarFill"), document.getElementById("devicesBarFill2")];

  function setDeviceStep(idx) {
    stepEls.forEach(function (s, i) {
      s.classList.toggle("is-active", i === idx);
      s.classList.toggle("is-done", i < idx);
    });
    devicesPinEl.style.setProperty("--device-color", COLORS[deviceColors[idx]]);
    deviceEls.forEach(function (d, i) { d.classList.toggle("is-current", i === idx); });
  }

  /* Sequência pinada em todas as telas */
  if (!reduced) {
    gsap.set(deviceEls[0], { autoAlpha: 1, y: 0 });
    gsap.set([deviceEls[1], deviceEls[2]], { autoAlpha: 0, y: 0 });

    var switchPts = { p1: 0.33, p2: 0.7 }; // recalculado após montar a timeline
    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".devices",
        start: "top top",
        end: "+=280%",
        pin: true,
        scrub: 0.7,
        onUpdate: function (self) {
          var p = self.progress;
          var idx = p < switchPts.p1 ? 0 : (p < switchPts.p2 ? 1 : 2);
          setDeviceStep(idx);
          gsap.set(barFills[0], { scaleX: gsap.utils.clamp(0, 1, p / switchPts.p1) });
          gsap.set(barFills[1], { scaleX: gsap.utils.clamp(0, 1, (p - switchPts.p1) / (switchPts.p2 - switchPts.p1)) });
        }
      }
    });

    tl.to({}, { duration: 0.55 })
      .to(deviceEls[0].querySelector(".device__text"), { autoAlpha: 0, y: -70, duration: 0.4, ease: "power2.in" }, "sw1")
      .to(deviceEls[0].querySelector(".device__media"), { autoAlpha: 0, y: -50, scale: 0.96, duration: 0.45, ease: "power2.in" }, "sw1")
      .set(deviceEls[0], { autoAlpha: 0 })
      .set(deviceEls[1], { autoAlpha: 1 })
      .fromTo(deviceEls[1].querySelector(".device__media"),
        { autoAlpha: 0, y: 90, scale: 1.05 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.5, ease: "power2.out" }, "sw1+=0.42")
      .fromTo(deviceEls[1].querySelector(".device__text"),
        { autoAlpha: 0, y: 80 },
        { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" }, "sw1+=0.5")
      .to({}, { duration: 0.65 })
      .to(deviceEls[1].querySelector(".device__text"), { autoAlpha: 0, y: -70, duration: 0.4, ease: "power2.in" }, "sw2")
      .to(deviceEls[1].querySelector(".device__media"), { autoAlpha: 0, y: -50, scale: 0.96, duration: 0.45, ease: "power2.in" }, "sw2")
      .set(deviceEls[1], { autoAlpha: 0 })
      .set(deviceEls[2], { autoAlpha: 1 })
      .fromTo(deviceEls[2].querySelector(".device__media"),
        { autoAlpha: 0, y: 90, scale: 1.05 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.5, ease: "power2.out" }, "sw2+=0.42")
      .fromTo(deviceEls[2].querySelector(".device__text"),
        { autoAlpha: 0, y: 80 },
        { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" }, "sw2+=0.5")
      .to({}, { duration: 0.6 });

    switchPts.p1 = (tl.labels.sw1 + 0.45) / tl.duration();
    switchPts.p2 = (tl.labels.sw2 + 0.45) / tl.duration();
  }

  /* ============================================================
     ANTES / DEPOIS — sliders arrastáveis
     ============================================================ */
  document.querySelectorAll(".ba").forEach(function (ba) {
    var afterWrap = ba.querySelector(".ba__afterwrap");
    var handle = ba.querySelector(".ba__handle");
    var pct = 50;
    var dragging = false;

    function apply(p) {
      pct = gsap.utils.clamp(4, 96, p);
      afterWrap.style.clipPath = "inset(0 0 0 " + pct + "%)";
      handle.style.left = pct + "%";
    }

    function pctFromEvent(e) {
      var rect = ba.getBoundingClientRect();
      return ((e.clientX - rect.left) / rect.width) * 100;
    }

    ba.addEventListener("pointerdown", function (e) {
      dragging = true;
      ba.setPointerCapture(e.pointerId);
      apply(pctFromEvent(e));
    });
    ba.addEventListener("pointermove", function (e) {
      if (dragging) apply(pctFromEvent(e));
    });
    ["pointerup", "pointercancel"].forEach(function (evt) {
      ba.addEventListener(evt, function () { dragging = false; });
    });

    if (!reduced) {
      ScrollTrigger.create({
        trigger: ba,
        start: "top 85%",
        once: true,
        onEnter: function () {
          var obj = { p: 50 };
          gsap.timeline()
            .to(obj, { p: 66, duration: 0.8, ease: "power2.inOut", onUpdate: function () { apply(obj.p); } })
            .to(obj, { p: 42, duration: 0.9, ease: "power2.inOut", onUpdate: function () { apply(obj.p); } })
            .to(obj, { p: 50, duration: 0.7, ease: "power2.out", onUpdate: function () { apply(obj.p); } });
        }
      });
    }
  });

  /* ============================================================
     REFRESH após carregamento de imagens
     ============================================================ */
  window.addEventListener("load", function () {
    ScrollTrigger.refresh();
  });
})();
