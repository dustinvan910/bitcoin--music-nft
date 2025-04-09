import streamlit as st
import requests
import base64
import time

# Create button to execute command
import ordinal
from analyze import source_seperation, analyze, midi2mp3

# Init app by creating wallet
ordinal.create_wallet()
ordinal.topup()

st.session_state.current_balance = 0
st.header("BTC balance")
try:
    balance_output, _ = ordinal.get_balance() # Replace with actual balance command
    st.session_state.current_balance = balance_output   * 1e-8  
    
except:
    st.session_state.current_balance = st.session_state.current_balance

st.info(f'{st.session_state.current_balance} BTC')
st.markdown("---")
st.header("Inscribe your melody file into blockchain")

# File upload section
uploaded_file = st.file_uploader("Choose a file to inscribe", type=["mid", "mp3", "wav"])

if uploaded_file is not None:
    # Display the uploaded file
    file_details = {"FileName": uploaded_file.name, "FileType": uploaded_file.type, "FileSize": uploaded_file.size}
    st.write(file_details)
    
    # Save the uploaded file to server
    import os
    os.makedirs("uploads", exist_ok=True)
    save_path = f"uploads/{uploaded_file.name}"
    with open(save_path, "wb") as f:
        f.write(uploaded_file.getbuffer())
    st.success(f"File saved successfully at {save_path}")
    
    if uploaded_file.name.split(".")[-1] in ["mid"]:
        mp3_file = midi2mp3(save_path)
        # Play MIDI audio
        audio_file = open(mp3_file, 'rb')
        audio_bytes = audio_file.read()
        st.audio(audio_bytes, format='audio/mp3')

    if uploaded_file.name.split(".")[-1] in ["mp3", "wav"]:
        audio_file = open(save_path, 'rb')
        audio_bytes = audio_file.read()
        st.audio(audio_bytes, format=f'audio/{uploaded_file.name.split(".")[-1]}')
        analyze_button = st.button("Source Seperation", disabled=st.session_state.get('seperate_disabled', False))

        if analyze_button:
            st.session_state.seperate_disabled = True

    if st.session_state.get('seperate_disabled', False) == True:
        status = st.info("Source Seperation... Please wait")
        compressed_format = source_seperation(save_path)
        st.session_state.seperate_disabled = False
        st.session_state.seperated = True
        status.empty()

    if st.session_state.get('seperated', False) == True:  
        st.info("Source Seperation... Done") 
        
        col1, col2, col3 = st.columns([1,2,1])
        with col1:
            st.write("Vocals Separated Audio:")
        with col2:
            st.audio('separated/htdemucs/' + uploaded_file.name.split('.')[0] + '/vocals.mp3', format='audio/mp3')
        with col3:
            vocal_midify = st.button("MIDIfy", key="vocals", disabled=False)
            if vocal_midify:
                st.session_state.vocals_clicked = True
                st.session_state.no_vocals_clicked = False

        col1, col2, col3 = st.columns([1,2,1])
        with col1:
            st.write("Non-Vocals Separated Audio:")
        with col2:
            st.audio('separated/htdemucs/' + uploaded_file.name.split('.')[0] + '/no_vocals.mp3', format='audio/mp3')
        with col3:
            no_vocal_midify = st.button("MIDIfy", key="no_vocals", disabled=False)
            if no_vocal_midify:
                st.session_state.no_vocals_clicked = True
                st.session_state.vocals_clicked = False

    if st.session_state.get('vocals_clicked', False) == True and st.session_state.get('no_vocals_clicked', False) == False:
        status = st.info("Midify vocals... Please wait")
        vocals_path = 'separated/htdemucs/' + uploaded_file.name.split('.')[0] + '/vocals.mp3'
        status.info("Midify vocals... Done")     
        response = analyze(vocals_path)
        st.info(f"MIDI file: {response[0]}")
        midi_file = response[0]

        with open(response[1], 'rb') as midi_audio:
            midi_audio_bytes = midi_audio.read()
            st.audio(midi_audio_bytes, format='audio/wav')
        st.session_state.vocals_clicked = True

    if st.session_state.get('no_vocals_clicked', False) == True and st.session_state.get('vocals_clicked', False) == False:
        status2 = st.info("Midify non vocal... Please wait")
        no_vocals_path = 'separated/htdemucs/' + uploaded_file.name.split('.')[0] + '/no_vocals.mp3'
        status2.info("Midify non vocals... Done")     
        response = analyze(no_vocals_path)
        st.info(f"MIDI file: {response[0]}")
        midi_file = response[0]

        with open(response[1], 'rb') as midi_audio:
            midi_audio_bytes = midi_audio.read()
            st.audio(midi_audio_bytes, format='audio/wav')
        st.session_state.no_vocals_clicked = True
