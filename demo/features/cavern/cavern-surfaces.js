/* World-scale planar UVs and flat stone faces; no ambient cave light. */
function cavernSurfaceGeometry(source){
    const geo=source.toNonIndexed();source.dispose();geo.computeVertexNormals();const p=geo.attributes.position,n=geo.attributes.normal,uv=[];
    for(let i=0;i<p.count;i++){const x=Math.abs(n.getX(i)),y=Math.abs(n.getY(i)),z=Math.abs(n.getZ(i));uv.push((x>y&&x>z?p.getZ(i):p.getX(i))/3,(y>x&&y>z?p.getZ(i):p.getY(i))/3);}
    geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));return geo;
}
function cavernStoneTexture(){
    const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d');let seed=137;const rand=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
    const image=ctx.createImageData(256,256);for(let i=0;i<image.data.length;i+=4){const v=150+rand()*60;image.data[i]=v;image.data[i+1]=v;image.data[i+2]=v;image.data[i+3]=255;}ctx.putImageData(image,0,0);
    for(let i=0;i<170;i++){const x=rand()*256,y=rand()*256,r=1+rand()*8;ctx.fillStyle='rgba(35,38,44,.25)';ctx.beginPath();ctx.ellipse(x,y,r,r*.5,rand()*3,0,Math.PI*2);ctx.fill();}
    ctx.strokeStyle='rgba(25,28,34,.32)';ctx.lineWidth=2;for(let y=0;y<256;y+=64){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(256,y);ctx.stroke();for(let x=(y/64%2)*64;x<256;x+=128){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y+64);ctx.stroke();}}
    const texture=new THREE.CanvasTexture(c);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.anisotropy=4;return texture;
}
