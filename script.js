document.addEventListener('DOMContentLoaded', () => {
  
  // 1. Scroll Fade-In Observer
  const fadeElems = document.querySelectorAll('.fade-in');
  const observerOptions = {
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px'
  };

  const scrollObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  fadeElems.forEach(elem => scrollObserver.observe(elem));

  // Auto-add fade-in to key elements
  document.querySelectorAll(
    '.section-header, .compare-card, .prog-card, .fac-card, .testi-card, .photo-item, .promo-box, .form-wrapper, .hero-content, .hero-visual'
  ).forEach((el, i) => {
    el.classList.add('fade-in');
    el.style.transitionDelay = `${Math.min(i * 0.06, 0.3)}s`;
    scrollObserver.observe(el);
  });


  // 2. Auto-slide Image Sliders (Program Cards)
  function initSliders() {
    const sliders = document.querySelectorAll('[data-slider]');
    
    sliders.forEach(slider => {
      const slides = slider.querySelectorAll('.prog-slide');
      const dots = slider.querySelectorAll('.prog-dot');
      if (!slides.length) return;

      let currentIndex = 0;
      const total = slides.length;

      function goTo(index) {
        slides.forEach((s, i) => s.classList.toggle('active', i === index));
        dots.forEach((d, i) => d.classList.toggle('active', i === index));
        currentIndex = index;
      }

      let interval = setInterval(() => goTo((currentIndex + 1) % total), 4000);

      dots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
          clearInterval(interval);
          goTo(i);
          interval = setInterval(() => goTo((currentIndex + 1) % total), 4000);
        });
      });
    });
  }

  initSliders();


  // 3. Mobile Navigation Toggle
  const mobileToggle = document.querySelector('.mobile-toggle');
  const mainNav = document.getElementById('main-nav');

  if (mobileToggle && mainNav) {
    mobileToggle.addEventListener('click', () => {
      mainNav.classList.toggle('nav-open');
      mobileToggle.textContent = mainNav.classList.contains('nav-open') ? '✕' : '☰';
    });

    // Close menu when clicking nav links
    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('nav-open');
        mobileToggle.textContent = '☰';
      });
    });
  }


  // 4. Countdown Timer (7 days from now)
  function startCountdown() {
    const els = {
      days: document.getElementById('cd-days'),
      hours: document.getElementById('cd-hours'),
      mins: document.getElementById('cd-mins'),
      secs: document.getElementById('cd-secs')
    };

    if (!els.days) return;

    // Use localStorage to persist the target date
    let targetDate;
    const stored = localStorage.getItem('tlg_countdown_target');
    
    if (stored && parseInt(stored) > Date.now()) {
      targetDate = parseInt(stored);
    } else {
      targetDate = Date.now() + (7 * 24 * 60 * 60 * 1000);
      localStorage.setItem('tlg_countdown_target', targetDate);
    }

    function update() {
      const diff = targetDate - Date.now();
      if (diff <= 0) {
        els.days.textContent = '00';
        els.hours.textContent = '00';
        els.mins.textContent = '00';
        els.secs.textContent = '00';
        return;
      }

      els.days.textContent = String(Math.floor(diff / 86400000)).padStart(2, '0');
      els.hours.textContent = String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0');
      els.mins.textContent = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
      els.secs.textContent = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
    }

    update();
    setInterval(update, 1000);
  }

  startCountdown();


  // 5. Form Submit -> Gửi dữ liệu về Google Sheets
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxsy0PBtJHXf9-hKh5t31X367qLFMJcHK1YLrQ-SC02wOxwN_RGLBo89njtlgRxq9IQ6g/exec';

  const regForm = document.getElementById('registration-form');
  if (regForm) {
    regForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const fullname = document.getElementById('fullname').value;
      const phone = document.getElementById('phone').value;
      const language = document.getElementById('language').value;
      const format = document.getElementById('format').value;
      const bankName = document.getElementById('bank-name').value;
      const bankAccount = document.getElementById('bank-account').value;
      const bankHolder = document.getElementById('bank-holder').value;
      
      const btn = regForm.querySelector('.btn-submit');
      const originalText = btn.textContent;
      btn.textContent = '⏳ Đang lưu dữ liệu...';
      btn.disabled = true;

      const formData = {
        fullname,
        phone,
        language,
        format,
        bankName,
        bankAccount,
        bankHolder
      };

      // Gửi dữ liệu sang Google Sheet nếu có URL
      if (GOOGLE_SCRIPT_URL && GOOGLE_SCRIPT_URL !== 'THAY_BANG_URL_GOOGLE_APPS_SCRIPT_CUA_BAN') {
        fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        }).catch(err => console.log('Google sheet submit log:', err));
      }
      
      setTimeout(() => {
        btn.textContent = '✅ Đăng ký & Ghi nhận STK thành công!';
        btn.style.background = '#2D9F46';

        alert(`🎉 Cảm ơn ${fullname}!\n\nBạn đã đăng ký giữ suất thành công lớp ${language} (0 đồng).\nThông tin nhận hoàn cọc ngân hàng (${bankName} - ${bankAccount}) đã được ghi nhận thành công.\nBộ phận tư vấn Thinh Long Group sẽ liên hệ qua SĐT/Zalo: ${phone} trong thời gian sớm nhất.`);
        
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = '';
          btn.disabled = false;
          regForm.reset();
        }, 1200);
      }, 600);
    });
  }


  // 6. Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

});
