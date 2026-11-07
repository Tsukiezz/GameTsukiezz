/* Exercise the actual lobby at laptop sizes, display scaling, and small windows. */
const fs=require('fs'),path=require('path');
const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function verifyLobby({cdp,evaluate,check,output}){
 for(const [width,height,scale] of [[1366,768,1],[1280,600,1],[1024,576,1.25],[800,450,1.5],[640,360,1],[375,667,1],[320,480,1],[320,256,1]]){
  await cdp('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:scale,mobile:false});await pause(150);
  const layout=await evaluate(`(()=>{
   const home=document.getElementById('home-screen');home.scrollTop=0;
   const rect=e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};};
   const sections=['.home-top','.home-center','.home-bottom'].map(s=>rect(home.querySelector(s)));
   const buttons=[...home.querySelectorAll('.btn-menu')].map(e=>{e.scrollIntoView({block:'nearest',behavior:'instant'});const r=rect(e),hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return {id:e.id,rect:r,reachable:r.top>=-1&&r.bottom<=innerHeight+1&&r.left>=-1&&r.right<=innerWidth+1&&(hit===e||e.contains(hit))};});
   home.scrollTop=0;return {width:innerWidth,height:innerHeight,scrollWidth:home.scrollWidth,clientWidth:home.clientWidth,sections,buttons};
  })()`);
  check(`Lobby ${width}x${height} @${scale}: no horizontal overflow or overlapping sections`,layout.scrollWidth<=layout.clientWidth+1&&layout.sections.every((r,i,a)=>r.left>=0&&r.right<=width+1&&(!i||r.top>=a[i-1].bottom-1)),layout);
  check(`Lobby ${width}x${height}: every menu button is reachable`,layout.buttons.every(b=>b.reachable),layout.buttons);
  if(output&&[1280,800,375,320].includes(width)){const s=await cdp('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,`lobby-${width}x${height}.png`),Buffer.from(s.data,'base64'));}
  for(const id of ['modal-heroes','modal-settings']){
   await evaluate(`document.getElementById('${id}').classList.add('active')`);await pause(50);
   const dialog=await evaluate(`(()=>{const card=document.querySelector('#${id} .modal-card'),r=card.getBoundingClientRect(),close=card.querySelector('.modal-close').getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,overflow:card.scrollWidth-card.clientWidth,closeTop:close.top,closeRight:close.right};})()`);
   check(`${id} ${width}x${height}: content and close control fit`,dialog.left>=0&&dialog.right<=width+1&&dialog.top>=0&&dialog.bottom<=height+1&&dialog.overflow<=1&&dialog.closeTop>=0&&dialog.closeRight<=width,dialog);
   await evaluate(`document.getElementById('${id}').classList.remove('active')`);
  }
 }
}
module.exports={verifyLobby};
