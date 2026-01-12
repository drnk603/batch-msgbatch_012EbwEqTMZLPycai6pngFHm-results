(function() {
  'use strict';

  if (typeof window.__app === 'undefined') {
    window.__app = {};
  }

  var app = window.__app;

  function debounce(func, wait) {
    var timeout;
    return function() {
      var context = this;
      var args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function() {
        func.apply(context, args);
      }, wait);
    };
  }

  function throttle(func, limit) {
    var inThrottle;
    return function() {
      var context = this;
      var args = arguments;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(function() {
          inThrottle = false;
        }, limit);
      }
    };
  }

  function initBurgerMenu() {
    if (app.burgerInitialized) return;
    app.burgerInitialized = true;

    var toggle = document.querySelector('.navbar-toggler');
    var collapse = document.querySelector('.navbar-collapse');
    var navLinks = document.querySelectorAll('.nav-link');

    if (!toggle || !collapse) return;

    function closeMenu() {
      collapse.classList.remove('is-open');
      toggle.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('u-no-scroll');
    }

    function openMenu() {
      collapse.classList.add('is-open');
      toggle.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('u-no-scroll');
    }

    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      if (collapse.classList.contains('is-open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    document.addEventListener('keydown', function(e) {
      if ((e.key === 'Escape' || e.keyCode === 27) && collapse.classList.contains('is-open')) {
        closeMenu();
        toggle.focus();
      }
    });

    document.addEventListener('click', function(e) {
      if (collapse.classList.contains('is-open') && !collapse.contains(e.target) && !toggle.contains(e.target)) {
        closeMenu();
      }
    });

    for (var i = 0; i < navLinks.length; i++) {
      navLinks[i].addEventListener('click', function() {
        if (window.innerWidth < 1024) {
          closeMenu();
        }
      });
    }

    var resizeHandler = debounce(function() {
      if (window.innerWidth >= 1024 && collapse.classList.contains('is-open')) {
        closeMenu();
      }
    }, 100);

    window.addEventListener('resize', resizeHandler, { passive: true });
  }

  function initSmoothScroll() {
    if (app.smoothScrollInitialized) return;
    app.smoothScrollInitialized = true;

    var isHomepage = window.location.pathname === '/' || 
                     window.location.pathname === '/index.html' || 
                     window.location.pathname.endsWith('/index.html');

    document.addEventListener('click', function(e) {
      var target = e.target;
      while (target && target.tagName !== 'A') {
        target = target.parentElement;
      }

      if (!target || !target.getAttribute('href')) return;

      var href = target.getAttribute('href');
      if (!href.startsWith('#') || href === '#' || href === '#!') return;

      var sectionId = href.substring(1);
      var section = document.getElementById(sectionId);

      if (section && isHomepage) {
        e.preventDefault();
        var header = document.querySelector('.l-header');
        var offset = header ? header.offsetHeight : 72;
        var elementPosition = section.getBoundingClientRect().top + window.pageYOffset;
        var offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      } else if (!isHomepage && href.startsWith('#')) {
        window.location.href = '/' + href;
      }
    });
  }

  function initScrollSpy() {
    if (app.scrollSpyInitialized) return;
    app.scrollSpyInitialized = true;

    var sections = document.querySelectorAll('[id]');
    var navLinks = document.querySelectorAll('.nav-link[href^="#"]');

    if (sections.length === 0 || navLinks.length === 0) return;

    var observerOptions = {
      root: null,
      rootMargin: '-80px 0px -80% 0px',
      threshold: 0
    };

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var id = entry.target.getAttribute('id');
          for (var i = 0; i < navLinks.length; i++) {
            var link = navLinks[i];
            var href = link.getAttribute('href');
            if (href === '#' + id) {
              link.setAttribute('aria-current', 'page');
              link.classList.add('active');
            } else {
              link.removeAttribute('aria-current');
              link.classList.remove('active');
            }
          }
        }
      });
    }, observerOptions);

    for (var i = 0; i < sections.length; i++) {
      observer.observe(sections[i]);
    }
  }

  function initActiveMenu() {
    if (app.activeMenuInitialized) return;
    app.activeMenuInitialized = true;

    var currentPath = window.location.pathname;
    var navLinks = document.querySelectorAll('.nav-link');

    for (var i = 0; i < navLinks.length; i++) {
      var link = navLinks[i];
      var linkPath = link.getAttribute('href');

      if (linkPath && !linkPath.startsWith('#')) {
        if (linkPath === currentPath || 
            (currentPath === '/' && linkPath === '/index.html') ||
            (currentPath === '/index.html' && linkPath === '/')) {
          link.setAttribute('aria-current', 'page');
          link.classList.add('active');
        } else {
          link.removeAttribute('aria-current');
          link.classList.remove('active');
        }
      }
    }
  }

  function initHeaderScroll() {
    if (app.headerScrollInitialized) return;
    app.headerScrollInitialized = true;

    var header = document.querySelector('.l-header');
    if (!header) return;

    var scrollHandler = throttle(function() {
      if (window.pageYOffset > 50) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    }, 100);

    window.addEventListener('scroll', scrollHandler, { passive: true });
  }

  function initImages() {
    if (app.imagesInitialized) return;
    app.imagesInitialized = true;

    var images = document.querySelectorAll('img');

    for (var i = 0; i < images.length; i++) {
      var img = images[i];

      if (!img.classList.contains('img-fluid')) {
        img.classList.add('img-fluid');
      }

      var isLogo = img.classList.contains('c-logo__img');
      var isCritical = img.hasAttribute('data-critical');

      if (!img.hasAttribute('loading') && !isLogo && !isCritical) {
        img.setAttribute('loading', 'lazy');
      }

      img.addEventListener('error', function(e) {
        var failedImg = e.target;
        var svgPlaceholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23eee" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-family="sans-serif" font-size="18"%3EImage unavailable%3C/text%3E%3C/svg%3E';
        failedImg.src = svgPlaceholder;
      });
    }
  }

  function initForms() {
    if (app.formsInitialized) return;
    app.formsInitialized = true;

    var forms = document.querySelectorAll('.c-form, .needs-validation');

    app.notify = function(message, type) {
      var container = document.getElementById('toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; max-width: 350px;';
        document.body.appendChild(container);
      }

      var toast = document.createElement('div');
      toast.className = 'alert alert-' + (type || 'info') + ' alert-dismissible fade show';
      toast.setAttribute('role', 'alert');
      toast.innerHTML = message + '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>';

      container.appendChild(toast);

      setTimeout(function() {
        toast.classList.remove('show');
        setTimeout(function() {
          if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
          }
        }, 300);
      }, 5000);
    };

    function validateEmail(email) {
      var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    }

    function validatePhone(phone) {
      var re = /^[\d\s\+\-\(\)]{10,20}$/;
      return re.test(phone);
    }

    function validateName(name) {
      var re = /^[a-zA-ZÀ-ÿ\s\-']{2,50}$/;
      return re.test(name);
    }

    function validateMessage(message) {
      return message && message.length >= 10;
    }

    function showError(field, message) {
      var parent = field.closest('.c-form__group') || field.parentElement;
      parent.classList.add('has-error');
      
      var errorElement = parent.querySelector('.c-form__error, .invalid-feedback');
      if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'c-form__error invalid-feedback';
        field.parentNode.insertBefore(errorElement, field.nextSibling);
      }
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }

    function clearError(field) {
      var parent = field.closest('.c-form__group') || field.parentElement;
      parent.classList.remove('has-error');
      
      var errorElement = parent.querySelector('.c-form__error, .invalid-feedback');
      if (errorElement) {
        errorElement.style.display = 'none';
      }
    }

    function validateField(field) {
      var value = field.value.trim();
      var fieldType = field.type;
      var fieldId = field.id || field.name;
      var isValid = true;

      clearError(field);

      if (field.hasAttribute('required') && !value) {
        showError(field, 'Dieses Feld ist erforderlich');
        return false;
      }

      if (value) {
        if (fieldType === 'email' || fieldId.includes('email')) {
          if (!validateEmail(value)) {
            showError(field, 'Bitte geben Sie eine gültige E-Mail-Adresse ein');
            isValid = false;
          }
        }

        if (fieldType === 'tel' || fieldId.includes('phone')) {
          if (!validatePhone(value)) {
            showError(field, 'Bitte geben Sie eine gültige Telefonnummer ein');
            isValid = false;
          }
        }

        if (fieldId.includes('name') || fieldId.includes('Name')) {
          if (!validateName(value)) {
            showError(field, 'Bitte geben Sie einen gültigen Namen ein');
            isValid = false;
          }
        }

        if (field.tagName === 'TEXTAREA' || fieldId.includes('message')) {
          if (!validateMessage(value)) {
            showError(field, 'Die Nachricht muss mindestens 10 Zeichen enthalten');
            isValid = false;
          }
        }
      }

      if (field.type === 'checkbox' && field.hasAttribute('required')) {
        if (!field.checked) {
          showError(field, 'Bitte akzeptieren Sie die Bedingungen');
          isValid = false;
        }
      }

      return isValid;
    }

    for (var i = 0; i < forms.length; i++) {
      var form = forms[i];

      var inputs = form.querySelectorAll('input, textarea, select');
      for (var j = 0; j < inputs.length; j++) {
        inputs[j].addEventListener('blur', function() {
          validateField(this);
        });

        inputs[j].addEventListener('input', function() {
          if (this.classList.contains('has-error') || this.closest('.has-error')) {
            validateField(this);
          }
        });
      }

      form.addEventListener('submit', function(e) {
        e.preventDefault();
        e.stopPropagation();

        var currentForm = e.target;
        currentForm.classList.add('was-validated');

        var formFields = currentForm.querySelectorAll('input, textarea, select');
        var isFormValid = true;

        for (var k = 0; k < formFields.length; k++) {
          if (!validateField(formFields[k])) {
            isFormValid = false;
          }
        }

        if (!isFormValid) {
          app.notify('Bitte überprüfen Sie die markierten Felder', 'danger');
          return;
        }

        var submitBtn = currentForm.querySelector('button[type="submit"]');
        var originalText = submitBtn ? submitBtn.innerHTML : '';

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.classList.add('is-disabled');
          submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Wird gesendet...';
        }

        var formData = new FormData(currentForm);
        var data = {};
        for (var pair of formData.entries()) {
          data[pair[0]] = pair[1];
        }

        setTimeout(function() {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.classList.remove('is-disabled');
            submitBtn.innerHTML = originalText;
          }
          
          app.notify('Vielen Dank! Ihre Nachricht wurde erfolgreich gesendet.', 'success');
          
          setTimeout(function() {
            window.location.href = '/thank_you.html';
          }, 1500);
        }, 1000);
      });
    }
  }

  function initScrollToTop() {
    if (app.scrollToTopInitialized) return;
    app.scrollToTopInitialized = true;

    var scrollBtn = document.createElement('button');
    scrollBtn.className = 'c-scroll-to-top';
    scrollBtn.setAttribute('aria-label', 'Nach oben scrollen');
    scrollBtn.innerHTML = '↑';
    scrollBtn.style.cssText = 'position: fixed; bottom: 30px; right: 30px; width: 50px; height: 50px; border-radius: 50%; background-color: var(--color-primary); color: white; border: none; font-size: 24px; cursor: pointer; opacity: 0; visibility: hidden; transition: all 0.3s ease; z-index: 999; box-shadow: var(--shadow-lg);';

    document.body.appendChild(scrollBtn);

    var scrollHandler = throttle(function() {
      if (window.pageYOffset > 300) {
        scrollBtn.style.opacity = '1';
        scrollBtn.style.visibility = 'visible';
      } else {
        scrollBtn.style.opacity = '0';
        scrollBtn.style.visibility = 'hidden';
      }
    }, 200);

    window.addEventListener('scroll', scrollHandler, { passive: true });

    scrollBtn.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  function initCountUp() {
    if (app.countUpInitialized) return;
    app.countUpInitialized = true;

    var counters = document.querySelectorAll('[data-count]');
    if (counters.length === 0) return;

    function animateCount(element) {
      var target = parseInt(element.getAttribute('data-count'));
      var duration = parseInt(element.getAttribute('data-duration')) || 2000;
      var start = 0;
      var increment = target / (duration / 16);
      var current = start;

      var timer = setInterval(function() {
        current += increment;
        if (current >= target) {
          element.textContent = target;
          clearInterval(timer);
        } else {
          element.textContent = Math.floor(current);
        }
      }, 16);
    }

    var observerOptions = {
      root: null,
      threshold: 0.5
    };

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting && !entry.target.hasAttribute('data-counted')) {
          entry.target.setAttribute('data-counted', 'true');
          animateCount(entry.target);
        }
      });
    }, observerOptions);

    for (var i = 0; i < counters.length; i++) {
      observer.observe(counters[i]);
    }
  }

  function initLogoLink() {
    if (app.logoLinkInitialized) return;
    app.logoLinkInitialized = true;

    var logoLink = document.querySelector('.c-logo, .navbar-brand');
    if (logoLink && !logoLink.getAttribute('href')) {
      logoLink.setAttribute('href', '/');
    }
  }

  function initRippleEffect() {
    if (app.rippleInitialized) return;
    app.rippleInitialized = true;

    var buttons = document.querySelectorAll('.c-button, .btn');

    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', function(e) {
        var button = e.currentTarget;
        var ripple = document.createElement('span');
        var rect = button.getBoundingClientRect();
        var size = Math.max(rect.width, rect.height);
        var x = e.clientX - rect.left - size / 2;
        var y = e.clientY - rect.top - size / 2;

        ripple.style.cssText = 'position: absolute; border-radius: 50%; background: rgba(255,255,255,0.6); width: ' + size + 'px; height: ' + size + 'px; left: ' + x + 'px; top: ' + y + 'px; pointer-events: none; transform: scale(0); animation: ripple 0.6s ease-out;';

        var style = document.createElement('style');
        if (!document.getElementById('ripple-animation')) {
          style.id = 'ripple-animation';
          style.textContent = '@keyframes ripple { to { transform: scale(4); opacity: 0; } }';
          document.head.appendChild(style);
        }

        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);

        setTimeout(function() {
          ripple.remove();
        }, 600);
      });
    }
  }

  function initModalBackdrop() {
    if (app.backdropInitialized) return;
    app.backdropInitialized = true;

    var modalTriggers = document.querySelectorAll('[data-modal]');
    
    for (var i = 0; i < modalTriggers.length; i++) {
      modalTriggers[i].addEventListener('click', function(e) {
        e.preventDefault();
        var modalId = this.getAttribute('data-modal');
        var modal = document.getElementById(modalId);
        
        if (modal) {
          var backdrop = document.createElement('div');
          backdrop.className = 'modal-backdrop';
          backdrop.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; opacity: 0; transition: opacity 0.3s;';
          document.body.appendChild(backdrop);
          
          setTimeout(function() {
            backdrop.style.opacity = '1';
          }, 10);
          
          modal.classList.add('is-open');
          document.body.classList.add('u-no-scroll');
          
          backdrop.addEventListener('click', function() {
            modal.classList.remove('is-open');
            document.body.classList.remove('u-no-scroll');
            backdrop.style.opacity = '0';
            setTimeout(function() {
              backdrop.remove();
            }, 300);
          });
        }
      });
    }
  }

  app.init = function() {
    if (app.initialized) return;
    app.initialized = true;

    initBurgerMenu();
    initSmoothScroll();
    initScrollSpy();
    initActiveMenu();
    initHeaderScroll();
    initImages();
    initForms();
    initScrollToTop();
    initCountUp();
    initLogoLink();
    initRippleEffect();
    initModalBackdrop();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', app.init);
  } else {
    app.init();
  }

})();
