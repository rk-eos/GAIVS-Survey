/* ---------- CONFIG ----------
   Paste your deployed Google Apps Script Web App URL below.
   See README.md for deployment steps. */
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzS6wS-jegC4FtVNIkB5GQ663wplieTEDqJG--snt5ei7pDoVVK9ibghR-9zIO3qux5pg/exec";

// Toggle .selected class on pill options, and show/hide any followup
// (e.g. "Other, tell us more") tied to the group's currently selected value.
// Also toggles `required` on followups marked data-required-on-show, so
// e.g. "please elaborate" only becomes mandatory once it's actually shown.
document.querySelectorAll('.options').forEach(group => {
  group.addEventListener('change', () => {
    group.querySelectorAll('.option').forEach(opt => {
      const input = opt.querySelector('input');
      opt.classList.toggle('selected', input.checked);
    });

    const triggerInput = group.querySelector('[data-followup-trigger]');
    if (triggerInput) {
      const targetId = triggerInput.getAttribute('data-followup-trigger');
      const showOn = triggerInput.getAttribute('data-followup-value');
      const target = document.getElementById(targetId);
      const checkedInput = group.querySelector(`input[name="${triggerInput.name}"]:checked`);
      if (target) {
        const shouldShow = !!checkedInput && checkedInput.value === showOn;
        target.classList.toggle('show', shouldShow);
        if (target.hasAttribute('data-required-on-show')) {
          target.required = shouldShow;
        }
      }
    }
  });
});

function collectFormData(form) {
  const data = {};
  new FormData(form).forEach((value, key) => {
    if (data[key]) {
      data[key] = Array.isArray(data[key]) ? [...data[key], value] : [data[key], value];
    } else {
      data[key] = value;
    }
  });
  return data;
}

function initSurveyForm(formId, formType) {
  const form = document.getElementById(formId);
  const errorNote = form.querySelector('.error-note');
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    if (SCRIPT_URL.includes('PASTE_YOUR')) {
      errorNote.textContent = 'Survey backend not connected yet — see README.md to finish setup.';
      errorNote.classList.add('show');
      return;
    }

    errorNote.classList.remove('show');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting…';

    const payload = {
      formType: formType,
      submittedAt: new Date().toISOString(),
      answers: collectFormData(form)
    };

    try {
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // keeps this a "simple request", avoiding CORS preflight
        body: JSON.stringify(payload)
      });

      // Try to read the structured result (e.g. duplicate-email detection).
      // If reading fails for any reason, assume the submission went through —
      // the request itself already reached the server either way.
      let result = null;
      try {
        result = await response.json();
      } catch (parseErr) {
        result = { ok: true };
      }

      if (result && result.ok === false && result.error === 'duplicate') {
        errorNote.textContent = "It looks like this email has already submitted a response. If you need to update your answers, please reach out to a staff member.";
        errorNote.classList.add('show');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Survey';
        return;
      }

      form.style.display = 'none';
      document.getElementById('thankyou').classList.add('show');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      errorNote.textContent = 'Something went wrong submitting your response. Please try again.';
      errorNote.classList.add('show');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Survey';
    }
  });
}
