
srcFile = "./src/audio/vocals_melody.mid"
const txID = new Date().getTime() - 0

var Instrument = ["AMSynth", "DuoSynth", "MembraneSynth", "FMSynth", "MonoSynth", "Piano"]
var EDO = [5]
Instrument = ["Piano"]

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

// Analyser for Spectrogram
let fftSize = 2048
const analyzer = new Tone.Analyser("fft", fftSize);
let fftInterval
window.fftWindows = [];

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
            console.log(midi.tracks.length)
            // // Prepare tracks at load
            midi.tracks.forEach(track => {
                if (selectedInstrument == "Piano" && synths.length > 1)
                    return
                console.log("track", track.name)
                switch (selectedInstrument) {
                    case "FMSynth":
                        var synth = new Tone.FMSynth().connect(analyzer).toMaster();
                        break;
                    case "AMSynth":
                        synth = new Tone.AMSynth().connect(analyzer).toMaster();
                        break;
                    case "DuoSynth":
                        synth = new Tone.DuoSynth().connect(analyzer).toMaster();
                        break;
                    case "MembraneSynth":
                        synth = new Tone.MembraneSynth().connect(analyzer).toMaster();
                        break;
                    case "MonoSynth":
                        synth = new Tone.MonoSynth().connect(analyzer).toMaster();
                        break;
                    case "Piano":
                        synth = new Tone.Sampler(samplerNotes).connect(analyzer).toMaster();
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


                let intervalTime = (128/Tone.context.sampleRate)*100
                // Start polling FFT windows when playback begins
                fftInterval = setInterval(() => {
                    const fftData = analyzer.getValue();
                    // Store the FFT data
                    window.fftWindows.push([...fftData]);
                    if(window.fftWindows.length > 512) {
                        window.fftWindows.shift();
                    }
                    // Uncomment to draw real time (can be slow)
                    drawSpectrogram();
                }, intervalTime);
                
                // Function to play one iteration of the song
                id = 1
                const playSong = (startTime) => {
                    preparedTracks.forEach(({ synth, notes }) => {
                        notes.forEach(note => {
                            // sampler.triggerAttackRelease("A0", 1, Tone.now() + id, 1);
                            if (selectedInstrument == "Piano") {
                                console.log("note", note)
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
                clearInterval(fftInterval);
                //drawSpectrogram();
            }
        })
    })

})


function drawSpectrogram() {
    const canvas = document.getElementById('spectrogram');
    const ctx = canvas.getContext('2d');
    const fftDataArray = window.fftWindows;
    ctx.imageSmoothingEnabled = false;

    if (!fftDataArray || fftDataArray.length === 0) {
        requestAnimationFrame(drawSpectrogram);
        return;
    }
    
    
    const sampleRate = Tone.context.sampleRate;
    const fftSize = analyzer.size * 2;
    const maxFreq = 6000;
    const maxBin = Math.floor((maxFreq / sampleRate) * fftSize / 2);

    const numCols = fftDataArray.length;
    const colScale = 4;
    const rowScale = 4;

    const a = 1664525;
    const c = 1013904223;
    const m = 4294967296;

    seed = (a * txID + c) % m;
    let random1 = (seed / m) * 360;

    seed = (a * seed + c) % m;
    let random2 = (seed / m) * 360;

    // Use these for your colors
    const baseHue = random1;
    const oppositeHue = random2;
    const saturation = Math.floor((((random1+random2)*100)/720)*25)+75;
    const lightStart = 10;
    const lightEnd = 100;

    // Set background to base color
    document.body.style.backgroundColor = `hsl(${baseHue}, ${saturation}%, 10%)`;
    document.getElementById("Description").style.color = "white";

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    fftDataArray.forEach((fftData, colIndex) => {
        fftData.slice(0, maxBin).forEach((value, rowIndex) => {
            // Normalize FFT value
            const fraction = Math.min(Math.max((value + 100) * 0.7 / 100, 0), 1);

            // Interpolate color
            const diff = oppositeHue - baseHue;
            const shortestPath = ((diff + 180) % 360) - 180;
            const hue = (baseHue + shortestPath * fraction + 360) % 360;
            
            const lightness = lightStart + (lightEnd - lightStart) * fraction;

            ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

            const x = canvas.width/2 - Math.floor(numCols/2)*colScale + colIndex*colScale
            const y = canvas.height - (rowIndex + 1) * rowScale;

            ctx.fillRect(x, y, colScale, rowScale);
        });
    });
    requestAnimationFrame(drawSpectrogram);
}

