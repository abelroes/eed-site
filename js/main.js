(function () {
  'use strict';

  function handleKeyboardNav(event) {
    const sections = document.querySelectorAll('.section');
    if (!sections.length) return;

    const container = document.querySelector('.scroll-container');
    if (!container) return;

    const currentIndex = Math.round(container.scrollTop / container.clientHeight);
    let targetIndex = currentIndex;

    if (event.key === 'ArrowDown' || event.key === 'PageDown') {
      targetIndex = Math.min(currentIndex + 1, sections.length - 1);
    } else if (event.key === 'ArrowUp' || event.key === 'PageUp') {
      targetIndex = Math.max(currentIndex - 1, 0);
    } else if (event.key === 'Home') {
      targetIndex = 0;
    } else if (event.key === 'End') {
      targetIndex = sections.length - 1;
    } else {
      return;
    }

    if (targetIndex !== currentIndex) {
      event.preventDefault();
      sections[targetIndex].scrollIntoView({ behavior: 'smooth' });
    }
  }

  /* --- Anchor Navigation -------------------------------------- */

  var isNavigating = false;

  function updateActiveNav(sectionId) {
    document.querySelectorAll('.catalog-header__nav-link').forEach(function (link) {
      var linkTarget = link.getAttribute('href').slice(1);
      var isActive = linkTarget === sectionId;
      link.classList.toggle('catalog-header__nav-link--active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  function initAnchorNav() {
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link) return;

      var targetId = link.getAttribute('href').slice(1);
      var target = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();
      isNavigating = true;
      history.pushState(null, '', '#' + targetId);
      updateActiveNav(targetId);
      target.scrollIntoView({ behavior: 'smooth' });

      setTimeout(function () { isNavigating = false; }, 1000);
    });

    window.addEventListener('popstate', function () {
      var hash = window.location.hash.slice(1);
      var target = hash && document.getElementById(hash);
      if (target) {
        isNavigating = true;
        updateActiveNav(hash);
        target.scrollIntoView({ behavior: 'smooth' });
        setTimeout(function () { isNavigating = false; }, 1000);
      }
    });
  }

  function initSectionObserver() {
    var sections = document.querySelectorAll('.section[id]');
    if (!sections.length) return;

    var observer = new IntersectionObserver(function (entries) {
      if (isNavigating) return;

      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.id;
          if (window.location.hash !== '#' + id) {
            history.replaceState(null, '', '#' + id);
          }
          updateActiveNav(id);
        }
      });
    }, { threshold: 0.6 });

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  function initHeaderVisibility() {
    var header = document.getElementById('global-header');
    var home = document.getElementById('home');
    if (!header || !home) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        header.classList.toggle('catalog-header--hidden', entry.isIntersecting);
      });
    }, { threshold: 0.3 });

    observer.observe(home);
  }

  function scrollToHashOnLoad() {
    var hash = window.location.hash.slice(1);
    if (!hash) return;
    var target = document.getElementById(hash);
    if (target) {
      setTimeout(function () {
        target.scrollIntoView({ behavior: 'smooth' });
        updateActiveNav(hash);
      }, 100);
    }
  }

  /* --- Carousel ----------------------------------------------- */

  function initCarousels() {
    const carousels = document.querySelectorAll('.carousel');

    carousels.forEach(function (carousel) {
      const track = carousel.querySelector('.carousel__track');
      const slides = track.querySelectorAll('.carousel__slide');
      const btnPrev = carousel.querySelector('.carousel__btn--prev');
      const btnNext = carousel.querySelector('.carousel__btn--next');

      if (!slides.length) return;

      let currentIndex = 0;

      function updateCarousel() {
        const offset = -(currentIndex * 100);
        track.style.transform = 'translateX(' + offset + '%)';

        btnPrev.disabled = currentIndex === 0;
        btnNext.disabled = currentIndex === slides.length - 1;

        slides.forEach(function (slide, i) {
          slide.setAttribute('aria-hidden', String(i !== currentIndex));
        });

        const liveRegion = carousel.querySelector('.carousel__live');
        if (liveRegion) {
          liveRegion.textContent = 'Item ' + (currentIndex + 1) + ' de ' + slides.length;
        }
      }

      function goTo(index) {
        currentIndex = Math.max(0, Math.min(index, slides.length - 1));
        updateCarousel();
      }

      btnPrev.addEventListener('click', function () {
        goTo(currentIndex - 1);
      });

      btnNext.addEventListener('click', function () {
        goTo(currentIndex + 1);
      });

      carousel.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          goTo(currentIndex - 1);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          goTo(currentIndex + 1);
        }
      });

      updateCarousel();
    });
  }

  /* --- i18n --------------------------------------------------- */

  var i18nCache = {};
  var currentLang = localStorage.getItem('lang') || 'pt';

  var LANG_MAP = {
    pt: 'pt-BR',
    en: 'en',
    es: 'es',
    zh: 'zh'
  };

  function loadTranslations(lang) {
    if (i18nCache[lang]) {
      return Promise.resolve(i18nCache[lang]);
    }
    return fetch('lang/' + lang + '.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        i18nCache[lang] = data;
        return data;
      });
  }

  function applyTranslations(translations) {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (translations[key] !== undefined) {
        el.textContent = translations[key];
      }
    });

    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-html');
      if (translations[key] !== undefined) {
        el.innerHTML = translations[key];
      }
    });

    document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      var pairs = el.getAttribute('data-i18n-attr').split(',');
      pairs.forEach(function (pair) {
        var parts = pair.split(':');
        var attr = parts[0].trim();
        var key = parts[1].trim();
        if (translations[key] !== undefined) {
          el.setAttribute(attr, translations[key]);
        }
      });
    });

    document.documentElement.lang = LANG_MAP[currentLang] || currentLang;
  }

  function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    loadTranslations(lang).then(applyTranslations);
  }

  /* --- Language Selector -------------------------------------- */

  function initLangSelectors() {
    var selectors = document.querySelectorAll('.lang-selector');

    var savedLang = localStorage.getItem('lang') || 'pt';
    var savedOption = document.querySelector('[data-lang="' + savedLang + '"]');
    if (savedOption) {
      var flagSrc = savedOption.dataset.flag;
      selectors.forEach(function (s) {
        var toggleImg = s.querySelector('.lang-selector__toggle .lang-selector__flag');
        if (toggleImg) toggleImg.src = flagSrc;
        s.querySelectorAll('[role="option"]').forEach(function (li) {
          li.setAttribute('aria-selected', 'false');
        });
        var match = s.querySelector('[data-lang="' + savedLang + '"]');
        if (match) match.closest('[role="option"]').setAttribute('aria-selected', 'true');
      });
    }

    if (savedLang !== 'pt') {
      setLanguage(savedLang);
    }

    selectors.forEach(function (selector) {
      var toggle = selector.querySelector('.lang-selector__toggle');
      var options = selector.querySelectorAll('.lang-selector__option');

      toggle.addEventListener('click', function () {
        var isOpen = selector.classList.toggle('lang-selector--open');
        toggle.setAttribute('aria-expanded', String(isOpen));
      });

      options.forEach(function (option) {
        option.addEventListener('click', function () {
          var lang = option.dataset.lang;
          var flagSrc = option.dataset.flag;

          selectors.forEach(function (s) {
            var toggleImg = s.querySelector('.lang-selector__toggle .lang-selector__flag');
            if (toggleImg) toggleImg.src = flagSrc;

            s.classList.remove('lang-selector--open');
            s.querySelector('.lang-selector__toggle').setAttribute('aria-expanded', 'false');

            s.querySelectorAll('[role="option"]').forEach(function (li) {
              li.setAttribute('aria-selected', 'false');
            });
            var matchingOption = s.querySelector('[data-lang="' + lang + '"]');
            if (matchingOption) {
              matchingOption.closest('[role="option"]').setAttribute('aria-selected', 'true');
            }
          });

          setLanguage(lang);
        });
      });
    });

    document.addEventListener('click', function (e) {
      selectors.forEach(function (selector) {
        if (!selector.contains(e.target)) {
          selector.classList.remove('lang-selector--open');
          selector.querySelector('.lang-selector__toggle').setAttribute('aria-expanded', 'false');
        }
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        selectors.forEach(function (selector) {
          selector.classList.remove('lang-selector--open');
          selector.querySelector('.lang-selector__toggle').setAttribute('aria-expanded', 'false');
        });
      }
    });
  }

  /* --- About Tabs (Missão/Visão/Valores) ---------------------- */

  function initAboutTabs() {
    document.addEventListener('click', function (e) {
      var handle = e.target.closest('.about__tab-handle');
      if (!handle) return;

      e.stopPropagation();

      var container = handle.closest('.about__tabs-container');
      if (!container) return;

      var targetTab = handle.dataset.tabTarget;

      container.querySelectorAll('.about__tab-handle').forEach(function (h) {
        var isActive = h.dataset.tabTarget === targetTab;
        h.classList.toggle('about__tab-handle--active', isActive);
        h.setAttribute('aria-selected', String(isActive));
      });

      container.querySelectorAll('.about__tab-card').forEach(function (card) {
        var isActive = card.dataset.tab === targetTab;
        card.classList.toggle('about__tab-card--active', isActive);
      });
    });
  }

  /* --- Contact Form (Google Forms) ----------------------------- */

  var GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSdqwpTixmlnqDQI-emHcuDsGXwxm-OGb5IjM7CnEvetu1FPgg/formResponse';

  var SUBJECT_MAP = {
    arquitetura: 'Projeto de Arquitetura',
    interiores: 'Design de Interiores',
    marcenaria: 'Marcenaria',
    artesanato: 'Artesanato em Couro',
    produtos: 'Produtos',
    orcamento: 'Orçamento',
    outro: '__other_option__'
  };

  function initContactForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var submitBtn = form.querySelector('.contact__submit');
      var originalText = submitBtn.textContent;

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      submitBtn.disabled = true;
      var t = i18nCache[currentLang] || {};
      submitBtn.textContent = t['contact.sending'] || 'Enviando...';

      var formData = new URLSearchParams();
      formData.append('entry.855736564', form.elements.name.value);
      formData.append('entry.648834982', form.elements.email.value);
      formData.append('entry.2092873473', form.elements.message.value);

      var subjectValue = form.elements.subject.value;
      var mappedSubject = SUBJECT_MAP[subjectValue] || subjectValue;
      formData.append('entry.1347159864', mappedSubject);
      if (subjectValue === 'outro') {
        formData.append('entry.1347159864.other_option_response', 'Outro');
      }

      fetch(GOOGLE_FORM_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      }).then(function () {
        submitBtn.textContent = t['contact.sent'] || 'Enviado!';
        form.reset();
        setTimeout(function () {
          submitBtn.textContent = t['contact.submit'] || originalText;
          submitBtn.disabled = false;
        }, 3000);
      }).catch(function () {
        submitBtn.textContent = t['contact.error'] || 'Erro — tente novamente';
        submitBtn.disabled = false;
        setTimeout(function () { submitBtn.textContent = t['contact.submit'] || originalText; }, 3000);
      });
    });
  }

  /* --- Slide Modal -------------------------------------------- */

  function initSlideModal() {
    var modal = document.getElementById('slide-modal');
    if (!modal) return;

    var modalTitle = modal.querySelector('.modal-overlay__title');
    var modalDesc = modal.querySelector('.modal-overlay__desc');
    var closeBtn = modal.querySelector('.modal-overlay__close');

    function openModal(title, desc) {
      modalTitle.textContent = title;
      modalDesc.textContent = desc;
      modal.classList.add('modal-overlay--open');
      modal.setAttribute('aria-hidden', 'false');
      closeBtn.focus();
    }

    function closeModal() {
      modal.classList.remove('modal-overlay--open');
      modal.setAttribute('aria-hidden', 'true');
    }

    var images = document.querySelectorAll('.carousel__image');
    images.forEach(function (img) {
      img.addEventListener('click', function () {
        var slide = img.closest('.carousel__slide');
        if (!slide) return;

        var caption = slide.querySelector('.carousel__caption');
        if (!caption) return;

        var title = caption.querySelector('.carousel__caption-title');
        var desc = caption.querySelector('.carousel__caption-desc');

        openModal(
          title ? title.textContent : '',
          desc ? desc.textContent : ''
        );
      });
    });

    closeBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      closeModal();
    });

    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('modal-overlay--open')) {
        closeModal();
      }
    });
  }

  /* --- Init --------------------------------------------------- */

  function init() {
    document.addEventListener('keydown', handleKeyboardNav);
    initAnchorNav();
    initSectionObserver();
    initHeaderVisibility();
    scrollToHashOnLoad();
    initCarousels();
    initLangSelectors();
    initAboutTabs();
    initContactForm();
    initSlideModal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
