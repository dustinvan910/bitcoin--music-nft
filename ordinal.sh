#!/usr/bin/env bash

ord --data-dir /index-data --regtest --bitcoin-rpc-url bitcoind:18443 server --http-port 80 > ord.logs 2>&1  &

cd /root/app
python3.12 venv venv1
source venv1/bin/activate
pip install -r requirements.txt
streamlit run main.py > streamlit.logs 2>&1 &

tail -f streamlit.logs


