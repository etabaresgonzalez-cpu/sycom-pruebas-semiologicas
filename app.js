const tests = window.SYCOM_TESTS || [];
const state = { region:"Todas", pathology:"Todas", query:"", favoritesOnly:false };
const favs = new Set(JSON.parse(localStorage.getItem("sycom-favs") || "[]"));

const $ = (s)=>document.querySelector(s);
const $$ = (s)=>[...document.querySelectorAll(s)];
const normalize = (s)=>String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();

function metricValue(v){
  return (v === null || v === undefined || v === "") ? "N/R" : `${v}%`;
}
function numericApprox(v){
  if(typeof v==="number") return v;
  if(!v) return null;
  const nums = String(v).match(/\d+/g);
  if(!nums) return null;
  return nums.map(Number).reduce((a,b)=>a+b,0)/nums.length;
}
function metricClass(v){
  const n=numericApprox(v); if(n===null) return "";
  return n>=80?"high":n<50?"low":"";
}
function barWidth(v){
  const n=numericApprox(v); return n===null?0:Math.min(100,Math.max(0,n));
}
function unique(list){ return [...new Set(list)].sort((a,b)=>a.localeCompare(b,"es")); }

function renderRegionChips(){
  const regions=["Todas",...unique(tests.map(t=>t.region))];
  $("#regionChips").innerHTML=regions.map(r=>`<button class="chip ${state.region===r?"active":""}" data-region="${r}">${r}</button>`).join("");
  $$("#regionChips [data-region]").forEach(btn=>btn.onclick=()=>{state.region=btn.dataset.region;state.pathology="Todas";renderAll();});
}
function renderPathologies(){
  const pool=state.region==="Todas"?tests:tests.filter(t=>t.region===state.region);
  const ps=["Todas",...unique(pool.map(t=>t.patologia))];
  $("#pathList").innerHTML=ps.map(p=>`<button class="path-btn ${state.pathology===p?"active":""}" data-path="${p}">${p}</button>`).join("");
  $$("#pathList [data-path]").forEach(btn=>btn.onclick=()=>{state.pathology=btn.dataset.path;renderAll(false);});
}
function filtered(){
  const q=normalize(state.query);
  return tests.filter(t=>{
    if(state.region!=="Todas" && t.region!==state.region) return false;
    if(state.pathology!=="Todas" && t.patologia!==state.pathology) return false;
    if(state.favoritesOnly && !favs.has(t.id)) return false;
    if(q){
      const hay=normalize([t.nombre,t.region,t.patologia,t.estructura,t.procedimiento,t.positivo,t.interpretacion,...(t.keywords||[])].join(" "));
      if(!hay.includes(q)) return false;
    }
    return true;
  });
}
function card(t){
  return `<article class="card" data-open="${t.id}" tabindex="0" role="button" aria-label="Abrir ${t.nombre}">
    <div class="card-top">
      <span class="region-badge">${t.region}</span>
      <button class="star" data-fav="${t.id}" title="Guardar en favoritos" aria-label="Guardar en favoritos">${favs.has(t.id)?"★":"☆"}</button>
    </div>
    <h3>${t.nombre}</h3>
    <div class="pathology">${t.patologia}</div>
    <div class="metrics">
      <div class="metric ${metricClass(t.sensibilidad)}"><small>Sensibilidad</small><b>${metricValue(t.sensibilidad)}</b></div>
      <div class="metric ${metricClass(t.especificidad)}"><small>Especificidad</small><b>${metricValue(t.especificidad)}</b></div>
    </div>
    <div class="card-footer"><span>${t.estructura}</span><span class="open">Revisar →</span></div>
  </article>`;
}
function renderCards(){
  const list=filtered();
  $("#resultCount").textContent=`${list.length} ${list.length===1?"prueba":"pruebas"}`;
  $("#cards").innerHTML=list.length?list.map(card).join(""):`<div class="empty"><strong>No encontramos pruebas con esos filtros.</strong><br><span>Prueba con otro término o limpia la búsqueda.</span></div>`;
  $$("[data-open]").forEach(el=>{
    el.onclick=(e)=>{ if(e.target.closest("[data-fav]")) return; openTest(el.dataset.open); };
    el.onkeydown=(e)=>{ if(e.key==="Enter") openTest(el.dataset.open); };
  });
  $$("[data-fav]").forEach(btn=>btn.onclick=(e)=>{
    e.stopPropagation(); const id=btn.dataset.fav;
    favs.has(id)?favs.delete(id):favs.add(id);
    localStorage.setItem("sycom-favs",JSON.stringify([...favs])); renderCards();
  });
}
function renderAll(includeRegions=true){
  if(includeRegions) renderRegionChips();
  renderPathologies(); renderCards();
  $("#favBtn").textContent=state.favoritesOnly?"★ Ver todas":"☆ Mis favoritas";
}

function openTest(id, pushHash=true){
  const t=tests.find(x=>x.id===id); if(!t) return;
  $("#modalRegion").textContent=t.region;
  $("#modalTitle").textContent=t.nombre;
  $("#modalPath").textContent=t.patologia;
  $("#modalStructure").textContent=t.estructura;
  $("#modalProcedure").textContent=t.procedimiento;
  $("#modalPositive").textContent=t.positivo;
  $("#modalInterpretation").textContent=t.interpretacion;
  $("#sensValue").textContent=metricValue(t.sensibilidad);
  $("#specValue").textContent=metricValue(t.especificidad);
  $("#sensBar").style.width=barWidth(t.sensibilidad)+"%";
  $("#specBar").style.width=barWidth(t.especificidad)+"%";
  $("#videoLink").href=t.video;
  $("#shareBtn").dataset.id=t.id;
  $("#testModal").classList.add("open");
  document.body.style.overflow="hidden";
  if(pushHash) history.replaceState(null,"","#"+id);
}
function closeModal(clearHash=true){
  $("#testModal").classList.remove("open"); document.body.style.overflow="";
  if(clearHash && location.hash) history.replaceState(null,"",location.pathname+location.search);
}
$("#closeModal").onclick=()=>closeModal();
$("#testModal").onclick=(e)=>{if(e.target.id==="testModal")closeModal();}
document.addEventListener("keydown",(e)=>{if(e.key==="Escape")closeModal(); if(e.key==="/" && document.activeElement.tagName!=="INPUT"){e.preventDefault();$("#searchInput").focus();}});
$("#searchInput").addEventListener("input",e=>{state.query=e.target.value;renderCards();});
$("#clearBtn").onclick=()=>{state.query="";state.region="Todas";state.pathology="Todas";state.favoritesOnly=false;$("#searchInput").value="";renderAll();};
$("#favBtn").onclick=()=>{state.favoritesOnly=!state.favoritesOnly;renderAll(false);};
$("#infoBtn").onclick=()=>$("#glossary").classList.toggle("show");
$("#infoModalBtn").onclick=()=>$("#modalGlossary").classList.toggle("show");
$("#shareBtn").onclick=async(e)=>{
  const id=e.currentTarget.dataset.id; const url=location.href.split("#")[0]+"#"+id;
  try{await navigator.clipboard.writeText(url);e.currentTarget.textContent="✓ Enlace copiado";setTimeout(()=>e.currentTarget.textContent="⤴ Compartir prueba",1600);}
  catch{prompt("Copia este enlace:",url);}
};

$("#totalTests").textContent=tests.length;
$("#totalRegions").textContent=unique(tests.map(t=>t.region)).length;
renderAll();

if(location.hash){
  const id=location.hash.slice(1);
  if(tests.some(t=>t.id===id)) setTimeout(()=>openTest(id,false),50);
}
