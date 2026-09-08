/* ════════════════════════════════════════════════════════════════
   حديقة الاعتذار — المنطق التفاعلي
   1) نمو المراحل عبر IntersectionObserver (تفعيل مرة واحدة فقط)
   2) سماء النجوم + الجزيئات المتطايرة
   3) زر الموسيقى مع fade-in / fade-out ناعم
   4) إخفاء تلميح النزول بعد أول سكرول
   ════════════════════════════════════════════════════════════════ */

'use strict';

/* هل المستخدم فعّل تقليل الحركة؟ */
const prefersReducedMotion =
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ────────────────────────────────────────────────────────────────
   1) تفعيل المراحل عند دخولها نطاق الرؤية
   نستخدم IntersectionObserver لضمان أداء سلس، ونلغي المراقبة بعد
   أول تفعيل حتى لا تتكرر الأنيميشن أو تنكسر.
   ──────────────────────────────────────────────────────────────── */
const stages = document.querySelectorAll('.stage');

const stageObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const stage = entry.target;
      stage.classList.add('active');

      /* الجزيئات المتطايرة خاصة بالمرحلة الخامسة فقط */
      if (stage.id === 'stage-5') {
        spawnParticles(stage.querySelector('.particles'));
      }

      /* تفعيل مرة واحدة فقط — لا إعادة تفعيل للمرحلة نفسها */
      stageObserver.unobserve(stage);
    });
  },
  // لا نستخدم نسبة كبيرة هنا: المرحلة الأخيرة قد تصبح أطول من نافذة
  // العرض عند كتابة رسالة طويلة، وبالتالي لن تصل أبدًا إلى 40% ظهورًا.
  // يكفي دخول بداية المرحلة إلى منطقة الرؤية لتشغيلها.
  { threshold: 0, rootMargin: '0px 0px -18% 0px' }
);

stages.forEach((stage) => stageObserver.observe(stage));

/* ────────────────────────────────────────────────────────────────
   2-a) سماء النجوم الثابتة خلف المحتوى
   ──────────────────────────────────────────────────────────────── */
function buildStars() {
  const container = document.querySelector('.stars');
  if (!container) return;

  const COUNT = 42;
  for (let i = 0; i < COUNT; i++) {
    const star = document.createElement('span');
    star.className = 'star';

    const size = 1 + Math.random() * 2; // 1 إلى 3px
    star.style.width = size + 'px';
    star.style.height = size + 'px';
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';

    /* تنويع إيقاع الوميض حتى لا تلمع كل النجوم معًا */
    star.style.animationDuration = 2.5 + Math.random() * 3 + 's';
    star.style.animationDelay = Math.random() * 4 + 's';

    container.appendChild(star);
  }
}

/* ────────────────────────────────────────────────────────────────
   2-b) جزيئات ذهبية/بيضاء متطايرة لإحساس سحري (المرحلة 5)
   ──────────────────────────────────────────────────────────────── */
function spawnParticles(container) {
  if (!container || prefersReducedMotion) return; // لا جزيئات مع تقليل الحركة

  const COUNT = 26;
  for (let i = 0; i < COUNT; i++) {
    const p = document.createElement('span');
    p.className = 'particle ' + (i % 2 === 0 ? 'rose' : 'white');

    const size = 2 + Math.random() * 3.5; // 2 إلى 5.5px
    p.style.width = size + 'px';
    p.style.height = size + 'px';
    p.style.left = Math.random() * 100 + '%';
    p.style.bottom = Math.random() * 30 + 'px';
    p.style.animationDuration = 6 + Math.random() * 6 + 's';
    p.style.animationDelay = Math.random() * 6 + 's';

    container.appendChild(p);
  }
}

/* ────────────────────────────────────────────────────────────────
   3) الموسيقى الخلفية — زر صغير مع تلاشٍ صوتي ناعم
   لا يوجد autoplay: الصوت لا يبدأ إلا بضغطة من الزائر.
   ──────────────────────────────────────────────────────────────── */
const audio = document.getElementById('bg-music');
const musicBtn = document.getElementById('music-toggle');

const TARGET_VOLUME = 0.55;  // مستوى الصوت النهائي
const FADE_STEP = 0.04;      // مقدار التغيير في كل خطوة
const FADE_INTERVAL = 60;    // بالميلي ثانية — ≈ 0.8s للتلاشي الكامل

let fadeTimer = null;
let audioAvailable = true;   // تصبح false إذا تعذّر تحميل الملف

/* تلاشٍ تدريجي للصوت نحو قيمة معيّنة ثم تنفيذ callback اختياري */
function fadeVolumeTo(target, onDone) {
  clearInterval(fadeTimer);
  fadeTimer = setInterval(() => {
    const current = audio.volume;

    if (Math.abs(current - target) <= FADE_STEP) {
      audio.volume = target;
      clearInterval(fadeTimer);
      fadeTimer = null;
      if (onDone) onDone();
      return;
    }

    audio.volume = current + (target > current ? FADE_STEP : -FADE_STEP);
  }, FADE_INTERVAL);
}

/* يُستدعى عند فشل تحميل/تشغيل الملف الصوتي (مثلاً placeholder فارغ) */
function markAudioUnavailable() {
  audioAvailable = false;
  musicBtn.classList.remove('playing');
  musicBtn.classList.add('no-audio');
  musicBtn.title = 'ضع ملف الموسيقى في assets/audio/background-music.mp3';
}

audio.addEventListener('error', markAudioUnavailable);

musicBtn.addEventListener('click', () => {
  if (!audioAvailable) return; // الزر يبقى معطّلًا بلطف حتى يوضع الملف الحقيقي

  if (audio.paused) {
    /* تشغيل مع fade-in: نبدأ بصوت صفر ثم نرفعه تدريجيًا */
    audio.volume = 0;
    const playPromise = audio.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise
        .then(() => {
          musicBtn.classList.add('playing');
          fadeVolumeTo(TARGET_VOLUME);
        })
        .catch(() => {
          /* نلتقط الرفض هنا حتى لا يظهر أي خطأ في الـ console */
          markAudioUnavailable();
        });
    } else {
      musicBtn.classList.add('playing');
      fadeVolumeTo(TARGET_VOLUME);
    }
  } else {
    /* إيقاف مع fade-out: نخفض الصوت تدريجيًا ثم نوقف */
    musicBtn.classList.remove('playing');
    fadeVolumeTo(0, () => audio.pause());
  }
});

/* ────────────────────────────────────────────────────────────────
   4) إخفاء تلميح النزول بعد أول سكرول
   ──────────────────────────────────────────────────────────────── */
window.addEventListener(
  'scroll',
  () => {
    document.body.classList.toggle('scrolled', window.scrollY > 60);
  },
  { passive: true }
);

/* ── تشغيل أولي ───────────────────────────────────────────────── */
buildStars();
