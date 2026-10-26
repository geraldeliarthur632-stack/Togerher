// Procedural Web Audio Engine for Together Friends
// Works completely offline with zero external audio assets

class SoundEngine {
  private ctx: AudioContext | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private isMuted: boolean = false;
  private sfxVol: number = 0.7;
  private musicVol: number = 0.4;
  private musicTimer: number | null = null;
  private isPlayingMusic: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxVol, this.ctx.currentTime);
      this.sfxGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.musicVol, this.ctx.currentTime);
      this.musicGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setVolumes(sfx: number, music: number) {
    this.sfxVol = Math.max(0, Math.min(1, sfx));
    this.musicVol = Math.max(0, Math.min(1, music));

    if (this.ctx && this.sfxGain && this.musicGain) {
      const now = this.ctx.currentTime;
      this.sfxGain.gain.setTargetAtTime(this.isMuted ? 0 : this.sfxVol, now, 0.05);
      this.musicGain.gain.setTargetAtTime(this.isMuted ? 0 : this.musicVol, now, 0.05);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    this.setVolumes(this.sfxVol, this.musicVol);
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // --- Sound Effects ---

  public playJump() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(360, now + 0.14);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  public playLand() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  public playButton(active: boolean) {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    const freq = active ? 480 : 320;
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(active ? 640 : 220, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  public playSpring() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(750, now + 0.22);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.26);
  }

  public playDoor() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.3);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.36);
  }

  public playCheckpoint() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const startTime = this.ctx.currentTime + idx * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(startTime);
      osc.stop(startTime + 0.22);
    });
  }

  public playCoin() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    // Crisp two-tone arcade coin chime: B5 -> E6
    const notes = [987.77, 1318.51];
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const startTime = this.ctx.currentTime + idx * 0.07;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.28, startTime);
      gain.gain.exponentialRampToValueAtTime(0.005, startTime + 0.22);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(startTime);
      osc.stop(startTime + 0.24);
    });
  }

  public playVictory() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    // Fanfare: C4, E4, G4, C5, E5, G5
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99];
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const startTime = this.ctx.currentTime + idx * 0.1;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = idx === notes.length - 1 ? 'triangle' : 'square';
      osc.frequency.setValueAtTime(freq, startTime);

      const duration = idx === notes.length - 1 ? 0.6 : 0.16;
      gain.gain.setValueAtTime(0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.05);
    });
  }

  public playLevelUp() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    // Level-up sparkling arpeggio: C5, E5, G5, B5, C6
    const notes = [523.25, 659.25, 783.99, 987.77, 1046.50];
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const startTime = this.ctx.currentTime + idx * 0.09;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      const duration = idx === notes.length - 1 ? 0.5 : 0.15;
      gain.gain.setValueAtTime(0.35, startTime);
      gain.gain.exponentialRampToValueAtTime(0.005, startTime + duration);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.05);
    });
  }

  public playDefeat() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.35);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.38);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.4);
  }

  public playHeadBounce() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.12);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  public playEmote() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(780, now + 0.1);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.13);
  }

  // --- Multi-Trilha Sonora do Jogo (6 Músicas Originais Procedurais) ---
  private musicType: 'playing' | 'none' = 'none';
  private currentTrackIndex: number = 0;
  private trackListeners: ((track: GameTrack) => void)[] = [];

  public getTrackList(): GameTrack[] {
    return GAME_TRACKS;
  }

  public getCurrentTrack(): GameTrack {
    return GAME_TRACKS[this.currentTrackIndex] || GAME_TRACKS[0];
  }

  public subscribeTrackChange(callback: (track: GameTrack) => void): () => void {
    this.trackListeners.push(callback);
    callback(this.getCurrentTrack());
    return () => {
      this.trackListeners = this.trackListeners.filter(cb => cb !== callback);
    };
  }

  private notifyTrackChange() {
    const track = this.getCurrentTrack();
    for (const cb of this.trackListeners) {
      try {
        cb(track);
      } catch (e) {
        console.warn(e);
      }
    }
  }

  public setTrack(trackIndex: number) {
    if (trackIndex < 0 || trackIndex >= GAME_TRACKS.length) return;
    this.currentTrackIndex = trackIndex;
    try {
      localStorage.setItem('together_music_track', String(trackIndex));
    } catch {}
    this.notifyTrackChange();
    if (this.isPlayingMusic) {
      this.stopMusic();
      this.playCurrentTrack();
    }
  }

  public nextTrack(): GameTrack {
    const nextIdx = (this.currentTrackIndex + 1) % GAME_TRACKS.length;
    this.setTrack(nextIdx);
    return this.getCurrentTrack();
  }

  public prevTrack(): GameTrack {
    const prevIdx = (this.currentTrackIndex - 1 + GAME_TRACKS.length) % GAME_TRACKS.length;
    this.setTrack(prevIdx);
    return this.getCurrentTrack();
  }

  public playLobbyMusic() {
    this.playCurrentTrack();
  }

  public playCurrentTrack() {
    if (this.isPlayingMusic) {
      this.stopMusic();
    }

    try {
      const saved = localStorage.getItem('together_music_track');
      if (saved !== null) {
        const parsed = parseInt(saved, 10);
        if (!Number.isNaN(parsed) && parsed >= 0 && parsed < GAME_TRACKS.length) {
          this.currentTrackIndex = parsed;
        }
      }
    } catch {}

    this.isPlayingMusic = true;
    this.musicType = 'playing';
    this.initContext();

    const track = this.getCurrentTrack();
    const tempo = track.bpm;
    const stepDuration = (60 / tempo) / 4; // 16th note

    // Note frequencies (Hz)
    const C2 = 65.41, D2 = 73.42, Eb2 = 77.78, E2 = 82.41, F2 = 87.31, G2 = 98.00, Ab2 = 103.83, A2 = 110.00, Bb2 = 116.54, B2 = 123.47;
    const C3 = 130.81, D3 = 146.83, Eb3 = 155.56, E3 = 164.81, F3 = 174.61, G3 = 196.00, Ab3 = 207.65, A3 = 220.00, Bb3 = 233.08, B3 = 246.94;
    const C4 = 261.63, D4 = 293.66, Eb4 = 311.13, E4 = 329.63, F4 = 349.23, G4 = 392.00, Ab4 = 415.30, A4 = 440.00, Bb4 = 466.16, B4 = 493.88;
    const C5 = 523.25, D5 = 587.33, Eb5 = 622.25, E5 = 659.25, F5 = 698.46, G5 = 783.99, Ab5 = 830.61, A5 = 880.00, Bb5 = 932.33, B5 = 987.77, C6 = 1046.50, D6 = 1174.66, E6 = 1318.51;

    // Track 0: Fall Guys x Stumble Guys Party (138 BPM)
    const t0Lead: (number | null)[] = [
      F4, null, F4, null, Ab4, null, Bb4, null, C5, null, null, C5, Bb4, null, Ab4, null,
      F4, null, Ab4, Bb4, C5, null, Eb5, null, F5, null, Eb5, C5, Bb4, C5, Ab4, F4,
      C5, null, C5, null, Eb5, null, F5, null, G5, null, null, G5, F5, null, Eb5, null,
      C5, Eb5, F5, G5, Ab5, G5, F5, Eb5, C5, null, Bb4, null, F4, null, null, null,
    ];
    const t0Brass: (number[] | null)[] = [
      null, [F3, Ab3, C4], null, null, [F3, Ab3, C4], null, null, [Ab3, C4, Eb4],
      null, [Bb3, D4, F4], null, null, [C4, Eb4, G4], null, null, null,
      null, [F3, Ab3, C4], null, [F3, Ab3, C4], null, null, [Bb3, D4, F4], null,
      null, [C4, Eb4, G4], null, null, [F3, Ab3, C4], null, null, null,
      null, [Ab3, C4, Eb4], null, null, [Bb3, D4, F4], null, null, [C4, Eb4, G4],
      null, [Eb4, G4, Bb4], null, null, [F4, Ab4, C5], null, null, null,
      [C4, Eb4, G4], null, [Bb3, D4, F4], null, [Ab3, C4, Eb4], null, [G3, Bb3, D4], null,
      [F3, Ab3, C4], null, null, null, null, null, null, null,
    ];
    const t0Bass: (number | null)[] = [
      F2, null, F3, null, F2, null, F3, null, Ab2, null, Ab3, null, Bb2, null, Bb3, null,
      F2, null, F3, null, Eb2, null, Eb3, null, Bb2, null, Bb3, null, C3, null, C2, null,
      Ab2, null, Ab3, null, Bb2, null, Bb3, null, C3, null, C4, null, Eb3, null, Eb2, null,
      C3, null, Bb2, null, Ab2, null, G2, null, F2, null, null, F3, C3, null, F2, null,
    ];

    // Track 1: Aventura 8-Bit Chiptune (144 BPM)
    const t1Lead: (number | null)[] = [
      C5, E5, G5, C6, G5, E5, C5, E5, D5, F5, A5, D6, A5, F5, D5, F5,
      E5, G5, B5, E6, B5, G5, E5, G5, C5, D5, E5, F5, G5, A5, B5, C6,
      C5, G4, E4, G4, C5, E5, G5, C6, A4, F4, D4, F4, A4, C5, F5, A5,
      G4, E4, C4, E4, G4, B4, D5, G5, C5, E5, G5, C6, null, null, null, null,
    ];
    const t1Bass: (number | null)[] = [
      C3, null, C3, null, G2, null, G2, null, D3, null, D3, null, A2, null, A2, null,
      E3, null, E3, null, B2, null, B2, null, C3, null, D3, null, E3, null, G3, null,
      C3, null, C3, null, E3, null, E3, null, F3, null, F3, null, A2, null, A2, null,
      G2, null, G2, null, B2, null, B2, null, C3, G2, C3, null, null, null, null, null,
    ];

    // Track 2: Neon Cyber Runner (128 BPM Synthwave)
    const t2Lead: (number | null)[] = [
      A4, null, C5, null, E5, null, D5, null, A4, null, C5, null, G4, null, E4, null,
      F4, null, A4, null, C5, null, B4, null, D5, null, C5, null, B4, null, G4, null,
      A4, null, E5, null, D5, null, C5, null, B4, null, C5, null, D5, null, E5, null,
      F5, null, E5, null, D5, null, C5, null, B4, null, G4, null, A4, null, null, null,
    ];
    const t2Bass: (number | null)[] = [
      A2, A2, A2, A2, A2, A2, A2, A2, F2, F2, F2, F2, G2, G2, G2, G2,
      F2, F2, F2, F2, D2, D2, D2, D2, G2, G2, G2, G2, E2, E2, E2, E2,
      A2, A2, A2, A2, C3, C3, C3, C3, D3, D3, D3, D3, E3, E3, E3, E3,
      F2, F2, F2, F2, G2, G2, G2, G2, A2, A2, A2, A2, null, null, null, null,
    ];

    // Track 3: Lofi Sunset Chill (90 BPM)
    const t3Lead: (number | null)[] = [
      F4, null, null, null, A4, null, C5, null, E5, null, null, null, D5, null, null, null,
      C5, null, null, null, A4, null, null, null, G4, null, A4, null, F4, null, null, null,
      D4, null, F4, null, A4, null, C5, null, Bb4, null, null, null, A4, null, G4, null,
      F4, null, null, null, G4, null, null, null, A4, null, null, null, null, null, null, null,
    ];
    const t3Bass: (number | null)[] = [
      D2, null, null, null, D2, null, null, null, G2, null, null, null, G2, null, null, null,
      C2, null, null, null, C2, null, null, null, F2, null, null, null, F2, null, null, null,
      Bb2, null, null, null, Bb2, null, null, null, A2, null, null, null, A2, null, null, null,
      G2, null, null, null, A2, null, null, null, D2, null, null, null, null, null, null, null,
    ];

    // Track 4: Pesadelo Extremo Boss Rush (154 BPM)
    const t4Lead: (number | null)[] = [
      D4, D4, F4, G4, Ab4, null, G4, F4, D4, D4, F4, G4, Ab4, G4, F4, Eb4,
      D4, D4, F4, G4, Ab4, null, Bb4, null, C5, null, Bb4, Ab4, G4, F4, Eb4, C4,
      D4, F4, Ab4, C5, D5, null, C5, Ab4, G4, null, F4, Eb4, D4, Eb4, F4, G4,
      Ab4, G4, F4, Eb4, D4, Eb4, D4, C4, D4, null, null, null, null, null, null, null,
    ];
    const t4Bass: (number | null)[] = [
      D2, D2, D2, D2, D2, D2, D2, D2, D2, D2, D2, D2, Eb2, Eb2, Eb2, Eb2,
      D2, D2, D2, D2, D2, D2, D2, D2, G2, G2, G2, G2, A2, A2, A2, A2,
      Bb2, Bb2, Bb2, Bb2, Ab2, Ab2, Ab2, Ab2, G2, G2, G2, G2, F2, F2, F2, F2,
      Eb2, Eb2, Eb2, Eb2, C2, C2, C2, C2, D2, null, D2, null, null, null, null, null,
    ];

    // Track 5: Carnaval & Samba da Vitória (136 BPM)
    const t5Lead: (number | null)[] = [
      G4, null, B4, null, D5, null, E5, null, G5, null, E5, null, D5, null, B4, null,
      A4, null, C5, null, E5, null, F5, null, E5, null, C5, null, A4, null, F4, null,
      G4, null, B4, null, D5, null, G5, null, A5, null, G5, E5, D5, B4, A4, G4,
      C5, null, E5, null, D5, null, B4, null, G4, null, null, null, null, null, null, null,
    ];
    const t5Bass: (number | null)[] = [
      G2, null, null, G3, null, G2, null, D3, G2, null, null, G3, null, G2, null, D3,
      A2, null, null, A3, null, A2, null, E3, A2, null, null, A3, null, A2, null, D3,
      G2, null, null, G3, null, G2, null, D3, C3, null, null, C4, null, C3, null, G3,
      D3, null, null, D4, null, D3, null, A3, G2, null, G3, null, null, null, null, null,
    ];

    let currentStep = 0;

    const scheduleStep = () => {
      if (!this.isPlayingMusic || !this.ctx || !this.musicGain || this.musicType !== 'playing') return;

      const now = this.ctx.currentTime;
      const trackId = this.currentTrackIndex;
      const stepIdx = currentStep % 64;
      const beat16 = stepIdx % 4; // 0, 1, 2, 3 in current beat

      // Select active track patterns
      let leadNote: number | null = null;
      let bassNote: number | null = null;
      let brassChord: number[] | null = null;

      switch (trackId) {
        case 1:
          leadNote = t1Lead[stepIdx] || null;
          bassNote = t1Bass[stepIdx] || null;
          break;
        case 2:
          leadNote = t2Lead[stepIdx] || null;
          bassNote = t2Bass[stepIdx] || null;
          break;
        case 3:
          leadNote = t3Lead[stepIdx] || null;
          bassNote = t3Bass[stepIdx] || null;
          break;
        case 4:
          leadNote = t4Lead[stepIdx] || null;
          bassNote = t4Bass[stepIdx] || null;
          break;
        case 5:
          leadNote = t5Lead[stepIdx] || null;
          bassNote = t5Bass[stepIdx] || null;
          break;
        default:
          leadNote = t0Lead[stepIdx] || null;
          bassNote = t0Bass[stepIdx] || null;
          brassChord = t0Brass[stepIdx] || null;
          break;
      }

      // --- DRUM SECTION ---
      if (!this.isMuted) {
        // Kick Drum
        const isKick =
          trackId === 4
            ? beat16 === 0 || (stepIdx % 8 === 6) // Rapid double kicks in Boss Rush
            : trackId === 3
            ? stepIdx % 8 === 0 || stepIdx % 8 === 6 // Relaxed lofi kick
            : beat16 === 0; // Standard four-on-the-floor

        if (isKick) {
          const kickOsc = this.ctx.createOscillator();
          const kickGain = this.ctx.createGain();

          kickOsc.type = 'sine';
          kickOsc.frequency.setValueAtTime(trackId === 4 ? 160 : 140, now);
          kickOsc.frequency.exponentialRampToValueAtTime(36, now + 0.08);

          kickGain.gain.setValueAtTime(trackId === 3 ? 0.22 : 0.32, now);
          kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

          kickOsc.connect(kickGain);
          kickGain.connect(this.musicGain);

          kickOsc.start(now);
          kickOsc.stop(now + 0.13);
        }

        // Snare / Disco Clap
        const isSnare =
          trackId === 3
            ? stepIdx % 8 === 4 // Relaxed backbeat
            : stepIdx % 8 === 4;

        if (isSnare) {
          const bufSize = this.ctx.sampleRate * 0.07;
          const noiseBuf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
          const data = noiseBuf.getChannelData(0);
          for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;

          const noiseSrc = this.ctx.createBufferSource();
          noiseSrc.buffer = noiseBuf;

          const filter = this.ctx.createBiquadFilter();
          filter.type = trackId === 1 ? 'lowpass' : 'bandpass';
          filter.frequency.value = trackId === 1 ? 1200 : trackId === 3 ? 1400 : 1900;
          filter.Q.value = 1.2;

          const snareGain = this.ctx.createGain();
          snareGain.gain.setValueAtTime(trackId === 1 ? 0.14 : 0.18, now);
          snareGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

          noiseSrc.connect(filter);
          filter.connect(snareGain);
          snareGain.connect(this.musicGain);

          noiseSrc.start(now);
          noiseSrc.stop(now + 0.08);
        }

        // Hi-Hat
        const isHiHat =
          trackId === 1
            ? stepIdx % 2 === 1
            : trackId === 4
            ? stepIdx % 2 === 0
            : beat16 === 2;

        if (isHiHat) {
          const hatBufSize = this.ctx.sampleRate * 0.04;
          const hatBuf = this.ctx.createBuffer(1, hatBufSize, this.ctx.sampleRate);
          const hatData = hatBuf.getChannelData(0);
          for (let i = 0; i < hatBufSize; i++) hatData[i] = Math.random() * 2 - 1;

          const hatSrc = this.ctx.createBufferSource();
          hatSrc.buffer = hatBuf;

          const hatFilter = this.ctx.createBiquadFilter();
          hatFilter.type = 'highpass';
          hatFilter.frequency.value = trackId === 3 ? 5500 : 8000;

          const hatGain = this.ctx.createGain();
          hatGain.gain.setValueAtTime(0.07, now);
          hatGain.gain.exponentialRampToValueAtTime(0.002, now + 0.04);

          hatSrc.connect(hatFilter);
          hatFilter.connect(hatGain);
          hatGain.connect(this.musicGain);

          hatSrc.start(now);
          hatSrc.stop(now + 0.045);
        }

        // Special Whistle in Samba & Party Tracks
        if ((trackId === 0 || trackId === 5) && stepIdx === 60) {
          const whistleOsc = this.ctx.createOscillator();
          const whistleGain = this.ctx.createGain();

          whistleOsc.type = 'sine';
          whistleOsc.frequency.setValueAtTime(950, now);
          whistleOsc.frequency.exponentialRampToValueAtTime(1800, now + stepDuration * 2.8);

          whistleGain.gain.setValueAtTime(0.12, now);
          whistleGain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration * 3);

          whistleOsc.connect(whistleGain);
          whistleGain.connect(this.musicGain);

          whistleOsc.start(now);
          whistleOsc.stop(now + stepDuration * 3.1);
        }
      }

      // --- BRASS CHORDS (Track 0) ---
      if (brassChord && !this.isMuted) {
        for (const freq of brassChord) {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const filter = this.ctx.createBiquadFilter();

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(800, now);
          filter.frequency.exponentialRampToValueAtTime(3200, now + 0.04);
          filter.frequency.exponentialRampToValueAtTime(900, now + stepDuration * 1.5);
          filter.Q.value = 2.5;

          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.002, now + stepDuration * 1.6);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.musicGain);

          osc.start(now);
          osc.stop(now + stepDuration * 1.8);
        }
      }

      // --- LEAD MELODY ---
      if (leadNote && !this.isMuted) {
        const leadOsc = this.ctx.createOscillator();
        const leadGain = this.ctx.createGain();

        // Synth instrument timbre per track
        if (trackId === 1) {
          // Pure 8-bit NES square wave
          leadOsc.type = 'square';
          leadGain.gain.setValueAtTime(0.11, now);
        } else if (trackId === 2) {
          // Cyber sawtooth with slight detune
          leadOsc.type = 'sawtooth';
          leadGain.gain.setValueAtTime(0.13, now);
        } else if (trackId === 3) {
          // Cozy warm sine/triangle Rhodes
          leadOsc.type = 'sine';
          leadGain.gain.setValueAtTime(0.16, now);
        } else if (trackId === 4) {
          // Aggressive boss square
          leadOsc.type = 'square';
          leadGain.gain.setValueAtTime(0.14, now);
        } else {
          // Bouncy party triangle / square
          leadOsc.type = stepIdx % 2 === 0 ? 'square' : 'triangle';
          leadGain.gain.setValueAtTime(0.14, now);
        }

        leadOsc.frequency.setValueAtTime(leadNote, now);
        leadGain.gain.exponentialRampToValueAtTime(0.002, now + stepDuration * 1.7);

        leadOsc.connect(leadGain);
        leadGain.connect(this.musicGain);

        leadOsc.start(now);
        leadOsc.stop(now + stepDuration * 1.8);
      }

      // --- BASS SECTION ---
      if (bassNote && !this.isMuted) {
        const bOsc = this.ctx.createOscillator();
        const bGain = this.ctx.createGain();

        if (trackId === 1) {
          bOsc.type = 'triangle';
          bGain.gain.setValueAtTime(0.18, now);
        } else if (trackId === 2) {
          bOsc.type = 'sawtooth';
          bGain.gain.setValueAtTime(0.15, now);
        } else if (trackId === 3) {
          bOsc.type = 'sine';
          bGain.gain.setValueAtTime(0.24, now);
        } else {
          bOsc.type = 'triangle';
          bGain.gain.setValueAtTime(0.22, now);
        }

        bOsc.frequency.setValueAtTime(bassNote, now);
        bGain.gain.exponentialRampToValueAtTime(0.01, now + stepDuration * 1.4);

        bOsc.connect(bGain);
        bGain.connect(this.musicGain);

        bOsc.start(now);
        bOsc.stop(now + stepDuration * 1.5);
      }

      currentStep++;
      this.musicTimer = window.setTimeout(scheduleStep, stepDuration * 1000);
    };

    scheduleStep();
  }

  public startMusic() {
    this.playCurrentTrack();
  }

  public stopMusic() {
    this.isPlayingMusic = false;
    this.musicType = 'none';
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }
}

