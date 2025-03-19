import json
import mir_eval
import librosa
import soundfile as sf

with open('compressed_sample.json') as f:
    d = json.load(f)


reverse_map = d['map']
compressed_pitches = d['score']

times = librosa.times_like(d['len'], sr=d['sr'])

decompressed_pitches = []

for pitch in compressed_pitches:
  decompressed_pitches.extend([pitch[0]]*pitch[1])

MIDI_Pitchs = [reverse_map[str(pitch)] for pitch in decompressed_pitches]
f0 = librosa.midi_to_hz(MIDI_Pitchs[:543])

sf0 = mir_eval.sonify.pitch_contour(times, f0, d['sr'])

# Export as wav
sf.write('reconstruction.wav', sf0, d['sr'], 'PCM_24')
