/* CROSSROADS 2027 — JUNIOR COORDINATOR FORM
   Replace the URL below with your NEW Google Apps Script deployment URL. */
const SHEET_URL = "https://script.google.com/macros/s/AKfycbwr5EF0mIjimZuXuKmOXdgK56S9o7l-WI7J8ZUfS0DgzoRmpz_nYej7KrdQ5qj7keFs/exec";

const TEAMS = [
  {id:"core",label:"Core Team",description:"Run the backbone of the festival."},
  {id:"event",label:"Events Team",description:"Plan and execute experiences on the ground."},
  {id:"tech",label:"Tech Team",description:"Design, build and create."}
];
const DEPARTMENTS = {
  core:{title:"Core Team preferences",note:"Rank all four departments.",items:["Marketing & Media","Sponsorship","Outreach","Logistics & Operations"]},
  event:{title:"Events Team preferences",note:"Rank both departments.",items:["Sponsorship","Outreach"]},
  tech:{title:"Tech Team preferences",note:"Put your strongest skill first.",items:["Graphic Designing / Digital Art","Video Editing","Web Development"]}
};
const LABELS={core:"Core",event:"Events",tech:"Tech"};
const order={
  teams:TEAMS.map(t=>t.id),
  core:[...DEPARTMENTS.core.items],
  event:[...DEPARTMENTS.event.items],
  tech:[...DEPARTMENTS.tech.items]
};
const $=selector=>document.querySelector(selector);
const DRAFT_KEY="crossroads27-junior-draft-v1";
const TEXT_IDS=["name","roll","phone","email","drive","contribution","commitments"];