export interface GameTrack {
  id: number;
  name: string;
  genre: string;
  bpm: number;
  description: string;
}

export const GAME_TRACKS: GameTrack[] = [
  {
    id: 0,
    name: 'Stumble & Fall Party',
    genre: 'Party Arcade / Brass Pop',
    bpm: 138,
    description: 'A fusão contagiante de Stumble Guys e Fall Guys com metais, kick marcante e slap bass!',
  },
  {
    id: 1,
    name: 'Aventura 8-Bit Chiptune',
    genre: 'Retro Chiptune / Arcade',
    bpm: 144,
    description: 'Arpejos clássicos nostálgicos de Game Boy / NES para correr nas plataformas!',
  },
  {
    id: 2,
    name: 'Neon Cyber Runner',
    genre: 'Synthwave / Electro Pulse',
    bpm: 128,
    description: 'Linha de baixo sintética potente com arpejos cibernéticos e sintetizador analógico!',
  },
  {
    id: 3,
    name: 'Lofi Sunset Chill',
    genre: 'Cozy Lofi / Chillhop',
    bpm: 90,
    description: 'Acordes quentes de piano Rhodes e batida suave para relaxar resolvendo quebra-cabeças!',
  },
  {
    id: 4,
    name: 'Pesadelo Extremo (Boss Rush)',
    genre: 'Hardcore Arcade / Speedrun',
    bpm: 154,
    description: 'Batida acelerada com escala menor intensa para os níveis mais difíceis do Mundo 2!',
  },
  {
    id: 5,
    name: 'Carnaval & Samba da Vitória',
    genre: 'Samba Funk / Fanfarra',
    bpm: 136,
    description: 'Apito de carnaval, surdo balançado e metais alegres para comemorar vitórias!',
  },
];

export const sound = new SoundEngine();

