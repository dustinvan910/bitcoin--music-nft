
srcFile = "/content/c1ef3f41627282e2222de1f283991f70809fc00fcad21bd121da6f8d920ab3bei0"
srcFile = "./src/audio/SERENATA.MID"
const txID = new Date().getTime() - 0

var Instrument = ["AMSynth", "DuoSynth", "MembraneSynth", "FMSynth", "MonoSynth", "Piano"]
var EDO = [5]


const hash = txID % Instrument.length;
const hashEDO = txID % EDO.length;


const selectedInstrument = Instrument[hash];
// const selectedInstrument = "Piano";
const selectedEDO = EDO[hashEDO];
const nearbyEDOFreqs = Array.from({ length: 139 }, (_, i) => i - 70).map(offset => {
    const steps = offset;
    return 440 * Math.pow(2, steps / selectedEDO);
});

toneshifts = Array.from({ length: selectedEDO * 2 }, (_, i) => i - selectedEDO)
const tonehash = txID % toneshifts.length;
const toneshift = toneshifts[tonehash];
console.log("selectedInstrument", selectedInstrument)
console.log("selectedEDO", selectedEDO)
console.log("toneshift", toneshift)

const noteNames = [
    'A0', 'C1', 'D#1', 'F#1', 'A1', 
    'C2', 'D#2', 'F#2', 'A2',
    'C3', 'D#3', 'F#3', 'A3',
    'C4', 'D#4', 'F#4', 'A4',
    'C5', 'D#5', 'F#5', 'A5',
    'C6', 'D#6', 'F#6', 'A6',
    'C7', 'D#7', 'F#7', 'A7',
    'C8'
];

const baseURL = "https://tonejs.github.io/audio/salamander/";

// Create an object to store blob URLs
const blobUrls = {};

// Preload all audio files and create blob URLs
var samplerNotes
var sampler
Promise.all(noteNames.map(async note => {
    blobUrls[note] = "";
    if (selectedInstrument == "Piano") {
        const fileName = note.replace('#', 's') + '.mp3';
        const url = baseURL + fileName;
        const response = await fetch(url);
        const blob = await response.blob();
        blobUrls[note] = URL.createObjectURL(blob);
    }
})).then(() => {
    samplerNotes = noteNames.reduce((obj, note) => {
        obj[note] = blobUrls[note];
        return obj;
    }, {});
    console.log("all loaded");
}).then(() => {
    console.log("samplerNotes", samplerNotes);


    Midi.fromUrl(srcFile).then(midi => {

        document.querySelector('tone-play-toggle').removeAttribute('disabled')
        document.querySelector('#Status').textContent = ''
        //synth playback
        const synths = []
        const preparedTracks = []
            
            // // Prepare tracks at load
            midi.tracks.forEach(track => {
                if (selectedInstrument == "Piano" && synths.length > 1)
                    return
                console.log("track", track.name)
                switch (selectedInstrument) {
                    case "FMSynth":
                        var synth = new Tone.FMSynth().toMaster();
                        break;
                    case "AMSynth":
                        synth = new Tone.AMSynth().toMaster();
                        break;
                    case "DuoSynth":
                        synth = new Tone.DuoSynth().toMaster();
                        break;
                    case "MembraneSynth":
                        synth = new Tone.MembraneSynth().toMaster();
                        break;
                    case "MonoSynth":
                        synth = new Tone.MonoSynth().toMaster();
                        break;
                    case "Piano":
                        synth = new Tone.Sampler(samplerNotes).toMaster();
                        break;
                }
    
                synths.push(synth)
                preparedTracks.push({ synth, notes: track.notes })
            })
            document.querySelector('tone-play-toggle').addEventListener('play', (e) => {
    
            const playing = e.detail
            if (playing) {
                const now = Tone.now() 
                const playbackSpeed = 0.7 + Math.random() * 0.8; // Random speed between 0.7 and 1.5
                console.log("playbackSpeed", playbackSpeed)
                
                // Function to play one iteration of the song
                id = 1
                const playSong = (startTime) => {
                    preparedTracks.forEach(({ synth, notes }) => {
                        notes.forEach(note => {
                            // sampler.triggerAttackRelease("A0", 1, Tone.now() + id, 1);
                            if (selectedInstrument == "Piano") {
                                const baseFreq = Tone.Frequency(note.name).toFrequency();
                                const shiftedFreq = baseFreq * Math.pow(2, toneshift / 12); // Shift by semitones
                                synth.triggerAttackRelease(shiftedFreq, note.duration / playbackSpeed, (note.time + startTime) / playbackSpeed, note.velocity)
                            } else {
                                const baseFreq = Tone.Frequency(note.name).toFrequency();
                                // Find closest EDO frequency
                                const adjustedFreq = nearbyEDOFreqs.reduce((closest, freq) =>
                                    Math.abs(freq - baseFreq) < Math.abs(closest - baseFreq) ? freq : closest
                                );
    
                                // Apply frequency shift if needed
                                const shiftedFreq = adjustedFreq * Math.pow(2, toneshift / selectedEDO); // Shift by semitones
                                synth.triggerAttackRelease(shiftedFreq, note.duration / playbackSpeed, (note.time + startTime) / playbackSpeed, note.velocity)
                            }
    
                        })
                    })
    
                    // Schedule next iteration
                    Tone.Transport.schedule(() => {
                        playSong(startTime + midi.duration);
                    }, startTime + midi.duration);
                }
    
                // Start the first iteration
                playSong(now);
    
            } else {
                //dispose the synth and make a new one
                while (synths.length) {
                    const synth = synths.shift()
                    synth.dispose()
                }
                // Clear all scheduled events when stopping
                Tone.Transport.cancel();
            }
        })
    })

})


