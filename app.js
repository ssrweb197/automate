const $=id=>document.getElementById(id);
let chosen=[];
const rupees=n=>"₹"+Math.round(Number.isFinite(n)?n:0).toLocaleString("en-IN");
const safe=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function render(){
 const q=$("search").value.toLowerCase().trim(),m=$("market").value,t=$("body").value,f=$("fuel").value,sort=$("sort").value;
 let list=AUTO_CARS.filter(c=>(c.make+" "+c.model).toLowerCase().includes(q)&&(m==="all"||c.market===m)&&(t==="all"||c.type===t)&&(f==="all"||c.fuel===f));
 if(sort==="name") list.sort((a,b)=>(a.make+" "+a.model).localeCompare(b.make+" "+b.model));
 $("count").textContent="Showing "+list.length+" of "+AUTO_CARS.length+" cars";
 $("carsGrid").innerHTML=list.map(c=>'<article class="car"><img loading="lazy" src="'+safe(c.image)+'" alt="'+safe(c.make+" "+c.model)+' photo" onerror="this.onerror=null;this.src=\'assets/car-placeholder.svg\';"><div class="carbody"><div class="meta"><span>'+safe(c.make)+'</span><span>'+safe(c.market)+' · '+safe(c.type)+'</span></div><h3>'+safe(c.model)+'</h3><div class="price">'+safe(c.price)+'</div><p>'+safe(c.summary)+'</p><div class="specs"><span>'+safe(c.fuel)+'</span><span>'+safe(c.seats)+' seats</span><span>'+safe(c.type)+'</span></div><div class="actions"><button class="details" data-detail="'+safe(c.id)+'">View details</button><button class="add '+(chosen.includes(c.id)?"selected":"")+'" data-add="'+safe(c.id)+'">'+(chosen.includes(c.id)?"✓ Added":"＋ Compare")+'</button></div></div></article>').join("")||"<p>No cars match these filters.</p>";
}
function compare(){
 const items=chosen.map(id=>AUTO_CARS.find(c=>c.id===id)).filter(Boolean);
 $("hint").textContent=items.length+" of 3 selected";
 if(!items.length){$("comparison").className="empty";$("comparison").textContent="Your shortlist will appear here. Select “Add to compare” on any car card.";return}
 $("comparison").className="";
 const rows=[["Market",c=>c.market],["Body type",c=>c.type],["Powertrain",c=>c.power],["Engine",c=>c.engine],["Transmission",c=>c.transmission],["Seats",c=>c.seats],["Mileage / range",c=>c.mileage],["Safety",c=>c.safety],["Dimensions",c=>c.dimensions],["Boot space",c=>c.boot],["Indicative price",c=>c.price]];
 $("comparison").innerHTML='<div class="tablewrap"><table class="comparetable"><thead><tr><th>DETAIL</th>'+items.map(c=>"<th>"+safe(c.make+" "+c.model)+"</th>").join("")+'</tr></thead><tbody>'+rows.map(r=>"<tr><td>"+r[0]+"</td>"+items.map(c=>"<td>"+safe(r[1](c))+"</td>").join("")+"</tr>").join("")+'</tbody></table></div>';
}
$("carsGrid").addEventListener("click",e=>{
 const add=e.target.closest("[data-add]"),detail=e.target.closest("[data-detail]");
 if(add){const id=add.dataset.add;if(chosen.includes(id))chosen=chosen.filter(x=>x!==id);else if(chosen.length===3){toast("You can compare up to 3 cars.");return}else chosen.push(id);render();compare()}
 if(detail){const c=AUTO_CARS.find(x=>x.id===detail.dataset.detail),box=document.createElement("div");box.className="modalbg";box.innerHTML='<article class="modal" role="dialog" aria-modal="true" aria-label="Car details"><button aria-label="Close">×</button><small class="eyebrow">'+safe(c.market)+' · '+safe(c.type)+'</small><h2>'+safe(c.make+" "+c.model)+'</h2><h3 class="modalprice">'+safe(c.price)+'</h3><p>'+safe(c.summary)+'</p><ul><li>Powertrain: '+safe(c.power)+'</li><li>Engine: '+safe(c.engine)+'</li><li>Transmission: '+safe(c.transmission)+'</li><li>Seats: '+safe(c.seats)+'</li><li>Mileage / range: '+safe(c.mileage)+'</li><li>Safety: '+safe(c.safety)+'</li><li>Dimensions: '+safe(c.dimensions)+'</li><li>Boot: '+safe(c.boot)+'</li></ul><p>Always verify the exact variant, model year, local price and specifications before making a purchase.</p><p class="attribution">Image: '+safe(c.imageCredit)+' · <a href="'+safe(c.source)+'" target="_blank" rel="noopener">View photographer &amp; licence details ↗</a></p><p class="attribution"><a href="'+safe(c.priceSource)+'" target="_blank" rel="noopener">Check latest price and variant details ↗</a></p></article>';document.body.append(box);const close=()=>box.remove();box.querySelector("button").onclick=close;box.onclick=e=>{if(e.target===box)close()};document.addEventListener("keydown",function esc(ev){if(ev.key==="Escape"){close();document.removeEventListener("keydown",esc)}})}
});
["search","market","body","fuel","sort"].forEach(id=>$(id).addEventListener("input",render));
$("clear").onclick=()=>{chosen=[];render();compare()};
function toast(msg){$("toast").textContent=msg;$("toast").style.display="block";setTimeout(()=>$("toast").style.display="none",2200)}
function emi(){const p=Math.max(0,+$("amount").value||0),annual=Math.max(0,Math.min(40,+$("rate").value||0)),r=annual/1200,n=(+$("years").value||1)*12,v=r===0?p/n:p*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1),total=v*n;$("emi").textContent=rupees(v||0);$("yearLabel").textContent=$("years").value+" years";$("loanSummary").textContent="Total repayment: "+rupees(total)+" · Interest: "+rupees(total-p)}
function fuelCost(){const d=Math.max(0,+$("distance").value||0),e=Math.max(.1,+$("efficiency").value||.1),p=Math.max(0,+$("price").value||0),units=d/e,cost=units*p;$("fuelCost").textContent=rupees(cost);$("fuelSummary").textContent=units.toFixed(1)+" litres / kWh estimated per month"}
function onRoad(){const p=Math.max(0,+$("exPrice").value||0),tax=Math.max(0,Math.min(40,+$("taxRate").value||0))/100,other=Math.max(0,+$("otherCost").value||0);$("onRoad").textContent=rupees(p+p*tax+other)}
["amount","rate","years"].forEach(id=>$(id).addEventListener("input",emi));
["distance","efficiency","price"].forEach(id=>$(id).addEventListener("input",fuelCost));
["exPrice","taxRate","otherCost"].forEach(id=>$(id).addEventListener("input",onRoad));
$("menu").onclick=()=>{const open=$("nav").classList.toggle("open");$("menu").setAttribute("aria-expanded",String(open))};
document.querySelectorAll("#nav a").forEach(a=>a.onclick=()=>{$("nav").classList.remove("open");$("menu").setAttribute("aria-expanded","false")});
$("year").textContent=new Date().getFullYear();render();compare();emi();fuelCost();onRoad();