else:
    st.session_state.vocals_clicked = False
    st.session_state.no_vocals_clicked = False
    st.session_state.seperated = False
    st.session_state.seperate_disabled = False


if st.session_state.get('vocals_clicked', False) == True or st.session_state.get('no_vocals_clicked', False) == True:
    if st.button("Inscribe Melody"):
        s = st.info("Inscribing melody... Please wait")
        midi_file_rename = midi_file.replace('.mid', '.bin')
        os.rename(midi_file, midi_file.replace('.mid', '.bin'))
        result = ordinal.create_inscription(midi_file_rename)
        try:
            st.info(f"ID: {result[0]["inscriptions"][0]["id"]} {result[0]["total_fees"]}")
            s.success("Melody inscribed successfully!")
        except:
            st.error(f"Failed to inscribe resource: {midi_file} {result}")
        

# Create a line to seperate the layout
st.markdown("---")

# Display header with project information
st.header("Create collection of your inscribed melodies")
# Input field for collection name
collection_name = st.text_input("Collection Name", placeholder="Enter your collection name")

# Input field for collection name
melody_id = st.text_input("Melody Inscription ID", placeholder="Enter your melody isncribed id")

# Input field for maximum supply
max_supply = st.number_input("Maximum Supply", min_value=1, value=1, help="Number of items in collection")

# Create collection button
if st.button("Create Collection"):
    if not collection_name:
        st.error("Please fill in all required fields")
    else:
        try:
            st.info("Creating collection... Please wait")
            for i in range(max_supply):
                st.info(f"Inscribing resource: {melody_id}")
                file_name = '/tmp/index.html'
                with open(file_name, 'w') as f:
                    f.write(f"""
                    <script src="/content/5b9060bfc40d3e29919fba760dd30e89e1552f8fe55725f63ac992f100e48c23i0" id="{melody_id}" collection="{collection_name}" item-id="{i+1}"></script>
                    """)
                result = ordinal.create_inscription(file_name, generate_block = False)
                try:
                    st.info(f"ID: {result[0]["inscriptions"][0]["id"]} {result[0]["total_fees"]}")
                except:
                    st.error(f"Failed to inscribe resource: {melody_id} {result}")
            ordinal.topup(1)
            st.success("Collection created successfully!")
        except Exception as e:
            st.error(f"Error creating collection: {str(e)}")




# this function is used to inscribe a resource into the blockchain
def inscribe_resource():
    import os
    time.sleep(1)

    baseURL = "https://tonejs.github.io/audio/salamander/";
    SAMPLE_URL = {
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
    
    # Download each sample file
    # for note, url in SAMPLE_URL.items():
    #     st.info(f"Downloading {note} sample...")
    #     fileName = note.replace("#", "s") + ".bin"
    #     response = requests.get(url)
    #     if response.status_code == 200:
    #         # Save file with note name
    #         file_path = f"/root/app/resource/{fileName}"
    #         with open(file_path, "wb") as f:
    #             f.write(response.content)
    #         st.success(f"Downloaded {note} sample")
    #     else:
    #         st.error(f"Failed to download {note} sample")

    # Read all files in /app/resource folders
    resource_files = []
    resource_dir = '/root/app/resource'
    
    # Walk through resource directory and subdirectories
    for root, dirs, files in os.walk(resource_dir):
        for file in files:
            # Get full path of file
            file_path = os.path.join(root, file)
            resource_files.append(file_path)
            
    for i in resource_files:
        if ".js" not in i:
            continue
        time.sleep(2)
        st.info(f"Inscribing resource: {i}")
        result = ordinal.create_inscription(i, generate_block = False)
        try:
            st.info(f"ID: {result[0]["inscriptions"][0]["id"]} {result[0]["total_fees"]}")
        except:
            st.error(f"Failed to inscribe resource: {i} {result}")
        time.sleep(1)
    ordinal.topup(1)

# inscribe_resource()