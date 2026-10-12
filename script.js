/**
 * PataFurniture - Interactive Script
 * Handles: loader, navbar, mobile menu, scroll animations,
 * counter, testimonial slider, portfolio filter, form, smooth scroll
 */

document.addEventListener('DOMContentLoaded', () => {
  // ===== PAGE LOADER =====
  const loader = document.getElementById('pageLoader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hidden');
      document.body.style.overflow = '';
    }, 1800);
  });
  // Prevent scrolling while loading
  document.body.style.overflow = 'hidden';

  // ===== NAVBAR SCROLL =====
  const navbar = document.getElementById('navbar');
  const scrollTop = document.getElementById('scrollTop');

  function handleScroll() {
    const scrollY = window.scrollY;

    // Navbar background
    if (scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Scroll to top button
    if (scrollY > 500) {
      scrollTop.classList.add('visible');
    } else {
      scrollTop.classList.remove('visible');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Scroll to top
  scrollTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ===== MOBILE MENU =====
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('open');
    document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
  });

  // Close mobile menu on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // ===== SMOOTH SCROLL =====
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const navHeight = navbar.offsetHeight;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
      }
    });
  });

  // ===== SCROLL REVEAL ANIMATIONS =====
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // ===== COUNTER ANIMATION =====
  const statNumbers = document.querySelectorAll('.hero-stat-number');
  let countersAnimated = false;

  function animateCounters() {
    if (countersAnimated) return;
    countersAnimated = true;

    statNumbers.forEach(stat => {
      const target = parseInt(stat.getAttribute('data-count'));
      const suffix = stat.textContent.replace(/[0-9]/g, '');
      const duration = 2000;
      const startTime = Date.now();

      function update() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(eased * target);

        stat.textContent = current.toLocaleString() + suffix;

        if (progress < 1) {
          requestAnimationFrame(update);
        }
      }

      requestAnimationFrame(update);
    });
  }

  const heroStatsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounters();
        heroStatsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) {
    heroStatsObserver.observe(heroStats);
  }

  // ===== TESTIMONIALS SLIDER =====
  const track = document.getElementById('testimonialTrack');
  const dots = document.querySelectorAll('.testimonial-dot');
  if (track && dots.length > 0) {
    let currentSlide = 0;
    let autoSlideInterval;

    function goToSlide(index) {
      currentSlide = index;
      track.style.transform = `translateX(-${index * 100}%)`;

      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
    }

    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        const slide = parseInt(dot.getAttribute('data-slide'));
        goToSlide(slide);
        resetAutoSlide();
      });
    });

    function autoSlide() {
      autoSlideInterval = setInterval(() => {
        const next = (currentSlide + 1) % dots.length;
        goToSlide(next);
      }, 5000);
    }

    function resetAutoSlide() {
      clearInterval(autoSlideInterval);
      autoSlide();
    }

    autoSlide();

    // Touch / swipe support for testimonials
    let touchStartX = 0;
    let touchEndX = 0;

    const slider = document.getElementById('testimonialSlider');
    if (slider) {
      slider.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      slider.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > 50) {
          if (diff > 0 && currentSlide < dots.length - 1) {
            goToSlide(currentSlide + 1);
          } else if (diff < 0 && currentSlide > 0) {
            goToSlide(currentSlide - 1);
          }
          resetAutoSlide();
        }
      }, { passive: true });
    }
  }

  // ===== PORTFOLIO DATA & DYNAMIC LOADING =====
  const defaultItems = [
    {
      id: 'd1',
      title: 'Modern Living Space',
      category: 'living',
      location: 'Nairobi',
      image: 'images/hero-living-room.jpg',
      price: 'KES 145,000',
      maker: 'Premium Local Artisan',
      materials: 'Cypress Wood, Premium Velvet Fabric',
      dimensions: '3.2m x 2.4m',
      description: 'A beautifully styled modern L-shaped living room sofa set featuring elegant warm earthy cushions. Sourced from local premium artisans, inspected by PataFurniture, and delivered directly to your residence with white-glove installation.',
      featured: true
    },
    {
      id: 'd2',
      title: 'Serene Master Bedroom',
      category: 'bedroom',
      location: 'Kilimani',
      image: 'images/portfolio-bedroom.jpg',
      price: 'KES 120,000',
      maker: 'Nairobi Carpentry Co.',
      materials: 'Mvule Hardwood, High-Density Foam',
      dimensions: '6ft x 6ft (King Size)',
      description: 'An elegant king-size bed crafted from durable local Mvule hardwood with warm neutral bedding. Includes two custom matching side tables with ambient lamps.',
      featured: false
    },
    {
      id: 'd3',
      title: 'Elegant Dining Room',
      category: 'dining',
      location: 'Lavington',
      image: 'images/portfolio-dining.jpg',
      price: 'KES 95,000',
      maker: 'Woodcrafts Kenya',
      materials: 'Mahogany, Tempered Glass Accent',
      dimensions: '1.8m x 0.9m (6-Seater)',
      description: 'Contemporary mahogany dining table with 6 hand-stitched chairs. Designed for comfort and elegant dining experiences in modern homes.',
      featured: false
    },
    {
      id: 'd4',
      title: 'Productive Home Office',
      category: 'office',
      location: 'Westlands',
      image: 'images/portfolio-office.jpg',
      price: 'KES 55,000',
      maker: 'DeskDesign Nairobi',
      materials: 'Teak Wood, Matte Black Steel Legs',
      dimensions: '1.5m x 0.7m',
      description: 'A minimalist teak writing desk paired with an ergonomic leather chair. Ideal for working from home in comfort and style.',
      featured: false
    },
    {
      id: 'd5',
      title: 'Modern Kitchen Design',
      category: 'living', // mapped to living to show in filters
      location: 'Karen',
      image: 'images/portfolio-kitchen.jpg',
      price: 'KES 280,000',
      maker: 'KitchenFit Kenya',
      materials: 'Cedar Wood, Quartz Countertops',
      dimensions: 'Custom Fit',
      description: 'Stunning contemporary kitchen cabinetry made of local cedar and topped with durable quartz surfaces. Custom measurement, fitting, and appliance installation included.',
      featured: false
    },
    {
      id: 'd6',
      title: 'Outdoor Patio Paradise',
      category: 'outdoor',
      location: 'Runda',
      image: 'images/portfolio-outdoor.jpg',
      price: 'KES 110,000',
      maker: 'Rattan & Weave East Africa',
      materials: 'All-Weather Synthetic Wicker, Teak',
      dimensions: '4-Piece Set',
      description: 'Premium outdoor wicker lounge set with plush moisture-resistant cushions and a low teak coffee table. Built to withstand all seasons.',
      featured: false
    }
  ];

  const portfolioGrid = document.getElementById('portfolioGrid');

  // ===== PORTFOLIO DETAILS MODAL INTERACTION =====
  const modal = document.getElementById('portfolioModal');
  const modalClose = document.getElementById('modalClose');
  const modalImg = document.getElementById('modalImg');
  const modalCategory = document.getElementById('modalCategory');
  const modalTitle = document.getElementById('modalTitle');
  const modalPrice = document.getElementById('modalPrice');
  const modalMaker = document.getElementById('modalMaker');
  const modalMaterials = document.getElementById('modalMaterials');
  const modalDimensions = document.getElementById('modalDimensions');
  const modalDescription = document.getElementById('modalDescription');
  const modalCta = document.getElementById('modalCta');

  function openModal(item) {
    if (!modal) return;
    modalImg.src = item.image;
    modalCategory.textContent = item.category.toUpperCase();
    modalTitle.textContent = item.title;
    modalPrice.textContent = item.price.startsWith('KES') ? item.price : `KES ${parseInt(item.price).toLocaleString()}`;
    modalMaker.textContent = item.maker || 'Local Maker Partner';
    modalMaterials.textContent = item.materials || 'Inspected Premium Wood';
    modalDimensions.textContent = item.dimensions || 'Standard';
    modalDescription.textContent = item.description;

    const msg = encodeURIComponent(
      `Hi PataFurniture! I'm interested in the "${item.title}" listed for ${item.price}. I'd like to negotiate, arrange transport, and fitting services.`
    );
    modalCta.href = `https://wa.me/254708083361?text=${msg}`;

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  if (modalClose) {
    modalClose.addEventListener('click', () => {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  function loadPortfolio() {
    if (!portfolioGrid) return;

    let customItems = [];
    try {
      customItems = JSON.parse(localStorage.getItem('pata_furniture_items')) || [];
    } catch (e) {
      customItems = [];
    }

    // Only display custom listings that have been approved ('active' status)
    const activeCustomItems = customItems.filter(item => item.status === 'active');
    const allItems = [...activeCustomItems, ...defaultItems];
    portfolioGrid.innerHTML = '';

    allItems.forEach((item, index) => {
      const itemEl = document.createElement('div');
      itemEl.className = `portfolio-item ${item.featured ? 'featured' : ''} reveal`;
      itemEl.setAttribute('data-category', item.category);
      itemEl.setAttribute('data-id', item.id);
      itemEl.style.transitionDelay = `${(index % 3) * 0.1}s`;

      itemEl.innerHTML = `
        <img src="${item.image}" alt="${item.title}" loading="lazy">
        <div class="portfolio-overlay">
          <h3>${item.title}</h3>
          <span>${item.location} • ${item.category.charAt(0).toUpperCase() + item.category.slice(1)}</span>
        </div>
      `;

      itemEl.addEventListener('click', () => openModal(item));
      portfolioGrid.appendChild(itemEl);

      // Trigger reveal observer for dynamic elements
      if (typeof revealObserver !== 'undefined' && revealObserver) {
        revealObserver.observe(itemEl);
      } else {
        // Fallback if observer is defined below or locally
        itemEl.classList.add('visible');
      }
    });

    initTilt();
  }

  // Load the portfolio on page load
  loadPortfolio();

  // ===== PORTFOLIO FILTER =====
  const filterBtns = document.querySelectorAll('.portfolio-filter');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      const items = document.querySelectorAll('.portfolio-item');

      items.forEach(item => {
        const category = item.getAttribute('data-category');

        if (filter === 'all' || category === filter) {
          item.style.opacity = '1';
          item.style.transform = 'scale(1)';
          item.style.display = '';
          item.style.pointerEvents = 'auto';
        } else {
          item.style.opacity = '0';
          item.style.transform = 'scale(0.9)';
          item.style.pointerEvents = 'none';

          setTimeout(() => {
            if (btn.classList.contains('active') && btn.getAttribute('data-filter') === filter) {
              item.style.display = 'none';
            }
          }, 300);
        }
      });
    });
  });

  // ===== CONTACT FORM =====
  const contactForm = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = 'Sending... ✈️';
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.7';

      const firstName = document.getElementById('firstName').value.trim();
      const lastName = document.getElementById('lastName').value.trim();
      const email = document.getElementById('email').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const service = document.getElementById('service').value;
      const message = document.getElementById('message').value.trim();

      setTimeout(() => {
        // Save to localStorage contact submissions
        let submissions = [];
        try {
          submissions = JSON.parse(localStorage.getItem('pata_contact_submissions')) || [];
        } catch (err) {
          submissions = [];
        }
        
        submissions.unshift({
          id: 'sub-' + Date.now(),
          firstName,
          lastName,
          email,
          phone,
          service,
          message,
          date: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
        });
        
        localStorage.setItem('pata_contact_submissions', JSON.stringify(submissions));

        const whatsappMsg = encodeURIComponent(
          `🏠 *New Enquiry from PataFurniture Website*\n\n` +
          `*Name:* ${firstName} ${lastName}\n` +
          `*Email:* ${email}\n` +
          `*Phone:* ${phone}\n` +
          `*Service:* ${service}\n` +
          `*Message:* ${message}`
        );

        submitBtn.innerHTML = '✅ Message Sent!';
        submitBtn.style.background = 'linear-gradient(135deg, #6B9B6B, #4a8a4a)';

        window.open(`https://wa.me/254708083361?text=${whatsappMsg}`, '_blank');

        setTimeout(() => {
          contactForm.reset();
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
          submitBtn.style.opacity = '1';
          submitBtn.style.background = '';
        }, 3000);
      }, 1500);
    });
  }

  // ===== PARALLAX ON HERO (subtle) =====
  const heroBg = document.querySelector('.hero-bg img');
  if (heroBg && window.innerWidth > 768) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      if (scrollY < window.innerHeight) {
        heroBg.style.transform = `scale(1.1) translateY(${scrollY * 0.3}px)`;
      }
    }, { passive: true });
  }

  // ===== ACTIVE NAV LINK HIGHLIGHTING =====
  const sections = document.querySelectorAll('section[id]');
  const navLinksAll = document.querySelectorAll('.nav-links a:not(.nav-cta)');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinksAll.forEach(link => {
          link.style.color = '';
          if (link.getAttribute('href') === `#${id}`) {
            link.style.color = 'var(--color-accent)';
          }
        });
      }
    });
  }, {
    threshold: 0.3,
    rootMargin: `-${navbar.offsetHeight}px 0px 0px 0px`
  });

  sections.forEach(section => sectionObserver.observe(section));

  // ===== PORTFOLIO ITEM TILT EFFECT =====
  function initTilt() {
    if (window.innerWidth > 768) {
      const items = document.querySelectorAll('.portfolio-item');
      items.forEach(item => {
        item.addEventListener('mousemove', (e) => {
          const rect = item.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const rotateX = (y - centerY) / 20;
          const rotateY = (centerX - x) / 20;

          item.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });

        item.addEventListener('mouseleave', () => {
          item.style.transform = '';
        });
      });
    }
  }
});
