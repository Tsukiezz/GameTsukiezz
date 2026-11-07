        // =====================================================================
        // AUDIO SYNTHESIZER (WEB AUDIO API)
        // =====================================================================
        class SoundFX {
            constructor() {
                this.ctx = null;
                this.bgmGain = null;
                this.sfxGain = null;
                this.muted = false;
            }
            init() {
                if (!this.ctx) {
                    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
                    this.bgmGain = this.ctx.createGain();
                    this.sfxGain = this.ctx.createGain();
                    this.bgmGain.gain.value = 0.6;
                    this.sfxGain.gain.value = 0.8;
                    this.bgmGain.connect(this.ctx.destination);
                    this.sfxGain.connect(this.ctx.destination);
                    // The lobby uses the supplied MP3; avoid overlapping synthesized BGM.
                }
            }
            playTone(freq, type = 'sine', duration = 0.2, gainVal = 0.15) {
                if (!this.ctx || this.muted) return;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = type;
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
                gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
                osc.connect(gain);
                gain.connect(this.sfxGain);
                osc.start();
                osc.stop(this.ctx.currentTime + duration);
            }
            buttonHover() {
                this.playTone(880, 'sine', 0.08, 0.05);
            }
            buttonClick() {
                this.playTone(440, 'triangle', 0.15, 0.15);
                setTimeout(() => this.playTone(660, 'sine', 0.2, 0.12), 60);
            }
            attackSound(isMagic = false) {
                if (!this.ctx || this.muted) return;
                if (!isMagic) {
                    // Whoosh kiếm
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(420, this.ctx.currentTime);
                    osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.16);
                    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.16);
                    osc.connect(gain);
                    gain.connect(this.sfxGain);
                    osc.start();
                    osc.stop(this.ctx.currentTime + 0.16);
                } else {
                    // Tiếng bắn phép thuật tím
                    this.playTone(720, 'sine', 0.25, 0.2);
                    setTimeout(() => this.playTone(960, 'sine', 0.35, 0.22), 80);
                }
            }
            pickup() {
                this.playTone(523.25, 'sine', 0.1, 0.18);
                setTimeout(() => this.playTone(659.25, 'sine', 0.1, 0.18), 80);
                setTimeout(() => this.playTone(783.99, 'sine', 0.25, 0.2), 160);
                setTimeout(() => this.playTone(1046.50, 'sine', 0.4, 0.22), 240);
            }
            typewriter() {
                this.playTone(650 + Math.random() * 150, 'square', 0.03, 0.03);
            }
            portalOpen() {
                if (!this.ctx || this.muted) return;
                [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
                    setTimeout(() => this.playTone(f, 'sine', 0.8, 0.15), i * 140);
                });
            }
            startAmbientMusic() {
                const chords = [
                    [220, 261.63, 329.63], // Am
                    [174.61, 220, 261.63], // F
                    [196, 246.94, 293.66], // G
                    [164.81, 196, 246.94]  // Em
                ];
                let cur = 0;
                const loop = () => {
                    if (!this.ctx) return;
                    if (!this.muted) {
                        const chord = chords[cur];
                        chord.forEach(freq => {
                            const osc = this.ctx.createOscillator();
                            const gain = this.ctx.createGain();
                            osc.type = 'sine';
                            osc.frequency.setValueAtTime(freq * 0.5, this.ctx.currentTime);
                            gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
                            gain.gain.linearRampToValueAtTime(0.035, this.ctx.currentTime + 1.5);
                            gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 4.8);
                            osc.connect(gain);
                            gain.connect(this.bgmGain);
                            osc.start();
                            osc.stop(this.ctx.currentTime + 5.0);
                        });
                    }
                    cur = (cur + 1) % chords.length;
                    setTimeout(loop, 4600);
                };
                loop();
            }
        }
        const sfx = new SoundFX();

        // Button hover sound binding
        document.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('mouseenter', () => sfx.buttonHover());
            btn.addEventListener('click', () => sfx.buttonClick());
        });

