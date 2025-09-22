(function () {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));

  // Mobile nav toggle
  const nav = $('.nav');
  const navToggle = $('.nav-toggle');
  if (nav && navToggle) {
    navToggle.addEventListener('click', () => {
      const expanded = nav.getAttribute('aria-expanded') === 'true';
      nav.setAttribute('aria-expanded', String(!expanded));
      navToggle.setAttribute('aria-expanded', String(!expanded));
    });
    // Close on link click (mobile)
    $$('.nav-list a').forEach((a) => a.addEventListener('click', () => {
      nav.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-expanded', 'false');
    }));
  }

  // Tabs (cards/map)
  const tabs = $$('.tab');
  tabs.forEach((tab) => tab.addEventListener('click', () => {
    tabs.forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    const name = tab.getAttribute('data-tab');
    $$('.tab-panel').forEach((p) => p.classList.toggle('active', p.getAttribute('data-panel') === name));
  }));

  // Modals
  const openButtons = $$('[data-open]');
  const modals = $$('.modal');
  const openModal = (id) => {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'false');
    const focusable = modal.querySelector('input, button');
    if (focusable) focusable.focus();
  };
  const closeModal = (modal) => modal.setAttribute('aria-hidden', 'true');

  openButtons.forEach((btn) => btn.addEventListener('click', (e) => {
    const id = btn.getAttribute('data-open');
    if (!id) return;
    e.preventDefault();
    openModal(id);
  }));

  modals.forEach((m) => {
    m.addEventListener('click', (e) => {
      if (e.target.hasAttribute('data-close')) closeModal(m);
    });
    const closeBtn = $('[data-close]', m);
    if (closeBtn) closeBtn.addEventListener('click', () => closeModal(m));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal(m);
    });
  });

  // Forms
  function initForm(selector) {
    const form = $(selector);
    if (!form) return;
    const success = $('.form-success', form);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      const phoneOk = /[0-9()+\-\s]{6,}/.test(String(data.phone || ''));
      const nameOk = String(data.name || '').trim().length >= 2 || data.name === undefined;
      const consentOk = data.consent !== undefined || $('[name="consent"]', form) === null;
      if (!phoneOk || !nameOk || !consentOk) {
        showToast('Проверьте корректность полей');
        return;
      }
      // Emulate async submit
      form.querySelectorAll('input, button').forEach((el) => el.disabled = true);
      setTimeout(() => {
        form.reset();
        form.querySelectorAll('input, button').forEach((el) => el.disabled = false);
        if (success) success.style.display = 'block';
        showToast('Заявка отправлена');
      }, 700);
    });
  }

  initForm('#inlineConsultForm');
  initForm('#consultForm');
  initForm('#callbackForm');
  initForm('#ctaForm');

  // Toasts
  function showToast(message) {
    const tpl = document.getElementById('toastTemplate');
    if (!tpl) return;
    const node = tpl.content.firstElementChild.cloneNode(true);
    node.textContent = message;
    document.body.appendChild(node);
    setTimeout(() => node.remove(), 2500);
  }
})();


