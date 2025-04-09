import os
import demucs.separate
import librosa
import mir_eval
import numpy as np
import json
import requests
import mido
import pretty_midi
from scipy.io import wavfile
import subprocess

def source_seperation(input_file):
    # Source Seperation
    demucs.separate.main(["--mp3", "--two-stems", "vocals", input_file])
    return ""

def midi2mp3(input_file):
    # Load MIDI file and synthesize to audio
    pm = pretty_midi.PrettyMIDI(input_file)
    audio_data = pm.synthesize()
    
    # Save as WAV file using scipy
    wav_file = input_file + '.wav'  
    wavfile.write(wav_file, 44100, audio_data)

    # Convert WAV to MP3 using ffmpeg
    mp3_file = input_file + '.mp3'
    subprocess.run(['ffmpeg', '-i', wav_file, '-codec:a', 'libmp3lame', '-qscale:a', '2', mp3_file])
    
    # Remove temporary WAV file
    os.remove(wav_file)
    return mp3_file

# Import the Data
def analyze(input_file):
    # call port 8095 /analyze with POST request
    

    url = "http://essentia:5000/analyze"
    files = {'file': open(input_file, 'rb')}
    response = requests.post(url, files=files)
    data = response.json()
    durations = data['durations']
    notes = data['notes']
    onsets = data['onsets']

    # {'durations': [0.38893425464630127, 0.09287981688976288, 0.09287981688976288, 0.2438095211982727, 0.09287981688976288, 0.09287981688976288, 0.09287981688976288, 1.0216779708862305, 0.21478457748889923, 0.15383219718933105, 0.28154194355010986, 0.13351473212242126, 0.09287981688976288, 0.16253967583179474, 0.09287981688976288, 0.13351473212242126, 0.5572789311408997, 0.3047619163990021, 0.09868481010198593, 0.09287981688976288, 0.25832200050354004, 0.18575963377952576, 1.3612698316574097, 0.13061223924160004, 0.09287981688976288, 0.23800453543663025, 0.1364172399044037, 0.22639456391334534, 0.1480272114276886, 0.09287981688976288, 0.09287981688976288, 0.09287981688976288, 0.20607709884643555], 'notes': [58.0, 60.0, 61.0, 63.0, 59.0, 61.0, 62.0, 63.0, 63.0, 66.0, 67.0, 66.0, 63.0, 63.0, 64.0, 66.0, 67.0, 67.0, 62.0, 63.0, 65.0, 63.0, 63.0, 58.0, 60.0, 60.0, 58.0, 58.0, 58.0, 59.0, 58.0, 59.0, 58.0]}
    PPQ = 480 # Pulses per quarter note (standard MIDI resolution)
    BPM = 120 # Default tempo
    tempo = mido.bpm2tempo(BPM)

    mid = mido.MidiFile()
    track = mido.MidiTrack()
    mid.tracks.append(track)

    for note, duration in zip(notes, durations):
        print(f"({note},{duration}),")
        # Convert duration to ticks
        ticks = int(mido.second2tick(duration, PPQ, tempo))
        
        # Note on with duration
        track.append(mido.Message('note_on', note=int(note), velocity=64, time=0))
        track.append(mido.Message('note_off', note=int(note), time=ticks))

    midi_file = os.path.dirname(input_file) + '/' + os.path.splitext(os.path.basename(input_file))[0] + '_melody.mid'
    mid.save(midi_file)
    print("MIDI file location:", midi_file)
    
    
    # Load MIDI file and synthesize to audio
    pm = pretty_midi.PrettyMIDI(midi_file)
    audio_data = pm.synthesize()
    
    # Save as WAV file using scipy
    wav_file = midi_file + '.wav'
    wavfile.write(wav_file, 44100, audio_data)

    # Convert WAV to MP3 using ffmpeg
    mp3_file = midi_file + '.mp3'
    subprocess.run(['ffmpeg', '-i', wav_file, '-codec:a', 'libmp3lame', '-qscale:a', '2', mp3_file])
    
    # Remove temporary WAV file
    os.remove(wav_file)
    return (midi_file,mp3_file)
