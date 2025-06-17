document.addEventListener('DOMContentLoaded', () => {
        // Get the script tag and its attributes
        const scriptTag = document.getElementsByTagName('script')[0];
        const contentId = scriptTag ? scriptTag.getAttribute('id') : null;
        const collection = scriptTag ? scriptTag.getAttribute('collection') : null;
        const itemId = scriptTag ? scriptTag.getAttribute('item-id') : null;

        console.log('Scrisspt Tag ID:', contentId);
        console.log('Collection:', collection); 
        console.log('Item ID:', itemId);
})

    const SRC_MIDI = "./src/audio/vocals_melody.mid"
    const TONEJS_URL = "./src/js/Tone.js"
    const MIDI_URL = "./src/js/Midi.js"
    const baseURL = "https://tonejs.github.io/audio/salamander/";
    const SAMPLE_URL = {
        'A0': baseURL + "A0.mp3",
        'C1': baseURL + "C1.mp3",
        'D#1': baseURL + "Ds1.mp3",
        'F#1': baseURL + "Fs1.mp3",
        'A1': baseURL + "A1.mp3",
        'C2': baseURL + "C2.mp3",
        'D#2': baseURL + "Ds2.mp3",
        'F#2': baseURL + "Fs2.mp3",
        'A2': baseURL + "A2.mp3",
        'C3': baseURL + "C3.mp3",
        'D#3': baseURL + "Ds3.mp3",
        'F#3': baseURL + "Fs3.mp3",
        'A3': baseURL + "A3.mp3",
        'C4': baseURL + "C4.mp3",
        'D#4': baseURL + "Ds4.mp3",
        'F#4': baseURL + "Fs4.mp3",
        'A4': baseURL + "A4.mp3",
        'C5': baseURL + "C5.mp3",
        'D#5': baseURL + "Ds5.mp3",
        'F#5': baseURL + "Fs5.mp3",
        'A5': baseURL + "A5.mp3",
        'C6': baseURL + "C6.mp3",
        'D#6': baseURL + "Ds6.mp3",
        'F#6': baseURL + "Fs6.mp3",
        'A6': baseURL + "A6.mp3",
        'C7': baseURL + "C7.mp3",
        'D#7': baseURL + "Ds7.mp3",
        'F#7': baseURL + "Fs7.mp3",
        'A7': baseURL + "A7.mp3",
        'C8': baseURL + "C8.mp3",
    }
    const noteNames = Object.keys(SAMPLE_URL);
    const Instrument = ["AMSynth", "DuoSynth", "MembraneSynth", "FMSynth", "MonoSynth", "Piano"]
    const EDO = [5,7,12]

    const txID = window.location.href.split('/').pop() || "default";
    const hash = typeof txID === 'string' ? txID.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : Math.floor(Math.random() * 1000000);

    const selectedInstrument = Instrument[hash % Instrument.length];   
    const selectedEDO = EDO[hash % EDO.length];
    toneshifts = Array.from({ length: 5}, (_, i) => i - 2)
    const toneshift = toneshifts[hash % toneshifts.length];
    const playbackSpeed = 0.7 + (hash % 1000000) / 1000000 * 0.8;

    const nearbyEDOFreqs = Array.from({ length: 139 }, (_, i) => i - 70).map(offset => {
        const steps = offset;
        return 440 * Math.pow(2, steps / selectedEDO);
    });

    require("./draw-cover.js")(collection, itemId, {
        toneshift: toneshift,
        selectedEDO: selectedEDO,
        selectedInstrument: selectedInstrument,
        nearbyEDOFreqs: nearbyEDOFreqs,
        toneshifts: toneshifts,
        playbackSpeed: playbackSpeed,
    })

    const blobUrls = {};
    const synths = []
    const preparedTracks = []


!async function(){
    // Load Tone.js and Midi.js resources
    await Promise.all([
        fetch(TONEJS_URL).then(response => response.text()),
        fetch(MIDI_URL).then(response => response.text()),
    ]).then(([tonejsCode, midiCode, toneuiCode]) => {
        // Execute the loaded scripts
        eval(tonejsCode);
        eval(midiCode);
    }).catch(error => {
        console.error('Error loading resources:', error);
    });

    // If instrument is Piano, load the piano samples
    if (selectedInstrument === "Piano") {
        await Promise.all(noteNames.map(async note => {
            const url = SAMPLE_URL[note]; // Use SAMPLE_URL mapping instead of constructing URL
            const response = await fetch(url);
            const blob = await response.blob();
            blobUrls[note] = URL.createObjectURL(blob);
        }));
        samplerNotes = noteNames.reduce((obj, note) => {
            obj[note] = blobUrls[note];
            return obj;
        }, {});
        console.log("Piano samples loaded");
    }

    midi = await Midi.fromUrl(SRC_MIDI)
    console.log("midi", midi)

    const fftSize = 2048
    window.analyzer = new Tone.Analyser("fft", fftSize);
    window.fftWindows = [];

    // // Prepare tracks at load
    midi.tracks.forEach(track => {
        if (selectedInstrument == "Piano" && synths.length > 1)
            return
        console.log("track", track.name)
        switch (selectedInstrument) {
            case "FMSynth":
                var synth = new Tone.FMSynth().connect(window.analyzer).toMaster();
                break;
            case "AMSynth":
                synth = new Tone.AMSynth().connect(window.analyzer).toMaster();
                break;
            case "DuoSynth":
                synth = new Tone.DuoSynth().connect(window.analyzer).toMaster();
                break;
            case "MembraneSynth":
                synth = new Tone.MembraneSynth().connect(window.analyzer).toMaster();
                break;
            case "MonoSynth":
                synth = new Tone.MonoSynth().connect(window.analyzer).toMaster();
                break;
            case "Piano":
                synth = new Tone.Sampler(samplerNotes).connect(window.analyzer).toMaster();
                break;
        }

        synths.push(synth)
        preparedTracks.push({ synth, notes: track.notes })
    })

    // Wait for button to be rendered before adding event listener
    const waitForButton = setInterval(() => {
        const playButton = document.querySelector('#playButton');
        if (playButton) {
            clearInterval(waitForButton);
            playButton.addEventListener('click', (e) => {
                document.querySelector('.cover-controls').innerHTML = `<div style="text-align:center">
        <canvas id="spectrogram" width="512" height="512"></canvas>
    </div>`
                // <div style="text-align:center">
                //     <canvas id="spectrogram" width="512" height="512"></canvas>
                // </div>
                
                
                playSong(Tone.now())

                
            });
        }
    }, 100);

}()


async function playSong(startTime){
    // spectrogram
    let intervalTime = (128/Tone.context.sampleRate)*100
    
    let fftInterval = setInterval(() => {
        const fftData = window.analyzer.getValue();
        // Store the FFT data
        window.fftWindows.push([...fftData]);
        if(window.fftWindows.length > 512) {
            window.fftWindows.shift();
        }
        // Uncomment to draw real time (can be slow)
        drawSpectrogram();
    }, intervalTime);

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


function drawSpectrogram(hashID) {
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

    seed = (a * hash + c) % m;
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
    // console.log("baseHue", baseHue, "saturation", saturation)
    // document.getElementById("Description").style.color = "white";

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



