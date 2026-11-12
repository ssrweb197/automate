const $=id=>document.getElementById(id);
let chosen=[];
const rupees=n=>"₹"+Math.round(Number.isFinite(n)?n:0).toLocaleString("en-IN");
const safe=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const variantState={};
const SHORTLIST_KEY="automate-shortlist-v1";
function restoreShortlist(){
 try{
  const saved=JSON.parse(localStorage.getItem(SHORTLIST_KEY)||"null");
  if(!saved||!Array.isArray(saved.cars))return;
  const validIds=new Set(AUTO_CARS.map(c=>c.id));
  chosen=[...new Set(saved.cars.filter(id=>validIds.has(id)))].slice(0,3);
  if(saved.variants&&typeof saved.variants==="object"){
   chosen.forEach(id=>{
    const car=AUTO_CARS.find(c=>c.id===id),index=Number(saved.variants[id]);
    if(car&&Number.isInteger(index)&&index>=0&&index<(car.variants||[]).length)variantState[id]=index;
   });
  }
 }catch(error){console.warn("AutoMate shortlist could not be restored:",error)}
}
function saveShortlist(){
 try{localStorage.setItem(SHORTLIST_KEY,JSON.stringify({cars:chosen,variants:variantState,savedAt:Date.now()}))}
 catch(error){console.warn("AutoMate shortlist could not be saved:",error)}
}
restoreShortlist();
function render(){
 const q=$("search").value.toLowerCase().trim(),m=$("market").value,t=$("body").value,f=$("fuel").value,sort=$("sort").value;
 let list=AUTO_CARS.filter(c=>(c.make+" "+c.model).toLowerCase().includes(q)&&(m==="all"||c.market===m)&&(t==="all"||c.type===t)&&(f==="all"||c.fuel===f));
 if(sort==="name") list.sort((a,b)=>(a.make+" "+a.model).localeCompare(b.make+" "+b.model));
 $("count").textContent="Showing "+list.length+" of "+AUTO_CARS.length+" cars";
 $("carsGrid").innerHTML=list.map(c=>'<article class="car"><div class="carbody"><div class="meta"><span>'+safe(c.make)+'</span><span>'+safe(c.market)+' · '+safe(c.type)+'</span></div><h3>'+safe(c.model)+'</h3><div class="price">'+safe(c.price)+'</div><p>'+safe(c.summary)+'</p><div class="specs"><span>'+safe(c.fuel)+'</span><span>'+safe(c.seats)+' seats</span><span>'+safe(c.type)+'</span></div><div class="actions"><button class="details" data-detail="'+safe(c.id)+'">View details & variants</button><button class="add '+(chosen.includes(c.id)?"selected":"")+'" data-add="'+safe(c.id)+'">'+(chosen.includes(c.id)?"✓ Added":"＋ Compare")+'</button></div></div></article>').join("")||"<p>No cars match these filters.</p>";
}
function compare(){
 const selectedIds=[...new Set(chosen)].slice(0,3);
 const items=selectedIds.map(id=>AUTO_CARS.find(c=>c.id===id)).filter(Boolean);
 chosen=items.map(c=>c.id);
 saveShortlist();
 $("hint").textContent=items.length+" of 3 selected";
 const compareNow=$("compareNow");
 if(compareNow){compareNow.hidden=items.length===0;compareNow.textContent=items.length?"View comparison ("+items.length+"/3)":"Compare now";}
 if(!items.length){$("comparison").className="empty";$("comparison").textContent="Your shortlist will appear here. Select “Add to compare” on any car card.";return}
 const selectedVariant=c=>c.variants?.[variantState[c.id]||0]||null;
 const chips='<div class="selected-cars" aria-label="Selected cars">'+items.map((c,i)=>{const opts=(c.variants||[]).map((v,j)=>'<option value="'+j+'" '+(j===(variantState[c.id]||0)?"selected":"")+' >'+safe(v.name)+'</option>').join("");return '<span class="selected-car"><b>'+safe(c.make+" "+c.model)+'</b><small>Selected '+(i+1)+'</small>'+(opts?'<label class="compare-variant-label" for="compare-variant-'+safe(c.id)+'">Choose variant</label><select class="compare-variant-select" id="compare-variant-'+safe(c.id)+'" data-compare-variant="'+safe(c.id)+'">'+opts+'</select>':'<small>Variant details unavailable</small>')+'</span>'}).join("")+'</div>';
 const rows=[["Selected variant",c=>selectedVariant(c)?.name||"—"],["Variant engine / motor",c=>selectedVariant(c)?.engine||c.engine],["Variant fuel",c=>selectedVariant(c)?.fuel||c.fuel],["Variant transmission",c=>selectedVariant(c)?.transmission||c.transmission],["Variant price",c=>{const v=selectedVariant(c);return v?.price?rupees(v.price):(v?.priceLabel||"Not available") }],["Market",c=>c.market],["Body type",c=>c.type],["Powertrain range",c=>c.power],["Seats",c=>c.seats],["Mileage / range",c=>c.mileage],["Safety",c=>c.safety],["Dimensions",c=>c.dimensions],["Boot space",c=>c.boot],["Indicative model price",c=>c.price]];
 $("comparison").className="";
 $("comparison").innerHTML=chips+'<p class="compare-swipe-note">Swipe horizontally to view all selected cars →</p>'+'<div class="tablewrap"><table class="comparetable"><thead><tr><th>DETAIL</th>'+items.map(c=>"<th>"+safe(c.make+" "+c.model)+"</th>").join("")+'</tr></thead><tbody>'+rows.map(r=>"<tr><td>"+r[0]+"</td>"+items.map(c=>"<td>"+safe(r[1](c))+"</td>").join("")+"</tr>").join("")+'</tbody></table></div>';
 $("comparison").querySelectorAll("[data-compare-variant]").forEach(select=>select.addEventListener("change",()=>{variantState[select.dataset.compareVariant]=Number(select.value);compare()}));
}
function openDetails(c){
 const variants=c.variants||[];
 const selected=variantState[c.id]||0;
 const v=variants[selected]||null;
 const box=document.createElement("div");box.className="modalbg";
 const variantOptions=variants.map((x,i)=>'<option value="'+i+'" '+(i===selected?"selected":"")+'>'+safe(x.name)+'</option>').join("");
 box.innerHTML='<article class="modal" role="dialog" aria-modal="true" aria-label="Car details and variants"><button aria-label="Close">×</button><img class="modal-car-photo" src="'+safe(c.image)+'" alt="'+safe(c.make+" "+c.model)+'" onerror="this.style.display=\'none\'"><div class="modal-content"><small class="eyebrow">'+safe(c.market)+' · '+safe(c.type)+'</small><h2>'+safe(c.make+" "+c.model)+'</h2><h3 class="modalprice">'+safe(c.price)+'</h3><p>'+safe(c.summary)+'</p>'+(variants.length?'<section class="variant-picker"><label for="variant-'+safe(c.id)+'">CHOOSE A VARIANT</label><select id="variant-'+safe(c.id)+'">'+variantOptions+'</select><div class="variant-info" id="variant-info"></div></section>':'')+'<ul><li>Powertrain: '+safe(c.power)+'</li><li>Engine: '+safe(c.engine)+'</li><li>Transmission: '+safe(c.transmission)+'</li><li>Seats: '+safe(c.seats)+'</li><li>Mileage / range: '+safe(c.mileage)+'</li><li>Safety: '+safe(c.safety)+'</li><li>Dimensions: '+safe(c.dimensions)+'</li><li>Boot: '+safe(c.boot)+'</li></ul>'+(c.buyerNotes?'<section class="buyer-notes"><h3>Buyer notes</h3><div class="buyer-notes-grid"><div class="buyer-pros"><h4>What buyers may like</h4><ul>'+c.buyerNotes.pros.map(x=>'<li>'+safe(x)+'</li>').join("")+'</ul></div><div class="buyer-cons"><h4>Check before buying</h4><ul>'+c.buyerNotes.cons.map(x=>'<li>'+safe(x)+'</li>').join("")+'</ul></div></div><p class="buyer-note-disclaimer">General research prompts, not owner reviews or verified test results. Confirm details for your exact model year and variant.</p></section>':'')+'<p>Variant names and powertrain combinations are indicative trim families. Exact availability, equipment and prices differ by model year and country; confirm with the manufacturer or authorised dealer.</p></div></article>';
 document.body.append(box);
 const select=box.querySelector("#variant-"+c.id);
 const esc=ev=>{if(ev.key==="Escape")close()};
 const close=()=>{box.remove();document.removeEventListener("keydown",esc)};
 box.querySelector("button").onclick=close;box.onclick=e=>{if(e.target===box)close()};
 const update=()=>{const item=variants[Number(select.value)];variantState[c.id]=Number(select.value);const info=box.querySelector("#variant-info");if(item)info.innerHTML='<b>'+safe(item.name)+'</b><dl><dt>Engine / motor</dt><dd>'+safe(item.engine)+'</dd><dt>Fuel</dt><dd>'+safe(item.fuel)+'</dd><dt>Transmission</dt><dd>'+safe(item.transmission)+'</dd><dt>Variant price</dt><dd>'+safe(item.priceLabel)+'</dd></dl>';compare()};
 if(select){select.addEventListener("change",update);update()}
 document.addEventListener("keydown",esc);
}
document.addEventListener("click",e=>{
 const target=e.target instanceof Element?e.target:null;
 if(!target)return;
 const detail=target.closest("[data-detail]");
 if(detail){
  e.preventDefault();
  e.stopPropagation();
  const c=AUTO_CARS.find(x=>x.id===detail.dataset.detail);
  if(c){try{openDetails(c)}catch(err){console.error("AutoMate details modal error:",err);toast("Car details could not be opened. Please refresh and try again.")}}
  return;
 }
 const add=target.closest("[data-add]");
 if(add){
  e.preventDefault();
  const id=add.dataset.add;
  if(chosen.includes(id)){chosen=chosen.filter(x=>x!==id);render();compare();requestAnimationFrame(()=>scrollToComparison())}
  else{if(chosen.length===3){toast("You can compare up to 3 cars.");return}chosen.push(id);render();compare();requestAnimationFrame(()=>scrollToComparison())}
 }
});
["search","market","body","fuel","sort"].forEach(id=>$(id).addEventListener("input",render));
$("clear").onclick=()=>{chosen=[];render();compare()};
function scrollToComparison(){const section=$("compare");if(!section)return;section.classList.remove("compare-highlight");void section.offsetWidth;section.classList.add("compare-highlight");requestAnimationFrame(()=>requestAnimationFrame(()=>{const top=section.getBoundingClientRect().top+window.scrollY-88;window.scrollTo({top:Math.max(0,top),behavior:"smooth"})}));setTimeout(()=>section.classList.remove("compare-highlight"),1800)}
$("compareNow").onclick=scrollToComparison;
function toast(msg){$("toast").textContent=msg;$("toast").style.display="block";setTimeout(()=>$("toast").style.display="none",2200)}
function emi(){const p=Math.max(0,+$("amount").value||0),annual=Math.max(0,Math.min(40,+$("rate").value||0)),r=annual/1200,n=(+$("years").value||1)*12,v=r===0?p/n:p*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1),total=v*n;$("emi").textContent=rupees(v||0);$("yearLabel").textContent=$("years").value+" years";$("loanSummary").textContent="Total repayment: "+rupees(total)+" · Interest: "+rupees(total-p)}
function fuelCost(){const d=Math.max(0,+$("distance").value||0),e=Math.max(.1,+$("efficiency").value||.1),p=Math.max(0,+$("price").value||0),units=d/e,cost=units*p;$("fuelCost").textContent=rupees(cost);$("fuelSummary").textContent=units.toFixed(1)+" litres / kWh estimated per month"}
function onRoad(){const p=Math.max(0,+$("exPrice").value||0),tax=Math.max(0,Math.min(40,+$("taxRate").value||0))/100,other=Math.max(0,+$("otherCost").value||0);$("onRoad").textContent=rupees(p+p*tax+other)}
function linkRange(numberId,rangeId){
 const number=$(numberId),range=$(rangeId);
 number.addEventListener("input",()=>{range.value=String(Math.max(+range.min,Math.min(+range.max,+number.value||0)));});
 range.addEventListener("input",()=>{number.value=range.value;number.dispatchEvent(new Event("input",{bubbles:true}))});
}
linkRange("amount","amountRange");
linkRange("rate","rateRange");
linkRange("distance","distanceRange");
["amount","rate","years"].forEach(id=>$(id).addEventListener("input",emi));
["distance","efficiency","price"].forEach(id=>$(id).addEventListener("input",fuelCost));
["exPrice","taxRate","otherCost"].forEach(id=>$(id).addEventListener("input",onRoad));
$("menu").onclick=()=>{const open=$("nav").classList.toggle("open");$("menu").setAttribute("aria-expanded",String(open))};
document.querySelectorAll("#nav a").forEach(a=>a.onclick=()=>{$("nav").classList.remove("open");$("menu").setAttribute("aria-expanded","false")});
$("year").textContent=new Date().getFullYear();render();compare();emi();fuelCost();onRoad();