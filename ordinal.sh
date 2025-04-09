#!/usr/bin/env bash

ord --data-dir /index-data --regtest --bitcoin-rpc-url bitcoind:18443 server --http-port 80 > ord.logs 2>&1  &

cd /root/app
python3.12 -m venv venv1
source venv1/bin/activate
pip install -r requirements.txt
pip install demucs
pip install mido
pip install pretty_midi
pip install scipy
streamlit run main.py > streamlit.logs 2>&1 &

tail -f streamlit.logs


