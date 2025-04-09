import essentia.standard as es
import numpy
from flask import Flask, request, jsonify
import tempfile
import os

app = Flask(__name__)

@app.route('/analyze', methods=['POST'])
def analyze_audio():
    # Handle multipart/form-data upload
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
        
    audio_file = request.files['file']
    

    # Save uploaded file to temporary location
    temp_dir = tempfile.mkdtemp()
    temp_path = os.path.join(temp_dir, 'input.mp3')
    audio_file.save(temp_path)

    try:
        # Load audio file with equal-loudness filter
        loader = es.EqloudLoader(filename=temp_path, sampleRate=44100)
        audio = loader()

        # Extract the pitch curve
        pitch_extractor = es.PredominantPitchMelodia(frameSize=2048, hopSize=128)
        pitch_values, pitch_confidence = pitch_extractor(audio)

        # Get MIDI notes and durations
        onsets, durations, notes = es.PitchContourSegmentation(hopSize=128)(pitch_values, audio)

        
        # Create response with notes and durations
        result = {
            'onsets': onsets.tolist(),
            'notes': notes.tolist(),
            'durations': durations.tolist()
        }

        return jsonify(result)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

    finally:
        # Cleanup temporary file
        if os.path.exists(temp_path):
            os.remove(temp_path)
        os.rmdir(temp_dir)

if __name__ == '__main__':
    audiofile = 'test.wav'
    # Load audio file.
    # It is recommended to apply equal-loudness filter for PredominantPitchMelodia.
    loader = es.EqloudLoader(filename=audiofile, sampleRate=44100)
    audio = loader()
    print("Duration of the audio sample [sec]:")
    print(len(audio)/44100.0)

    # Extract the pitch curve
    # PitchMelodia takes the entire audio signal as input (no frame-wise processing is required).

    pitch_extractor = es.PredominantPitchMelodia(frameSize=2048, hopSize=128)
    pitch_values, pitch_confidence = pitch_extractor(audio)

    # Pitch is estimated on frames. Compute frame time positions.
    pitch_times = numpy.linspace(0.0,len(audio)/44100.0,len(pitch_values) )

    onsets, durations, notes = es.PitchContourSegmentation(hopSize=128)(pitch_values, audio)
    print("MIDI notes:", notes) # Midi pitch number
    print("MIDI note onsets:", onsets)
    print("MIDI note durations:", durations)

    for i, note in enumerate(notes):
        print(f"({note}, {durations[i]}),")

    app.run(host='0.0.0.0', port=5000)

