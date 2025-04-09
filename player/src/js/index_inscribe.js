// Get the script tag and its attributes
const scriptTag = document.getElementsByTagName('script')[0];
const contentId = scriptTag ? scriptTag.getAttribute('id') : null;
const collection = scriptTag ? scriptTag.getAttribute('collection') : null;
const itemId = scriptTag ? scriptTag.getAttribute('item-id') : null;

console.log('Script Tag ID:', contentId);
console.log('Collection:', collection); 
console.log('Item ID:', itemId);

const SRC_MIDI = "/content/" + contentId
const TONEJS_URL = "/content/" + "6f6f0fa29e7463db53c5514cafb7a7943cb42786557cb230b3655199e32d981di0"
const MIDI_URL = "/content/" + "5ebeb03cd5de042e04dfec23eb9c3e1135f7527380ba0606bc48f8a35972d31fi0"
const baseURL = "/content/";
const SAMPLE_URL = {
    'A0': baseURL + "049031d90005955919bd06b145a9f75fd8b19c76b5f5924aa0f24fcaf1f9bc2ei0",
    'C1': baseURL + "2c800dc8972a02c6c549ff2cdd0ae436567a60170277150f7a9c2d7470458cfdi0",
    'D#1': baseURL + "62d7e88fc146c32b60b4b212030ed03c543817fb4d480f2a7eeba6767f580b38i0",
    'F#1': baseURL + "cdb07ceb18f0e73d88d0e7955c7ceddca0c28319aadca482ff7b0c4779e4e757i0",
    'A1': baseURL + "2385e68cee6dd757764970a01f3648f877187353f113e04ed964b97a066f197di0",
    'C2': baseURL + "2ef2e3a0cdab0a13911debaad4630c07550b7a191e89b49965a5e431e6416770i0",
    'D#2': baseURL + "fc15b1ae25e7a8660fd0fa5d951dff7950fe83390b3adeac74a3087f8eb0332ci0",
    'F#2': baseURL + "caf1685a08ce39a133e62d5cf73382b8c11eda2e53a56d8dbd287ddc33d276b6i0",
    'A2': baseURL + "a38d215f1869ae55edc5a6e83af3c70297c65d5725b2ebb597fe6b775b55436ei0",
    'C3': baseURL + "28f398b5e5ffa2d654eddc4e037371b370689f58fa135a8812ea0c21bf5002b4i0",
    'D#3': baseURL + "002bc0850188f3ff7f8fd39c26e0c2565e73076fefaa5c08d029e5562dce1d98i0",
    'F#3': baseURL + "be569d1e3e312224307beb6d7add41b75f5f06d3b0c3c738eefecc086825e6c0i0",
    'A3': baseURL + "0405214d575adb7fee544a5e5ec2c1d7c80aeb7dbba05458d294dcf6513ad31ai0",
    'C4': baseURL + "09f4b04007b54fd4191aa1a261bbc6484da673279c6b9a70a3c0d3e9ece31de7i0",
    'D#4': baseURL + "fed7d3c18849a3e62ac708de6398d7144076f3022a60e25808961459e1442d2di0",
    'F#4': baseURL + "2e2eafd7a3d68227f0585f408bd5a0d2c36f92ff63fb812c50563cc750d032f9i0",
    'A4': baseURL + "2621d5de4230faeb35ddfc6e16d5c4652a1d9e4cf273d87dc82f722e92a84dd9i0",
    'C5': baseURL + "8b6d4474283b133d33199860e89fdd2f8bbe3b2e0a1c6227675801f0cb102c86i0",
    'D#5': baseURL + "ded897e98ef30d4bd934683e03dca57f02a0a4dcc5de2ebede2b0dfdafc2ef53i0",
    'F#5': baseURL + "4e5a554be460dcc34484ae5f981d3b997f323bfe34fcda6cc30d73301bf7f6e0i0",
    'A5': baseURL + "a7d21200577fd0716cbeaec18f91747a24057cfd922c8193a899fb3f01be7954i0",
    'C6': baseURL + "2903b6415a96a68da3c5822140160ff0d1f6bca6aafef370098e3ebfe9f0e2a0i0",
    'D#6': baseURL + "070410c9efec4d6c174198380278b7dd3aff8d60150916f7126034e470661c29i0",
    'F#6': baseURL + "0cbd25420068c9c9ad66047e2e3f22751677a624c19244a12cb906f2b07a1346i0",
    'A6': baseURL + "501c5e9327daa8379a5aef47a4686d135bbbe9bff616ea53680335ac9749707fi0",
    'C7': baseURL + "83612dba4a98ad264e0244710a1b0279a1ff720c00bc9eae8016264c7413689ci0",
    'D#7': baseURL + "a07fcf3ab7deb22623de77e00e7d5a973b3327215f74628771629a89df27cff8i0",
    'F#7': baseURL + "d0e7f10af75b4c23893a552ee67901095c63d9c65d7a53a72f7ea9ee0561fdcei0",
    'A7': baseURL + "680ed7115dc65938f198ee68efebbaa1ce50f8509dc016ad2cf1e602c1282c1bi0",
    'C8': baseURL + "1fadb3bd08189ef3aa870e11644bad8d0fcced3d9cf58bc6fedf5043c1f14e99i0",
}
const noteNames = Object.keys(SAMPLE_URL);
const Instrument = ["AMSynth", "DuoSynth", "MembraneSynth", "FMSynth", "MonoSynth", "Piano"]
const EDO = [3, 5,7,12]

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



