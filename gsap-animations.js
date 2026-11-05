/**
 * gsap-animations.js — GSAP + ScrollTrigger Animation System
 * Replaces reveal.js with rich 3D scroll-driven animations.
 * Scroll progress bar, header text splits, staggered card fly-ins, hero parallax.
 */
(function () {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function waitForGSAP(cb) {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') cb();
    else showAllContent();
  }

  // Never hide content that has already entered the viewport.
  function entrance(targets, options) {
    var list = targets && targets.nodeType ? [targets] : Array.from(targets || []);
    var pending = list.filter(function (el) {
      var rect = el.getBoundingClientRect();
      return rect.top >= window.innerHeight;
    });
    if (!pending.length) return;
    options.immediateRender = false;
    gsap.from(pending, options);
  }

  // Failsafe: ensure all content is visible even if GSAP fails to load
  function showAllContent() {
    var reveals = document.querySelectorAll('.reveal');
    reveals.forEach(function (el) {
      el.classList.add('is-visible');
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }

  waitForGSAP(function () {
    gsap.registerPlugin(ScrollTrigger);
    if (typeof ScrollTrigger.config === 'function') {
      ScrollTrigger.config({ ignoreMobileResize: true });
    }

    // Immediately make all .reveal elements visible (GSAP handles animation now)
    var reveals = document.querySelectorAll('.reveal');
    reveals.forEach(function (el) {
      el.classList.add('is-visible');
      el.style.opacity = '';
      el.style.transform = '';
      el.style.transitionDelay = '';
    });

    initAnimations();
  });

  function initAnimations() {

    // =========================================
    // 1. Scroll Progress Bar
    // =========================================
    var progressBar = document.querySelector('.scroll-progress');
    if (progressBar) {
      gsap.to(progressBar, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.3
        }
      });
    }

    // =========================================
    // 2. Header / Page Head Text Reveals
    // =========================================
    var isMobile = window.innerWidth < 768;
    var headings = document.querySelectorAll(
      '.page-head h1, .article-header h1, .app-hero-text h1, .hero-tagline'
    );

    headings.forEach(function (heading) {
      if (heading.getBoundingClientRect().top < window.innerHeight) return;
      // On mobile or if SVG present, animate cleanly without splitting text
      if (isMobile || heading.querySelector('svg')) {
        entrance(heading, {
          y: 20,
          opacity: 0,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: heading,
            start: 'top 94%',
            toggleActions: 'play none none none'
          }
        });
        return;
      }

      var text = heading.innerHTML;
      var words = text.split(/\s+/);
      heading.innerHTML = words.map(function (word) {
        return '<span class="gsap-word" style="display:inline-block;overflow:hidden;"><span class="gsap-word-inner" style="display:inline-block;">' + word + '</span></span>';
      }).join(' ');

      var wordInners = heading.querySelectorAll('.gsap-word-inner');
      entrance(wordInners, {
        y: '100%',
        rotateX: -40,
        opacity: 0,
        duration: 0.75,
        ease: 'power3.out',
        stagger: 0.05,
        scrollTrigger: {
          trigger: heading,
          start: 'top 92%',
          toggleActions: 'play none none none'
        }
      });
    });

    // =========================================
    // 2b. Contact page heading (special case — no ScrollTrigger, immediate)
    // =========================================
    var contactHeading = document.querySelector('.contact-body h1, .contact-card h1');
    if (contactHeading && !contactHeading.querySelector('.gsap-word')) {
      entrance(contactHeading, {
        y: 25,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
        delay: 0.3
      });
    }

    // =========================================
    // 3. Eyebrow / Section Head Reveals
    // =========================================
    var eyebrows = document.querySelectorAll('.eyebrow, .section-head');
    eyebrows.forEach(function (el) {
      entrance(el, {
        x: -20,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 93%',
          toggleActions: 'play none none none'
        }
      });
    });

    // =========================================
    // 4. Article Cards — Staggered Fly-In
    // =========================================
    var cardGrids = document.querySelectorAll('.article-grid, .feature-grid, .feature-row');
    cardGrids.forEach(function (grid) {
      var cards = grid.querySelectorAll(
        '.article-card, .feature-card, .blog-card, .data-card, .req-card'
      );
      if (!cards.length) return;

      entrance(cards, {
        y: 40,
        opacity: 0,
        duration: 0.65,
        ease: 'power2.out',
        stagger: {
          amount: 0.4,
          from: 'start'
        },
        scrollTrigger: {
          trigger: grid,
          start: 'top 88%',
          toggleActions: 'play none none none'
        }
      });
    });

    // =========================================
    // 5. Featured Card & Side Items (Hero)
    // =========================================
    var featuredCard = document.querySelector('.featured-card');
    if (featuredCard) {
      entrance(featuredCard, {
        y: 50,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        delay: 0.2
      });
    }

    var sideItems = document.querySelectorAll('.side-item');
    if (sideItems.length) {
      entrance(sideItems, {
        x: 30,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.12,
        delay: 0.4
      });
    }

    // =========================================
    // 6. Card Icons — Scale In
    // =========================================
    var cardIcons = document.querySelectorAll('.card-icon, .feature-icon-box, .stat-icon');
    cardIcons.forEach(function (icon) {
      entrance(icon, {
        scale: 0,
        rotation: -10,
        opacity: 0,
        duration: 0.5,
        ease: 'back.out(1.5)',
        scrollTrigger: {
          trigger: icon,
          start: 'top 93%',
          toggleActions: 'play none none none'
        }
      });
    });

    // =========================================
    // 7. Product Cards
    // =========================================
    var productCards = document.querySelectorAll('.product-card');
    productCards.forEach(function (card, i) {
      entrance(card, {
        y: 35,
        opacity: 0,
        duration: 0.7,
        ease: 'power2.out',
        delay: i * 0.1,
        scrollTrigger: {
          trigger: card,
          start: 'top 90%',
          toggleActions: 'play none none none'
        }
      });
    });

    // =========================================
    // 8. Stat Cards — Count Up Animation
    // =========================================
    var statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(function (num) {
      if (num.getBoundingClientRect().top < window.innerHeight) return;
      var text = num.textContent.trim();
      var match = text.match(/^(\d+)/);
      if (!match) return;

      var target = parseInt(match[1]);
      var suffix = text.replace(match[1], '');
      var obj = { val: 0 };

      gsap.to(obj, {
        val: target,
        duration: 1.5,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: num,
          start: 'top 90%',
          toggleActions: 'play none none none'
        },
        onUpdate: function () {
          num.textContent = Math.round(obj.val) + suffix;
        }
      });
    });

    // =========================================
    // 9. Article Body Paragraphs & Headings
    // =========================================
    var articleBody = document.querySelector('.article-body');
    if (articleBody) {
      var bodyElements = articleBody.querySelectorAll('p, h2');
      bodyElements.forEach(function (el) {
        entrance(el, {
          y: 20,
          opacity: 0,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 93%',
            toggleActions: 'play none none none'
          }
        });
      });
    }

    // =========================================
    // 10. Hero Parallax
    // =========================================
    var heroOverlay = document.querySelector('.hero-overlay');
    if (heroOverlay) {
      gsap.to(heroOverlay, {
        y: 50,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero-canvas-wrap',
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      });
    }

    // =========================================
    // 11. Footer Reveal
    // =========================================
    var footer = document.querySelector('.site-footer');
    if (footer) {
      var footerCols = footer.querySelectorAll('.footer-brand, .footer-col, .footer-bottom');
      entrance(footerCols, {
        y: 20,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        stagger: 0.08,
        scrollTrigger: {
          trigger: footer,
          start: 'top 95%',
          toggleActions: 'play none none none'
        }
      });
    }

    // =========================================
    // 12. Contact Card — immediate entrance (no scroll trigger)
    // =========================================
    var contactCard = document.querySelector('.contact-card');
    if (contactCard) {
      entrance(contactCard, {
        y: 40,
        scale: 0.97,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.15
      });

      // Also animate contact methods inside
      var contactMethods = contactCard.querySelectorAll('.email-box, .social-link');
      if (contactMethods.length) {
        entrance(contactMethods, {
          y: 15,
          opacity: 0,
          duration: 0.5,
          ease: 'power2.out',
          stagger: 0.08,
          delay: 0.6
        });
      }
    }

    // =========================================
    // 13. About Mission Box
    // =========================================
    var aboutMission = document.querySelector('.about-mission');
    if (aboutMission) {
      entrance(aboutMission, {
        y: 30,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: aboutMission,
          start: 'top 90%',
          toggleActions: 'play none none none'
        }
      });
    }

    // =========================================
    // 14. CTA Banner
    // =========================================
    var ctaBanner = document.querySelector('.cta-banner');
    if (ctaBanner) {
      entrance(ctaBanner, {
        y: 30,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: ctaBanner,
          start: 'top 90%',
          toggleActions: 'play none none none'
        }
      });
    }

    // =========================================
    // 15. Gradient Dividers
    // =========================================
    var dividers = document.querySelectorAll('.gradient-divider');
    dividers.forEach(function (div) {
      entrance(div, {
        scaleX: 0,
        duration: 1,
        ease: 'power2.inOut',
        scrollTrigger: {
          trigger: div,
          start: 'top 96%',
          toggleActions: 'play none none none'
        }
      });
    });

    // =========================================
    // 16. Nav Entrance
    // =========================================
    var navLinks = document.querySelectorAll('.nav-links a');
    if (navLinks.length) {
      entrance(navLinks, {
        y: -15,
        opacity: 0,
        duration: 0.4,
        ease: 'power2.out',
        stagger: 0.05,
        delay: 0.15
      });
    }

    var wordmark = document.querySelector('.site-header .wordmark');
    if (wordmark) {
      entrance(wordmark, {
        x: -20,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out',
        delay: 0.1
      });
    }

    // =========================================
    // 17. Like Button
    // =========================================
    var likeBtn = document.querySelector('.like-btn');
    if (likeBtn) {
      entrance(likeBtn, {
        scale: 0.85,
        opacity: 0,
        duration: 0.4,
        ease: 'back.out(1.5)',
        scrollTrigger: {
          trigger: likeBtn,
          start: 'top 95%',
          toggleActions: 'play none none none'
        }
      });
    }

    // =========================================
    // 18. About body paragraphs
    // =========================================
    var aboutBody = document.querySelector('.about-body');
    if (aboutBody) {
      var aboutPs = aboutBody.querySelectorAll('p');
      entrance(aboutPs, {
        y: 20,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        stagger: 0.1,
        scrollTrigger: {
          trigger: aboutBody,
          start: 'top 90%',
          toggleActions: 'play none none none'
        }
      });
    }

    // =========================================
    // 19. Legal page content
    // =========================================
    var legal = document.querySelector('.legal');
    if (legal) {
      entrance(legal, {
        y: 20,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        delay: 0.2
      });
    }
  }
})();