function escapeHTML(value){
  return String(value).replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
}
function moveItem(list,index,direction){
  const target=index+direction;
  if(target<0||target>=list.length)return;
  [list[index],list[target]]=[list[target],list[index]];
}
function rankingMarkup(list,key,descriptionFor,tagFor){
  return list.map((value,index)=>`
    <li>
      <span class="rank-number">${index+1}</span>
      <div class="rank-copy"><b>${escapeHTML(value)}${tagFor&&tagFor(index)?`<span class="rank-tag">${tagFor(index)}</span>`:""}</b>${descriptionFor?`<small>${escapeHTML(descriptionFor(value))}</small>`:""}</div>
      <div class="move-controls">
        <button type="button" data-list="${key}" data-index="${index}" data-direction="-1" aria-label="Move ${escapeHTML(value)} up" ${index===0?"disabled":""}>↑</button>
        <button type="button" data-list="${key}" data-index="${index}" data-direction="1" aria-label="Move ${escapeHTML(value)} down" ${index===list.length-1?"disabled":""}>↓</button>
      </div>
    </li>`).join("");
}
function renderRankings(){
  const teamMap=Object.fromEntries(TEAMS.map(team=>[team.id,team]));
  $("#rank-domain").innerHTML=rankingMarkup(order.teams,"teams",id=>teamMap[id].description,index=>index===0?"TOP PICK":"");
  $("#sub-rankings").innerHTML=order.teams.map((id,index)=>`
    <section class="sub-rank">
      <h4>${DEPARTMENTS[id].title} <span class="rank-tag">${["1ST","2ND","3RD"][index]} TEAM</span></h4>
      <p>${DEPARTMENTS[id].note}</p>
      <ol class="rank-list">${rankingMarkup(order[id],id,null,(position)=>id==="tech"&&position<2?(position===0?"STRONGEST SKILL":"SECOND SKILL"):"")}</ol>
    </section>`).join("");
}
function techInTopTwo(){return order.teams.indexOf("tech")<2;}
function syncTechRequirement(){
  const required=techInTopTwo();
  $("#workBadge").textContent=required?"Required":"Optional";
  $("#workBadge").classList.toggle("required",required);
  $("#workNotice").classList.toggle("off",!required);
  $("#driveOptional").textContent=required?"Required":"Optional";
  $("#driveError").textContent=required?"Tech is in your top two, so a valid Google Drive link is required.":"Enter a valid Google Drive link.";
  if(!required&&!$("#drive").value.trim())$("#driveField").classList.remove("invalid");
}
function saveDraft(){
  try{
    const fields={};
    TEXT_IDS.forEach(id=>fields[id]=$("#"+id).value);
    fields.year=$("#year").checked;
    sessionStorage.setItem(DRAFT_KEY,JSON.stringify({fields,order}));
  }catch(error){/* Storage may be unavailable; form still works. */}
}
function loadDraft(){
  try{
    const draft=JSON.parse(sessionStorage.getItem(DRAFT_KEY)||"null");
    if(!draft)return;
    TEXT_IDS.forEach(id=>{if(typeof draft.fields?.[id]==="string")$("#"+id).value=draft.fields[id];});
    $("#year").checked=!!draft.fields?.year;
    ["teams","core","event","tech"].forEach(key=>{
      const saved=draft.order?.[key];
      if(Array.isArray(saved)&&saved.length===order[key].length&&order[key].every(item=>saved.includes(item)))order[key]=saved;
    });
  }catch(error){/* Ignore an invalid or unavailable draft. */}
}
function updateCounters(){
  $("#contributionCount").textContent=$("#contribution").value.length;
  $("#commitmentsCount").textContent=$("#commitments").value.length;
}
document.addEventListener("click",event=>{
  const button=event.target.closest(".move-controls button");
  if(!button)return;
  const key=button.dataset.list;
  const list=key==="teams"?order.teams:order[key];
  moveItem(list,Number(button.dataset.index),Number(button.dataset.direction));
  renderRankings();
  syncTechRequirement();
  saveDraft();
});
const validators={
  name:value=>value.trim().split(/\s+/).filter(Boolean).length>=2,
  roll:value=>value.trim().length>=2,
  phone:value=>{let digits=value.replace(/\D/g,"");if(digits.length===12&&digits.startsWith("91"))digits=digits.slice(2);return /^[6-9]\d{9}$/.test(digits);},
  email:value=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim()),
  drive:value=>{const trimmed=value.trim();return trimmed===""?!techInTopTwo():/^https:\/\/(drive\.google\.com|docs\.google\.com)\//i.test(trimmed);}
};
function validateField(id){
  const element=$("#"+id);
  const valid=validators[id](element.value);
  element.closest(".field").classList.toggle("invalid",!valid);
  return valid;
}
function validateAll(){
  const results=Object.keys(validators).map(validateField);
  const yearValid=$("#year").checked;
  $("#yearField").classList.toggle("invalid",!yearValid);
  results.push(yearValid);
  return results.every(Boolean);
}
function buildPayload(){
  const payload={
    recruitmentType:"Junior Coordinator",
    fullName:$("#name").value.trim(),
    year:"First year",
    rollNumber:$("#roll").value.trim(),
    email:$("#email").value.trim().toLowerCase(),
    contact:$("#phone").value.replace(/\D/g,"").slice(-10),
    teamSummary:order.teams.map((id,index)=>`${index+1}. ${LABELS[id]}`).join(" > "),
    driveLink:$("#drive").value.trim(),
    contribution:$("#contribution").value.trim(),
    commitments:$("#commitments").value.trim(),
    submittedAt:new Date().toISOString()
  };
  order.teams.forEach((id,index)=>payload["team"+(index+1)]=LABELS[id]);
  order.core.forEach((value,index)=>payload["core"+(index+1)]=value);
  order.event.forEach((value,index)=>payload["event"+(index+1)]=value);
  order.tech.forEach((value,index)=>payload["tech"+(index+1)]=value);
  return payload;
}
function showSuccess(payload){
  $("#applicationForm").hidden=true;
  $("#successName").textContent=payload.fullName.split(/\s+/)[0];
  $("#successDetails").innerHTML=`
    <p><b>Team preference:</b> ${escapeHTML(payload.teamSummary)}</p>
    <p><b>Core:</b> ${order.core.map(escapeHTML).join(" → ")}</p>
    <p><b>Events:</b> ${order.event.map(escapeHTML).join(" → ")}</p>
    <p><b>Tech:</b> ${order.tech.map(escapeHTML).join(" → ")}</p>`;
  $("#successPanel").hidden=false;
  $("#successPanel").scrollIntoView({behavior:"smooth",block:"start"});
}
async function submitApplication(event){
  event.preventDefault();
  $("#formMessage").textContent="";
  if(!validateAll()){
    document.querySelector(".field.invalid")?.scrollIntoView({behavior:"smooth",block:"center"});
    $("#formMessage").textContent="Please check the highlighted fields before submitting.";
    return;
  }
  if(!SHEET_URL.startsWith("https://script.google.com/macros/s/")){
    $("#formMessage").textContent="The form administrator needs to add the new Google Apps Script URL in script.js.";
    return;
  }
  const button=$("#submitButton");
  button.disabled=true;
  button.querySelector("span").textContent="Submitting…";
  try{
    const payload=buildPayload();
    const response=await fetch(SHEET_URL,{
      method:"POST",
      headers:{"Content-Type":"text/plain;charset=utf-8"},
      body:JSON.stringify(payload)
    });
    if(!response.ok)throw new Error("The server returned an error. Please try again.");
    const result=await response.json();
    if(!result.ok)throw new Error(result.error||"Your application could not be saved.");
    sessionStorage.removeItem(DRAFT_KEY);
    showSuccess(payload);
  }catch(error){
    $("#formMessage").textContent=`Couldn't submit your application: ${error.message}. Your answers are still on this page; please try again.`;
    button.disabled=false;
    button.querySelector("span").textContent="Submit application";
  }
}

loadDraft();
renderRankings();
syncTechRequirement();
updateCounters();
TEXT_IDS.forEach(id=>{
  const element=$("#"+id);
  element.addEventListener("input",()=>{
    if(validators[id]&&element.closest(".field").classList.contains("invalid"))validateField(id);
    if(id==="drive")syncTechRequirement();
    updateCounters();
    saveDraft();
  });
  element.addEventListener("blur",()=>{if(validators[id])validateField(id);});
});
$("#year").addEventListener("change",()=>{$("#yearField").classList.toggle("invalid",!$("#year").checked);saveDraft();});
$("#applicationForm").addEventListener("submit",submitApplication);
