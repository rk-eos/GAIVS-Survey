/* ---------- CONFIG ----------
   Paste your deployed Google Apps Script Web App URL below.
   See README.md for deployment steps. */
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzS6wS-jegC4FtVNIkB5GQ663wplieTEDqJG--snt5ei7pDoVVK9ibghR-9zIO3qux5pg/exec";

// Toggle .selected class on pill options when their radio/checkbox is chosen
document.querySelectorAll('.options').forEach(group => {
  group.addEventListener('change', () => {
    group.querySelectorAll('.option').forEach(opt => {
      const input = opt.querySelector('input');
      opt.classList.toggle('selected', input.checked);
    });
  });
});

// Show/hide conditional follow-up textareas (e.g. "if yes, what happened?")
document.querySelectorAll('[data-followup-trigger]').forEach(input => {
  input.addEventListener('change', () => {
    const targetId = input.getAttribute('data-followup-trigger');
    const showOn = input.getAttribute('data-followup-value');
    const target = document.getElementById(targetId);
    if (!target) return;
    target.classList.toggle('show', input.value === showOn && input.checked);
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

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting…';

    const payload = {
      formType: formType,
      submittedAt: new Date().toISOString(),
      answers: collectFormData(form)
    };

    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // Apps Script doesn't return CORS headers; fire-and-forget
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });

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
