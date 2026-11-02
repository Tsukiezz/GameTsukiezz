/* Real MP3, activated by a user gesture and paused outside the lobby. */
function installLobbyMusic(){
    const audio=new Audio('features/lobby/assets/audio/the-pale-lunar-tide.mp3');audio.loop=true;audio.preload='metadata';
    const home=document.getElementById('home-screen'),toggle=document.getElementById('setting-bgm-enabled'),slider=document.getElementById('slider-bgm'),status=document.getElementById('bgm-status'),output=document.getElementById('bgm-volume');let unlocked=false;
    function sync(){const s=window.tsuventureSettings?.audio||{bgm:80,bgmEnabled:true,muted:false};audio.volume=s.bgm/100;audio.muted=s.muted;const lobby=!home.classList.contains('hidden'),enabled=s.bgmEnabled&&!s.muted&&s.bgm>0;
        if(lobby&&enabled&&unlocked&&!document.hidden){audio.play().then(()=>{if(!audio.paused&&!home.classList.contains('hidden'))status.textContent='The Pale Lunar Tide · Đang phát';}).catch(()=>{if(!home.classList.contains('hidden'))status.textContent='Nhấn nút hoặc chạm sảnh để phát nhạc.';});}else{audio.pause();status.textContent=!s.bgmEnabled?'Nhạc nền đã tắt':!lobby?'Nhạc sẽ phát khi về sảnh':'The Pale Lunar Tide · Nhấn/chạm để phát';}output.textContent=s.bgm+'%';}
    const activate=()=>{unlocked=true;sync();};document.addEventListener('pointerdown',activate,{passive:true});document.addEventListener('keydown',activate);
    new MutationObserver(sync).observe(home,{attributes:true,attributeFilter:['class']});document.addEventListener('visibilitychange',sync);window.addEventListener('tsuventure-settings-saved',sync);
    audio.addEventListener('error',()=>status.textContent='Không tải được nhạc nền. Hãy tải lại trang.');
    toggle.addEventListener('change',()=>{unlocked=true;tsuventureSettings.setMusicEnabled(toggle.checked);sync();});
    slider.addEventListener('input',()=>{unlocked=true;tsuventureSettings.setMusicVolume(Number(slider.value));sync();});
    window.lobbyMusic={audio,sync};sync();
}
