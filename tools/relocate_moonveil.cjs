/* Keep the editable palace local to its origin; move its world placement off Bạch Khuyết. */
const fs=require('fs');
const file='demo/features/castle/data/moonveil-palace.js',prefix='window.MOONVEIL_PALACE_DATA=',s=fs.readFileSync(file,'utf8'),d=JSON.parse(s.slice(prefix.length).trim().replace(/;$/,''));
d.center=[0,8,450];d.channel=[[170,450],[225,420],[264,378]];
fs.writeFileSync(file,prefix+JSON.stringify(d)+';\n');
const builder='tools/build_moonlit_palace.py';fs.writeFileSync(builder,fs.readFileSync(builder,'utf8').replace('center=[-380,8,300]','center=[0,8,450]').replace('channel=[[-550,300],[-650,300],[-779,300]]','channel=[[170,450],[225,420],[264,378]]'));
for(const p of ['docs/MOONVEIL_PALACE.md','CONVERSATION_HANDOFF.md'])fs.writeFileSync(p,fs.readFileSync(p,'utf8').replaceAll('(-380, 8, 300)','(0, 8, 450)').replaceAll('(-380,8,300)','(0,8,450)').replaceAll('(-779,300)','(264,378)').replaceAll('phía tây nam vùng bản đồ ban đầu','vùng đồng bằng phía nam bản đồ ban đầu'));
