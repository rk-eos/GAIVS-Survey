# GAIVS End-of-Program Surveys

Two branded survey pages (`student.html`, `parent.html`) that post responses
straight into your Google Sheet

No paid tools, no separate database — just GitHub Pages + a free Google Apps
Script "Web App" acting as the receiving endpoint.

## 1. Connect the backend (Apps Script) — do this first

1. Open the Google Sheet linked above.
2. Go to **Extensions → Apps Script**.
3. Delete any starter code in `Code.gs`, then paste in the full contents of
   `apps-script.gs` from this folder.
4. Click **Deploy → New deployment**.
5. Next to "Select type," click the gear icon and choose **Web app**.
6. Set:
   - **Execute as:** Me
   - **Who has access:** Anyone
7. Click **Deploy**, then **Authorize access** (approve the permissions prompt
   — this is your own script writing to your own sheet).
8. Copy the **Web app URL** it gives you (ends in `/exec`).

That URL is your `SCRIPT_URL`.

## 2. Connect the frontend

1. Open `survey.js` in this folder.
2. Replace this line near the top:
   ```js
   const SCRIPT_URL = "PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE";
   ```
   with your copied `/exec` URL.

## 3. Publish with GitHub Pages

1. Create a new repo (e.g. `gaivs-surveys`) and push these files:
   `index.html`, `student.html`, `parent.html`, `style.css`, `survey.js`
   (you don't need to upload `apps-script.gs` or this README — they're just
   for your reference — but it's fine if you do).
2. In the repo: **Settings → Pages → Source → Deploy from a branch → main /
   root**.
3. Your surveys will be live at:
   `https://<your-username>.github.io/gaivs-surveys/`
   - Landing page: `/`
   - Student survey: `/student.html`
   - Parent survey: `/parent.html`

## 4. Test it

Submit a test response on each form and confirm rows appear in the
**Student Responses** and **Parent Responses** tabs (Apps Script creates
these tabs automatically on first submission).

## Notes

- If you ever need to change a question, edit the `<label class="option">`
  blocks directly in `student.html` / `parent.html` — just keep each
  `name="..."` attribute matching what `apps-script.gs` expects, or update
  both together.
- Responses are appended, never overwritten — safe to leave running for the
  full feedback window.
- If Apps Script ever needs re-authorizing (e.g. after editing the script),
  redeploy via **Deploy → Manage deployments → Edit → New version**.
- **Duplicate-email check**: each submission's email is compared against
  every existing row in that form's tab. If it matches, the row is rejected
  and the person sees a message asking them to contact staff instead of a
  silent overwrite.
- **Column layout changed** (email added as the 2nd column on both sheets;
  parent's "Leesa Awareness" and "Access Issues" columns were removed).
  If you already have a **Student Responses** or **Parent Responses** tab
  from before this change, either delete that tab (the script will recreate
  it with the correct headers on the next submission) or manually adjust its
  header row/columns to match `STUDENT_HEADERS` / `PARENT_HEADERS` in
  `apps-script.gs`.
