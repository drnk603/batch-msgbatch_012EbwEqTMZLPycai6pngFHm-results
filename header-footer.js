(function () {
  var header = document.querySelector('.dr-header');
  if (!header) return;

  var container = header.querySelector('.dr-header-inner');
  var toggle = header.querySelector('.dr-nav-toggle');
  var panel = header.querySelector('.dr-nav-panel');

  if (!toggle || !panel || !container) return;

  var isOpen = false;

  function setState(open) {
    isOpen = open;
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    panel.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (open) {
      container.classList.add('dr-is-open');
    } else {
      container.classList.remove('dr-is-open');
    }
  }

  toggle.addEventListener('click', function () {
    setState(!isOpen);
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 768 && isOpen) {
      setState(false);
    }
  });
})();
