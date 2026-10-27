(function () {
  'use strict';
  const form = document.getElementById('preorder-submit-form');
  if (!form) return;
  const notice = document.getElementById('preorder-status');
  const submit = form.querySelector('button[type="submit"]');
  const url = String(window.VIBE_PREORDER_WEBAPP_URL || '').trim();
  let connected = false;
  try {
    const parsed = new URL(url);
    connected = parsed.protocol === 'https:' && parsed.hostname === 'script.google.com' &&
      parsed.pathname.startsWith('/macros/s/') && parsed.pathname.endsWith('/exec');
  } catch (_) { connected = false; }
  if (connected) {
    form.action = url;
  } else {
    submit.disabled = true;
    submit.setAttribute('aria-disabled', 'true');
    notice.textContent = '사전예약 접수 연결 준비 중입니다.';
    notice.classList.add('preorder__notice--pending');
  }
  form.addEventListener('submit', event => {
    if (!connected) {
      event.preventDefault();
      notice.textContent = '사전예약 접수 연결 준비 중입니다.';
      return;
    }
    const origin = form.querySelector('[name="origin"]');
    if (origin) origin.value = location.origin + location.pathname;
    // Apps Script replies on a new tab with actual saved/failed status.
    // Do not claim success based on an opaque cross-origin request.
    notice.textContent = '새 창에서 접수 결과를 확인해 주세요.';
  });
})();
