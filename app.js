"use strict";
// Deterministic, fictional portfolio dataset. No external data or network requests.
const pad=n=>String(n).padStart(2,"0");
const today=new Date();today.setHours(12,0,0,0);
const channels=["In Store","Online","WhatsApp","Marketplace"];
const categories=["Groceries","Electronics","Clothing","Home & Living","Beauty"];
const customers=["Ayesha Khan","Ali Raza","Sana Ahmed","Bilal Shah","Fatima Noor","Hamza Malik","Zara Iqbal","Usman Tariq","Hina Abbas","Danish Ali"];
const products=[["Rice 5kg","GR-105",3],["Bluetooth Speaker","EL-209",2],["Cotton T-Shirt","CL-304",6],["LED Bulb","HM-418",4],["Face Wash","BT-520",1]];
const orders=Array.from({length:360},(_,i)=>{
 const date=new Date(today);date.setDate(today.getDate()-(i%90));
 const amount=650+((i*791+97)%13350);
 return {id:"IB-"+String(10001+i),date:date.toISOString().slice(0,10),customer:customers[(i*7)%customers.length],channel:channels[(i*3+Math.floor(i/5))%channels.length],category:categories[(i*7+Math.floor(i/3))%categories.length],amount,status:i%19===0?"Cancelled":i%11===0?"Pending":"Completed"};
});
const $=id=>document.getElementById(id);
const money=n=>"Rs "+Math.round(n).toLocaleString("en-PK");
const escapeCsv=s=>'"'+String(s).replaceAll('"','""')+'"';
let current=[];
function make(tag,className,text){const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=String(text);return el}
function progress(container,label,value,max,color){const row=make("div","bar-row");const info=make("div","bar-info");info.append(make("span","",label),make("strong","",money(value)));const track=make("div","track");const fill=make("div","fill");fill.style.width=(max?value/max*100:0)+"%";if(color)fill.style.background=color;track.append(fill);row.append(info,track);container.append(row)}
function chart(rows,days){
 const byDate=new Map();for(let i=days-1;i>=0;i--){const d=new Date(today);d.setDate(today.getDate()-i);byDate.set(d.toISOString().slice(0,10),0)}
 for(const o of rows)if(o.status!=="Cancelled")byDate.set(o.date,(byDate.get(o.date)||0)+o.amount);
 const points=[...byDate.values()],max=Math.max(1,...points),w=720,h=218,l=54,r=12,t=12,b=30,iw=w-l-r,ih=h-t-b;
 const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");svg.setAttribute("viewBox",`0 0 ${w} ${h}`);svg.setAttribute("role","img");svg.setAttribute("aria-label",`Revenue trend for the last ${days} days`);
 function el(tag,attrs,text){const x=document.createElementNS(svg.namespaceURI,tag);for(const [k,v] of Object.entries(attrs))x.setAttribute(k,v);if(text!==undefined)x.textContent=text;svg.append(x);return x}
 for(let i=0;i<=4;i++){const y=t+ih*i/4;el("line",{x1:l,y1:y,x2:w-r,y2:y,stroke:"#e8edf7","stroke-dasharray":"4 5"});el("text",{x:l-8,y:y+4,"text-anchor":"end",fill:"#97a3b5","font-size":"11"},Math.round(max*(4-i)/4/1000)+"k")}
 const coords=points.map((v,i)=>[l+(points.length===1?iw/2:i*iw/(points.length-1)),t+ih-v/max*ih]);
 const line=coords.map(([x,y],i)=>(i?"L":"M")+x.toFixed(1)+" "+y.toFixed(1)).join(" ");
 const area=line+` L${coords.at(-1)[0]} ${t+ih} L${coords[0][0]} ${t+ih} Z`;
 el("path",{d:area,fill:"#e9edff"});el("path",{d:line,fill:"none",stroke:"#536ff0","stroke-width":"3","stroke-linecap":"round","stroke-linejoin":"round"});
 const keys=[...byDate.keys()];for(let i=0;i<5;i++){const idx=Math.round((keys.length-1)*i/4),x=l+idx*iw/(keys.length-1||1);el("text",{x,y:h-8,"text-anchor":"middle",fill:"#97a3b5","font-size":"11"},keys[idx].slice(5))}
 $("chart").replaceChildren(svg);$("chartPeriod").textContent=days+" days · Sample data";
}
function render(){
 const days=Number($("range").value);const cutoff=new Date(today);cutoff.setDate(today.getDate()-(days-1));const start=cutoff.toISOString().slice(0,10);
 current=orders.filter(o=>o.date>=start);
 const valid=current.filter(o=>o.status!=="Cancelled");
 const revenue=valid.reduce((s,o)=>s+o.amount,0),count=valid.length,profit=Math.round(revenue*.24);
 $("revenue").textContent=money(revenue);$("orderCount").textContent=count.toLocaleString("en-PK");$("aov").textContent=money(count?revenue/count:0);$("profit").textContent=money(profit);$("margin").textContent="Estimated margin: 24% (demo assumption)";
 chart(current,days);
 const channelsTotal=Object.fromEntries(channels.map(c=>[c,0]));const categoryTotal=Object.fromEntries(categories.map(c=>[c,0]));
 for(const o of valid){channelsTotal[o.channel]+=o.amount;categoryTotal[o.category]+=o.amount}
 $("channelList").replaceChildren();const colors=["#526ff0","#8e71e7","#35b69b","#f1b55c"];channels.forEach((c,i)=>progress($("channelList"),c,channelsTotal[c],revenue,colors[i]));
 $("categoryList").replaceChildren();Object.entries(categoryTotal).sort((a,b)=>b[1]-a[1]).forEach(([c,v])=>progress($("categoryList"),c,v,revenue));
 $("stockList").replaceChildren();for(const [name,sku,qty] of products){const row=make("div","stock-row");const info=make("div");info.append(make("div","stock-name",name),make("span","stock-sku",sku));row.append(info,make("span","stock-pill"+(qty<=2?" critical":""),qty+" left"));$("stockList").append(row)}
 $("orderLabel").textContent=current.length+" sample orders";
 $("orderRows").replaceChildren();for(const o of current.slice(0,12)){const tr=make("tr");[o.id,o.customer,o.date,o.channel,money(o.amount)].forEach(v=>tr.append(make("td","",v)));const td=make("td");td.append(make("span","status "+o.status.toLowerCase(),o.status));tr.append(td);$("orderRows").append(tr)}
}
$("range").addEventListener("change",render);
$("download").addEventListener("click",()=>{const header=["Order ID","Customer","Date","Channel","Category","Amount PKR","Status"];const rows=[header,...current.map(o=>[o.id,o.customer,o.date,o.channel,o.category,o.amount,o.status])];const csv=rows.map(r=>r.map(escapeCsv).join(",")).join("\r\n");const blob=new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8"});const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="insightboard-orders-"+$("range").value+"days.csv";a.click();setTimeout(()=>URL.revokeObjectURL(url),1500)});
render();