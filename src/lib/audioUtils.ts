// src/lib/audioUtils.ts

export let isGlobalMuted = false;

export const setGlobalMuted = (muted: boolean) => {
  isGlobalMuted = muted;
};

export const playCorrectSound = () => {
  if (isGlobalMuted) return;
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(880, audioCtx.currentTime + 0.15);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.15);
  } catch (e) {
    console.warn("Web Audio API disabled or blocked:", e);
  }
};

export const playWrongSound = () => {
  if (isGlobalMuted) return;
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(90, audioCtx.currentTime + 0.25);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.25);
  } catch (e) {
    console.warn("Web Audio API disabled or blocked:", e);
  }
};

export const playBuySound = () => {
  if (isGlobalMuted) return;
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (!audioCtx) return;
    
    const playTone = (freq: number, startTime: number, duration: number) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, startTime);
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      gainNode.gain.setValueAtTime(0.15, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    };
    
    playTone(880, audioCtx.currentTime, 0.05);
    playTone(1318.51, audioCtx.currentTime + 0.05, 0.15);
  } catch (e) {
    console.warn("Web Audio API disabled or blocked:", e);
  }
};

let bgmAudioCtx: AudioContext | null = null;
let bgmTimerID: NodeJS.Timeout | null = null;
let isBgmPlaying = false;
let nextNoteTime = 0;
let current16thNote = 0;
const tempo = 120;
const lookahead = 25.0; // ms
const scheduleAheadTime = 0.1; // s
let masterGain: GainNode | null = null;

function nextNote() {
    const secondsPerBeat = 60.0 / tempo;
    nextNoteTime += 0.25 * secondsPerBeat; // 16th note
    current16thNote++;
    if (current16thNote === 32) {
        current16thNote = 0;
    }
}

function playDrum(type: string, time: number) {
    if (!bgmAudioCtx || !masterGain) return;
    const osc = bgmAudioCtx.createOscillator();
    const gain = bgmAudioCtx.createGain();
    osc.connect(gain);
    gain.connect(masterGain);
    
    if (type === 'kick') {
        osc.frequency.setValueAtTime(120, time);
        osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.1);
        gain.gain.setValueAtTime(0.3, time); // boosted
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
        osc.start(time);
        osc.stop(time + 0.1);
    } else if (type === 'snare') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(250, time);
        gain.gain.setValueAtTime(0.15, time); // boosted
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
        osc.start(time);
        osc.stop(time + 0.1);
    } else if (type === 'hihat') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, time);
        gain.gain.setValueAtTime(0.05, time); // boosted
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
        osc.start(time);
        osc.stop(time + 0.05);
    }
}

function playBass(freq: number, time: number) {
    if (!bgmAudioCtx || !masterGain) return;
    const osc = bgmAudioCtx.createOscillator();
    const gain = bgmAudioCtx.createGain();
    const filter = bgmAudioCtx.createBiquadFilter();
    
    osc.type = 'sawtooth';
    osc.frequency.value = freq;
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, time);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    
    gain.gain.setValueAtTime(0.15, time); // boosted
    gain.gain.linearRampToValueAtTime(0.01, time + 0.2);
    
    osc.start(time);
    osc.stop(time + 0.2);
}

function playLead(freq: number, time: number) {
    if (!bgmAudioCtx || !masterGain) return;
    const osc = bgmAudioCtx.createOscillator();
    const gain = bgmAudioCtx.createGain();
    
    osc.type = 'triangle'; // Soft kid-friendly tone
    osc.frequency.value = freq;
    
    osc.connect(gain);
    gain.connect(masterGain);
    
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.15, time + 0.02); // boosted
    gain.gain.linearRampToValueAtTime(0.05, time + 0.1);
    gain.gain.linearRampToValueAtTime(0, time + 0.3);
    
    osc.start(time);
    osc.stop(time + 0.3);
}

function scheduleNote(beatNumber: number, time: number) {
    if (beatNumber % 8 === 0) playDrum('kick', time);
    if (beatNumber % 8 === 4) playDrum('snare', time);
    if (beatNumber % 2 === 0) playDrum('hihat', time);
    
    if (beatNumber % 2 === 0) {
        const notes = [
           65.41, 65.41, 65.41, 65.41, 
           98.00, 98.00, 98.00, 98.00, 
           110.00, 110.00, 110.00, 110.00, 
           87.31, 87.31, 87.31, 87.31 
        ];
        const n = notes[Math.floor(beatNumber / 2) % 16];
        playBass(n, time);
    }
    
    if (beatNumber === 0) playLead(392.00, time);
    if (beatNumber === 3) playLead(329.63, time);
    if (beatNumber === 6) playLead(261.63, time);
    if (beatNumber === 10) playLead(293.66, time);
    if (beatNumber === 14) playLead(329.63, time);
    
    if (beatNumber === 16) playLead(440.00, time);
    if (beatNumber === 19) playLead(392.00, time);
    if (beatNumber === 22) playLead(329.63, time);
    if (beatNumber === 26) playLead(261.63, time);
    if (beatNumber === 30) playLead(293.66, time);
}

function scheduler() {
    if (!isBgmPlaying || !bgmAudioCtx) return;
    
    while (nextNoteTime < bgmAudioCtx.currentTime + scheduleAheadTime) {
        scheduleNote(current16thNote, nextNoteTime);
        nextNote();
    }
    bgmTimerID = setTimeout(scheduler, lookahead);
}

export const startBGM = () => {
    if (isGlobalMuted) return;
    if (isBgmPlaying) {
        if (bgmAudioCtx && bgmAudioCtx.state === 'suspended') {
            bgmAudioCtx.resume();
        }
        return;
    }
    try {
        bgmAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (!bgmAudioCtx) return;
        
        masterGain = bgmAudioCtx.createGain();
        masterGain.connect(bgmAudioCtx.destination);
        // "Increase volume to 25 over 50 volume percent" 
        // We'll set master gain to a loud but reasonable level (0.25 - 0.5 range)
        masterGain.gain.value = 0.35; 
        
        isBgmPlaying = true;
        current16thNote = 0;
        nextNoteTime = bgmAudioCtx.currentTime + 0.1;
        scheduler();
        
        if (bgmAudioCtx.state === 'suspended') {
            const resumeAudio = () => {
                bgmAudioCtx?.resume();
                document.removeEventListener('click', resumeAudio);
                document.removeEventListener('touchstart', resumeAudio);
            };
            document.addEventListener('click', resumeAudio);
            document.addEventListener('touchstart', resumeAudio);
        }
    } catch (e) {
        console.warn("BGM disabled", e);
    }
};

export const stopBGM = () => {
    isBgmPlaying = false;
    if (bgmTimerID) {
        clearTimeout(bgmTimerID);
        bgmTimerID = null;
    }
    if (bgmAudioCtx) {
        bgmAudioCtx.close().catch(() => {});
        bgmAudioCtx = null;
    }
};

export const toggleBGM = () => {
    if (isBgmPlaying) {
        stopBGM();
    } else {
        startBGM();
    }
};