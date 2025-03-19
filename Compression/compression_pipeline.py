import os
import demucs.separate
import librosa
import mir_eval
import numpy as np
import json

# Import the Data
input_file = "Data/HOG_sample.mp3"

# Check Size
original_size = os.path.getsize(input_file)

# Source Seperation
demucs.separate.main(["--mp3", "--two-stems", "vocals", input_file])
source_seperated = 'separated/htdemucs/HOG_sample/vocals.mp3'
# Fundamental Frequency Extraction
(x,srate) = librosa.load(source_seperated)
f0, voiced_flag, voiced_probs = librosa.pyin(x,
                                             sr=srate,
                                             fmin=librosa.note_to_hz('C2'),
                                             fmax=librosa.note_to_hz('C7'))

times = librosa.times_like(f0, sr=srate)
f0 = np.nan_to_num(f0)

quantized_pitchs = np.zeros_like(f0, dtype=int)

nonzero_idx = np.where(f0 > 0)[0]
nonzero_midi = librosa.hz_to_midi(f0[nonzero_idx])
nonzero_midi = np.round(nonzero_midi, decimals=0).astype(int)

pitchs = {}
id = 0

# Create a unique mapping for nonzero MIDI values
for midi in nonzero_midi:
    if midi not in pitchs:
        pitchs[int(midi)] = id
        id += 1

for idx, midi in zip(nonzero_idx, nonzero_midi):
    quantized_pitchs[idx] = pitchs[midi]

# Run Length Encoding
compressed_pitches = []

for idx, pitch in enumerate(quantized_pitchs):
  if idx == 0:
    curr_pitch = int(quantized_pitchs[0])
    curr_idx = idx
    compressed_pitches.append([curr_pitch,1])
    continue
  if pitch == curr_pitch:
    compressed_pitches[curr_idx][1] += 1
  else:
    curr_idx += 1
    curr_pitch = pitch
    compressed_pitches.append([int(curr_pitch),1])

reverse_map = dict((reversed(item) for item in pitchs.items()))

# Export Data
compressed_format = {'score':compressed_pitches, 'map':reverse_map, 'len':len(f0), 'sr':srate}
print(compressed_format)
with open('compressed_sample.json', 'w') as f:
    json.dump(compressed_format, f)

# Check Size
compressed_size = os.path.getsize("compressed_sample.json")

print('Original Size: ' + str(original_size))
print('Compressed Size: ' + str(compressed_size))