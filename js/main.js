/**
 * ESPINOSA Estúdio de Design
 * JavaScript - Interatividade Essencial
 */

document.addEventListener('DOMContentLoaded', () => {
  // ============================================
  // Header - Transição baseada na seção visível
  // ============================================
  const header = document.getElementById('main-header');
  const heroSection = document.getElementById('inicio');
  const navItems = header.querySelectorAll('.nav__item');
  const sections = document.querySelectorAll('.section');
  
  let currentSection = 'inicio';
  
  // IntersectionObserver para detectar seção visível
  const pageContainer = document.querySelector('.page');
  
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
        const sectionId = entry.target.id;
        currentSection = sectionId;
        
        // Atualiza estado do header
        if (sectionId === 'inicio') {
          header.classList.remove('header--scrolled');
        } else {
          header.classList.add('header--scrolled');
        }
        
        // Atualiza menu ativo
        navItems.forEach(item => item.classList.remove('nav__item--active'));
        const activeItem = header.querySelector(`a[href="#${sectionId}"]`);
        if (activeItem && sectionId !== 'inicio') {
          activeItem.classList.add('nav__item--active');
        }
      }
    });
  }, {
    root: pageContainer,
    threshold: 0.5,
    rootMargin: '0px'
  });
  
  sections.forEach(section => sectionObserver.observe(section));

  // ============================================
  // Mobile Menu Toggle
  // ============================================
  const mobileToggle = document.querySelector('.header__mobile-toggle');
  const nav = document.querySelector('.nav');
  
  if (mobileToggle && nav) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileToggle.classList.toggle('active');
      nav.classList.toggle('nav--mobile-open', isOpen);
      mobileToggle.setAttribute('aria-expanded', isOpen);
      
      // Prevent body scroll when menu is open
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    
    // Close menu when clicking on a nav item
    nav.querySelectorAll('.nav__item').forEach(item => {
      item.addEventListener('click', () => {
        mobileToggle.classList.remove('active');
        nav.classList.remove('nav--mobile-open');
        mobileToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  // ============================================
  // Smooth Scroll para Seções Completas
  // ============================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = anchor.getAttribute('href');
      const target = document.querySelector(targetId);
      
      if (target && pageContainer) {
        pageContainer.scrollTo({
          top: target.offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });

  // ============================================
  // Galeria Horizontal - Drag Scroll
  // ============================================
  const galleries = document.querySelectorAll('.services__gallery, .products__gallery');

  galleries.forEach(gallery => {
    let isDown = false;
    let startX;
    let scrollLeft;

    gallery.addEventListener('mousedown', (e) => {
      isDown = true;
      gallery.style.cursor = 'grabbing';
      startX = e.pageX - gallery.offsetLeft;
      scrollLeft = gallery.scrollLeft;
    });

    gallery.addEventListener('mouseleave', () => {
      isDown = false;
      gallery.style.cursor = 'grab';
    });

    gallery.addEventListener('mouseup', () => {
      isDown = false;
      gallery.style.cursor = 'grab';
    });

    gallery.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - gallery.offsetLeft;
      const walk = (x - startX) * 2;
      gallery.scrollLeft = scrollLeft - walk;
    });

    gallery.style.cursor = 'grab';
  });

  // ============================================
  // Galeria - Setas de Navegação
  // ============================================
  const galleryContainers = document.querySelectorAll('.gallery-container');
  
  galleryContainers.forEach(container => {
    const gallery = container.querySelector('.services__gallery, .products__gallery');
    const leftArrow = container.querySelector('.gallery-arrow--left');
    const rightArrow = container.querySelector('.gallery-arrow--right');
    
    if (!gallery || !leftArrow || !rightArrow) return;
    
    const scrollAmount = 640; // Largura do card (600) + gap (40)
    
    // Função para atualizar estado das setas
    const updateArrows = () => {
      leftArrow.disabled = gallery.scrollLeft <= 0;
      rightArrow.disabled = gallery.scrollLeft >= gallery.scrollWidth - gallery.clientWidth - 10;
    };
    
    // Scroll para esquerda
    leftArrow.addEventListener('click', () => {
      gallery.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });
    
    // Scroll para direita
    rightArrow.addEventListener('click', () => {
      gallery.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });
    
    // Atualiza estado das setas ao fazer scroll
    gallery.addEventListener('scroll', updateArrows);
    
    // Estado inicial
    updateArrows();
  });

  // ============================================
  // About Section Tabs
  // ============================================
  const aboutTabs = document.querySelectorAll('.about__tab');
  const aboutFrames = document.querySelectorAll('.about__frames[data-img]');
  const aboutTexts = document.querySelectorAll('.about__text[data-text]');

  aboutTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      
      // Remove active state from all tabs, frames, and texts
      aboutTabs.forEach(t => t.classList.remove('about__tab--active'));
      aboutFrames.forEach(f => f.classList.remove('about__frames--active'));
      aboutTexts.forEach(t => t.classList.remove('about__text--active'));
      
      // Add active state to clicked tab
      tab.classList.add('about__tab--active');
      
      // Show corresponding frame and text
      document.querySelector(`[data-img="${target}"]`)?.classList.add('about__frames--active');
      document.querySelector(`[data-text="${target}"]`)?.classList.add('about__text--active');
    });
  });

  // ============================================
  // Formulário de Contato
  // ============================================
  const contactForm = document.getElementById('contact-form');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData);
      
      console.log('Formulário enviado:', data);
      
      const submitBtn = contactForm.querySelector('.contact__submit');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'ENVIADO!';
      submitBtn.disabled = true;
      
      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        contactForm.reset();
      }, 2000);
    });
  }

  // ============================================
  // Animação fade-in ao scroll
  // ============================================
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.services__card, .products__item, .about__text').forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
  });
});
