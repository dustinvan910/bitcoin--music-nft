// Guitar sound implementation using Tone.js
class GuitarSynth {
    constructor() {
        // Create the main components
        this.oscillator = new Tone.Oscillator({
            type: 'triangle',
            frequency: 440,
            volume: -10
        });

        // Add some effects to make it sound more guitar-like
        this.filter = new Tone.Filter({
            frequency: 2000,
            type: 'lowpass',
            rolloff: -12,
            Q: 1
        });

        this.distortion = new Tone.Distortion({
            distortion: 0.2
        });

        this.reverb = new Tone.Reverb({
            decay: 0.5,
            wet: 0.2
        });

        // Connect the components
        this.oscillator.chain(
            this.filter,
            this.distortion,
            this.reverb,
            Tone.Destination
        );
    }

    // Play a note
    playNote(frequency, duration = '8n') {
        this.oscillator.frequency.setValueAtTime(frequency, Tone.now());
        this.oscillator.start();
        
        // Add some attack and release to make it sound more natural
        this.oscillator.volume.setValueAtTime(-20, Tone.now());
        this.oscillator.volume.linearRampToValueAtTime(-10, Tone.now() + 0.1);
        this.oscillator.volume.linearRampToValueAtTime(-20, Tone.now() + Tone.Time(duration).toSeconds());
        
        // Stop the oscillator after the note duration
        this.oscillator.stop(Tone.now() + Tone.Time(duration).toSeconds());
    }

    // Play a chord
    playChord(notes, duration = '8n') {
        notes.forEach(note => {
            this.playNote(note, duration);
        });
    }

    // Stop all sound
    stop() {
        this.oscillator.stop();
    }
}

// Example usage:
const guitar = new GuitarSynth();

// Create a button to play a test chord
window.addEventListener('load', () => {
    const button = document.createElement('button');
    button.textContent = 'Play Guitar Chord';
    button.addEventListener('click', () => {
        // Play an A major chord (A, C#, E)
        guitar.playChord([440, 554.37, 659.25]);
    });
    document.body.appendChild(button);
}); 