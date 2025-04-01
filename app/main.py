import streamlit as st
import requests
import base64
import time

# Create button to execute command
import ordinal

# Init app by creating wallet
ordinal.create_wallet()
ordinal.topup()

balance_output, _ = ordinal.get_balance() # Replace with actual balance command
st.session_state.current_balance = balance_output
st.metric(label="Balance", value=st.session_state.current_balance * 1e-8)

# File upload section
uploaded_file = st.file_uploader("Choose a file to inscribe", type=['bin','html','png', 'jpg', 'jpeg', 'gif', "js", "mid", "mp3"])

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
    
    # Add inscription button
    if st.button("Create Inscription"):
        try:
            # Call ordinal inscription command here
            st.info("Creating inscription... Please wait")
            # Add actual inscription logic here
            out, err = ordinal.create_inscription(save_path)
            if out != {}:
                st.success("Inscription created successfully")
                st.write(out)
            else:
                st.error(f"Error creating inscription: {err}")
                st.write(err)

        except Exception as e:
            st.error(f"Error creating inscription: {str(e)}")
