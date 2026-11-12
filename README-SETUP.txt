CROSSROADS 2027 — JUNIOR COORDINATOR RECRUITMENT
================================================

FILES
-----
index.html       Main application page
roles.html       Teams and responsibilities page
style.css        Complete visual styling
script.js        Ranking, validation, draft saving and submission
Code.gs          Google Apps Script endpoint for a NEW Google Sheet
banner.jpg       Put your existing banner.jpg in this same folder

IMPORTANT
---------
This is a separate Junior Coordinator form. It does not reuse the Senior
Coordinator Google Sheet or Apps Script endpoint.

PART 1 — CREATE A NEW GOOGLE SHEET
----------------------------------
1. Go to https://sheets.google.com and create a blank spreadsheet.
2. Name it: Crossroads 2027 - Junior Coordinator Applications
3. Copy the spreadsheet ID from its URL.

Example:
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_IS_HERE/edit

The ID is the long section between /d/ and /edit.

PART 2 — SET UP GOOGLE APPS SCRIPT
----------------------------------
1. In the new spreadsheet, open Extensions > Apps Script.
2. Remove the starter code in Code.gs.
3. Paste the complete contents of the supplied Code.gs file.
4. Replace:
   PASTE_NEW_GOOGLE_SPREADSHEET_ID_HERE
   with your actual spreadsheet ID.
5. Save the project.
6. In the function dropdown, select setupSheet and click Run.
7. Approve the Google permissions.
8. Return to your spreadsheet. A tab named
   "Junior Coordinator Applications" should now exist with headers.

PART 3 — DEPLOY THE WEB APP
---------------------------
1. In Apps Script, click Deploy > New deployment.
2. Click the gear icon / Select type and choose Web app.
3. Description: Crossroads Junior Coordinator Form.
4. Execute as: Me.
5. Who has access: Anyone.
6. Click Deploy and complete authorization if asked.
7. Copy the Web app URL ending in /exec.

If you change Code.gs after deployment, go to Deploy > Manage deployments,
edit the deployment, select a new version, and deploy again.

PART 4 — CONNECT THE WEBSITE
----------------------------
1. Open script.js.
2. Find:
   const SHEET_URL = "PASTE_YOUR_NEW_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";
3. Replace the placeholder with the new /exec URL, keeping the quotation marks.
4. Save the file.

PART 5 — ADD YOUR BANNER AND PUBLISH
------------------------------------
1. Put your existing banner.jpg in this folder beside index.html.
2. Upload index.html, roles.html, style.css, script.js and banner.jpg
   to the same hosting folder (for example, your GitHub Pages repository).
3. Open index.html through your hosting URL, not by double-clicking the file.

TEST BEFORE SHARING
-------------------
- Submit one test application with a test roll number and email.
- Check that one row appears in the new Junior Coordinator Applications tab.
- Try submitting the same roll number again. It should be rejected.
- Test the form on a phone.
- Move Tech into the top two and confirm the Drive link becomes compulsory.
- Move Tech to third and confirm the Drive link becomes optional.
- Delete the test row before opening recruitment, if appropriate.

IMPORTANT SECURITY / ADMIN NOTES
-------------------------------
- Anyone with the deployed form URL can submit data. Keep the spreadsheet
  private and do not share editor access publicly.
- The script blocks duplicate roll numbers, but it is not a full anti-bot
  or identity-verification system. For a public recruitment launch, consider
  adding CAPTCHA or another abuse-prevention layer if spam becomes an issue.
- The frontend keeps an in-progress draft in sessionStorage on that browser tab.
  It is not a cloud backup and may disappear when the tab/session ends.
- Applicants should set their Google Drive folder permissions to
  "Anyone with the link can view" if they submit a work-sample link.
- The form uses a browser fetch request to the Apps Script web app. Test the
  deployed endpoint from the actual hosted website before publishing widely.
