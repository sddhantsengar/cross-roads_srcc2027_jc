/**
 * CROSSROADS 2027 — JUNIOR COORDINATOR RECRUITMENT
 * Google Apps Script web app endpoint.
 *
 * SETUP:
 * 1. Create a NEW Google Spreadsheet.
 * 2. Copy its ID from the URL and paste it into SPREADSHEET_ID below.
 * 3. In Extensions > Apps Script, paste this entire file into Code.gs.
 * 4. Run setupSheet() once and approve permissions.
 * 5. Deploy > New deployment > Web app.
 *    Execute as: Me
 *    Who has access: Anyone
 * 6. Copy the /exec URL into SHEET_URL in script.js.
 */

const SPREADSHEET_ID = "PASTE_NEW_GOOGLE_SPREADSHEET_ID_HERE";
const SHEET_NAME = "Junior Coordinator Applications";

const HEADERS = [
  "Timestamp","Recruitment Type","Full Name","Year","Roll Number","Email","Contact",
  "Team Summary","Team 1","Team 2","Team 3",
  "Core 1","Core 2","Core 3","Core 4",
  "Events 1","Events 2",
  "Tech 1","Tech 2","Tech 3",
  "Google Drive Link","Skills / Experience / Ideas","Other Commitments"
];

function getSpreadsheet_() {
  if (!SPREADSHEET_ID || SPREADSHEET_ID.indexOf("PASTE_") === 0) {
    throw new Error("Add your new Google Spreadsheet ID in SPREADSHEET_ID.");
  }
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function getSheet_() {
  const ss = getSpreadsheet_();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length)
      .setBackground("#17243a")
      .setFontColor("#d4f36a")
      .setFontWeight("bold")
      .setWrap(true);
    sheet.autoResizeColumns(1, HEADERS.length);
  }
  return sheet;
}

/** Run once manually from the Apps Script editor. */
function setupSheet() {
  const sheet = getSheet_();
  sheet.getRange("A:A").setNumberFormat("yyyy-mm-dd hh:mm:ss");
  return "Ready: " + sheet.getName();
}

function jsonResponse_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function clean_(value, maxLength) {
  return String(value == null ? "" : value).trim().slice(0, maxLength || 2000);
}

function validatePayload_(p) {
  if (!p || typeof p !== "object") throw new Error("Invalid application data.");
  if (p.recruitmentType !== "Junior Coordinator") throw new Error("This endpoint accepts Junior Coordinator applications only.");
  if (p.year !== "First year") throw new Error("Eligibility must be first year.");
  if (clean_(p.fullName, 120).split(/\s+/).filter(Boolean).length < 2) throw new Error("Enter your full name.");
  if (clean_(p.rollNumber, 60).length < 2) throw new Error("Enter your roll number.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(clean_(p.email, 160))) throw new Error("Enter a valid email.");
  if (!/^[6-9]\d{9}$/.test(clean_(p.contact, 20))) throw new Error("Enter a valid 10-digit mobile number.");

  const validTeams = ["Core", "Events", "Tech"];
  const submittedTeams = [p.team1, p.team2, p.team3].map(v => clean_(v, 30));
  if (new Set(submittedTeams).size !== 3 || submittedTeams.some(v => !validTeams.includes(v))) {
    throw new Error("Team preferences are incomplete or invalid.");
  }

  const validCore = ["Marketing & Media", "Sponsorship", "Outreach", "Logistics & Operations"];
  const validEvents = ["Sponsorship", "Outreach"];
  const validTech = ["Graphic Designing / Digital Art", "Video Editing", "Web Development"];
  validateRanking_([p.core1,p.core2,p.core3,p.core4], validCore, "Core");
  validateRanking_([p.event1,p.event2], validEvents, "Events");
  validateRanking_([p.tech1,p.tech2,p.tech3], validTech, "Tech");

  const drive = clean_(p.driveLink, 500);
  if (submittedTeams.slice(0, 2).includes("Tech")) {
    if (!/^https:\/\/(drive\.google\.com|docs\.google\.com)\//i.test(drive)) {
      throw new Error("A Google Drive link is required when Tech is in your top two.");
    }
  } else if (drive && !/^https:\/\/(drive\.google\.com|docs\.google\.com)\//i.test(drive)) {
    throw new Error("Enter a valid Google Drive link.");
  }
}

function validateRanking_(values, allowed, label) {
  const cleanValues = values.map(v => clean_(v, 100));
  if (cleanValues.some(v => !allowed.includes(v)) || new Set(cleanValues).size !== allowed.length) {
    throw new Error(label + " preferences are incomplete or invalid.");
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    const raw = e && e.postData && e.postData.contents;
    if (!raw) throw new Error("No application data received.");
    const payload = JSON.parse(raw);
    validatePayload_(payload);

    lock.waitLock(15000);
    const sheet = getSheet_();

    // Prevent accidental duplicate applications using the same roll number.
    const roll = clean_(payload.rollNumber, 60).toLowerCase();
    const lastRow = sheet.getLastRow();
    if (lastRow >= 2) {
      const existingRolls = sheet.getRange(2, 5, lastRow - 1, 1).getDisplayValues().flat();
      if (existingRolls.some(value => String(value).trim().toLowerCase() === roll)) {
        return jsonResponse_({ok:false, error:"An application with this college roll number has already been submitted."});
      }
    }

    const row = [
      new Date(),
      "Junior Coordinator",
      clean_(payload.fullName,120),
      "First year",
      clean_(payload.rollNumber,60),
      clean_(payload.email,160).toLowerCase(),
      clean_(payload.contact,20),
      clean_(payload.teamSummary,200),
      clean_(payload.team1,30),
      clean_(payload.team2,30),
      clean_(payload.team3,30),
      clean_(payload.core1,100),
      clean_(payload.core2,100),
      clean_(payload.core3,100),
      clean_(payload.core4,100),
      clean_(payload.event1,100),
      clean_(payload.event2,100),
      clean_(payload.tech1,100),
      clean_(payload.tech2,100),
      clean_(payload.tech3,100),
      clean_(payload.driveLink,500),
      clean_(payload.contribution,1200),
      clean_(payload.commitments,1000)
    ];

    sheet.appendRow(row);
    return jsonResponse_({ok:true, message:"Application saved."});
  } catch (error) {
    return jsonResponse_({ok:false, error:error.message || "Unexpected server error."});
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

function doGet() {
  return jsonResponse_({ok:true, service:"Crossroads 2027 Junior Coordinator Applications"});
}
