document.addEventListener('DOMContentLoaded', () => {

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ===== 0. NAVEGACIÓ AMB ESTAT ACTIU ===== */
  const navLinks = document.querySelectorAll('.nav-link');
  const seccionsNav = Array.from(navLinks)
    .map(link => document.getElementById(link.dataset.navTarget))
    .filter(Boolean);

  if (seccionsNav.length) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => {
            link.classList.toggle('actiu', link.dataset.navTarget === entry.target.id);
          });
        }
      });
    }, { threshold: 0.5 });
    seccionsNav.forEach(sec => navObserver.observe(sec));
  }

  /* ===== 1. REVEAL ON SCROLL ===== */
  const revealEls = document.querySelectorAll('.reveal');
  if (reduceMotion) {
    revealEls.forEach(el => el.classList.add('visible'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach((el, i) => {
      el.style.transitionDelay = `${(i % 4) * 0.08}s`;
      observer.observe(el);
    });
  }

  /* ===== 2. AUDIO PERSONALIZADO ===== */
  const audio = document.getElementById('audio-player');
  const playPauseBtn = document.getElementById('play-pause');
  const iconaPlay = document.getElementById('icona-play');
  const iconaPausa = document.getElementById('icona-pausa');
  const progresFons = document.getElementById('progres-fons');
  const progresOmplert = document.getElementById('progres-omplert');
  const tempsActual = document.getElementById('temps-actual');
  const tempsTotal = document.getElementById('temps-total');
  const musicaFlotant = document.getElementById('musica-flotant');
  const iconaFlotantPlay = document.getElementById('icona-flotant-play');
  const iconaFlotantPausa = document.getElementById('icona-flotant-pausa');

  function formatTemps(segons) {
    if (!isFinite(segons)) return '0:00';
    const m = Math.floor(segons / 60);
    const s = Math.floor(segons % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function actualitzaIconesPlay(reproduint) {
    iconaPlay.hidden = reproduint;
    iconaPausa.hidden = !reproduint;
    iconaFlotantPlay.hidden = reproduint;
    iconaFlotantPausa.hidden = !reproduint;
  }

  function toggleAudio() {
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }

  playPauseBtn.addEventListener('click', toggleAudio);
  musicaFlotant.addEventListener('click', toggleAudio);

  audio.addEventListener('play', () => actualitzaIconesPlay(true));
  audio.addEventListener('pause', () => actualitzaIconesPlay(false));

  audio.addEventListener('loadedmetadata', () => {
    tempsTotal.textContent = formatTemps(audio.duration);
  });

  audio.addEventListener('timeupdate', () => {
    tempsActual.textContent = formatTemps(audio.currentTime);
    if (audio.duration) {
      progresOmplert.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
    }
  });

  progresFons.addEventListener('click', (e) => {
    const rect = progresFons.getBoundingClientRect();
    const percentatge = (e.clientX - rect.left) / rect.width;
    if (audio.duration) audio.currentTime = percentatge * audio.duration;
  });

  /* ===== 2b. CONTROLS EXTRA DEL REPRODUCTOR ===== */
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const btnRepeat = document.getElementById('btn-repeat');
  const btnShuffle = document.getElementById('btn-shuffle');

  if (btnPrev) btnPrev.addEventListener('click', () => {
    audio.currentTime = Math.max(0, audio.currentTime - 10);
  });
  if (btnNext) btnNext.addEventListener('click', () => {
    if (audio.duration) audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
  });
  if (btnRepeat) btnRepeat.addEventListener('click', () => {
    audio.loop = !audio.loop;
    btnRepeat.setAttribute('aria-pressed', audio.loop);
  });
  if (btnShuffle) btnShuffle.addEventListener('click', () => {
    const actiu = btnShuffle.getAttribute('aria-pressed') === 'true';
    btnShuffle.setAttribute('aria-pressed', !actiu);
  });

  /* ===== 3. BOTÓN "COMENÇA": inicia música y hace scroll ===== */
  const btnComenca = document.getElementById('btn-comenca');
  btnComenca.addEventListener('click', () => {
    audio.play().catch(() => {});
    musicaFlotant.hidden = false;
    document.getElementById('introduccio').scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth'
    });
  });

  /* ===== 3b. ESPELMA DE CUMPLEANYS ===== */
  const espelmaBtn = document.getElementById('espelma-btn');
  const desigText = document.getElementById('desig-text');
  const espelmaHint = document.getElementById('espelma-hint');
  const colorsConfeti = ['#E8776B', '#F0A595', '#F0C58F', '#C85A50'];

  function llançarConfeti(origenEl) {
    const rect = origenEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top;
    const total = reduceMotion ? 0 : 22;
    for (let i = 0; i < total; i++) {
      const particula = document.createElement('div');
      particula.className = 'confeti';
      const angle = Math.random() * Math.PI * 2;
      const distancia = 60 + Math.random() * 90;
      particula.style.setProperty('--dx', `${Math.cos(angle) * distancia}px`);
      particula.style.setProperty('--dy', `${Math.sin(angle) * distancia - 40}px`);
      particula.style.left = `${cx}px`;
      particula.style.top = `${cy}px`;
      particula.style.background = colorsConfeti[i % colorsConfeti.length];
      document.body.appendChild(particula);
      setTimeout(() => particula.remove(), 1600);
    }
  }

  if (espelmaBtn) {
    espelmaBtn.addEventListener('click', () => {
      if (espelmaBtn.classList.contains('apagada')) return;
      espelmaBtn.classList.add('apagada');
      desigText.hidden = false;
      espelmaHint.hidden = true;
      llançarConfeti(espelmaBtn);
    });
  }

  /* ===== 4. LIGHTBOX DE GALERÍA ===== */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxTancar = document.getElementById('lightbox-tancar');

  document.querySelectorAll('.polaroid img').forEach(img => {
    img.addEventListener('click', () => {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightbox.hidden = false;
    });
  });

  function tancarLightbox() {
    lightbox.hidden = true;
    lightboxImg.src = '';
  }
  lightboxTancar.addEventListener('click', tancarLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) tancarLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !lightbox.hidden) tancarLightbox();
  });

  /* ===== 5. CARRUSEL "MOMENTOS ESPECIALES" ===== */
  const carrusel = document.getElementById('carrusel');
  const carruselPrev = document.getElementById('carrusel-prev');
  const carruselNext = document.getElementById('carrusel-next');

  function desplaçarCarrusel(direccio) {
    const slide = carrusel.querySelector('.carrusel-slide');
    const amplada = slide ? slide.getBoundingClientRect().width + 24 : 300;
    carrusel.scrollBy({ left: direccio * amplada, behavior: reduceMotion ? 'auto' : 'smooth' });
  }
  carruselPrev.addEventListener('click', () => desplaçarCarrusel(-1));
  carruselNext.addEventListener('click', () => desplaçarCarrusel(1));
  /* El deslizamiento táctil funciona de forma nativa gracias a overflow-x + scroll-snap */

  /* ===== 5b. PUNTS I COMPTADOR DEL CARRUSEL ===== */
  const dotsWrapper = document.getElementById('carrusel-dots');
  const comptador = document.getElementById('carrusel-comptador');
  const slides = Array.from(carrusel.querySelectorAll('.carrusel-slide'));

  if (dotsWrapper && slides.length) {
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'carrusel-dot';
      dot.setAttribute('aria-label', `Anar al moment ${i + 1}`);
      dot.addEventListener('click', () => {
        slides[i].scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', inline: 'center', block: 'nearest' });
      });
      dotsWrapper.appendChild(dot);
    });

    function actualitzaPaginacio() {
      const centreCarrusel = carrusel.scrollLeft + carrusel.clientWidth / 2;
      let indexActiu = 0;
      let distanciaMin = Infinity;
      slides.forEach((slide, i) => {
        const centreSlide = slide.offsetLeft + slide.clientWidth / 2;
        const distancia = Math.abs(centreSlide - centreCarrusel);
        if (distancia < distanciaMin) { distanciaMin = distancia; indexActiu = i; }
      });
      dotsWrapper.querySelectorAll('.carrusel-dot').forEach((dot, i) => {
        dot.classList.toggle('actiu', i === indexActiu);
      });
      if (comptador) comptador.textContent = `${indexActiu + 1} / ${slides.length}`;
    }

    let ticking = false;
    carrusel.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => { actualitzaPaginacio(); ticking = false; });
        ticking = true;
      }
    });
    actualitzaPaginacio();
  }

  /* ===== 6. SOBRE / CARTA FINAL ===== */
  const sobre = document.getElementById('sobre');
  const cartaPaper = document.getElementById('carta-paper');

  function obrirSobre() {
    const obert = sobre.classList.toggle('obert');
    sobre.setAttribute('aria-expanded', obert);
    if (obert) {
      cartaPaper.hidden = false;
      setTimeout(() => {
        cartaPaper.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      }, reduceMotion ? 0 : 500);
    }
  }
  sobre.addEventListener('click', obrirSobre);
  sobre.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      obrirSobre();
    }
  });

});