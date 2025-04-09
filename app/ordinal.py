import subprocess
import json
import random

def get_balance():
    stdout, stderr = execute_command("ord -r --bitcoin-rpc-url=http://bitcoind:18443 wallet balance")
    if stdout != {}:
        print("xxx", stdout)
        return stdout["cardinal"], None
    print(stderr)
    return stdout , stderr

def create_wallet():
    stdout, stderr = execute_command("ord -r --bitcoin-rpc-url=http://bitcoind:18443 wallet create")
    if stdout != {}:
        print(stdout)
        return stdout, None
    return stdout , stderr

def generate_block(n, address):
    curl_command = f'''
curl --user foo:bar \
     --data-binary '{{"jsonrpc": "1.0", "id": "curltest", "method": "generatetoaddress", "params": [{n}, "{address}"] }}' \
     -H "content-type: text/plain;" \
     -X POST http://bitcoind:18443
'''
    stdout, stderr = execute_command(curl_command)
    if stdout != {}:
        print(stdout)
    else: print(stderr)

def topup(n = 0):
    if n == 0:
        balance,_ = get_balance()
        if balance == 0:
            stdout, stderr = execute_command("ord -r --bitcoin-rpc-url=http://bitcoind:18443 wallet receive")
            if stdout != {}:
                print("topup",n,stdout["addresses"][0])
                address= stdout["addresses"][0]
            else: print(stderr)
            generate_block(200, address)
    else:
        stdout, stderr = execute_command("ord -r --bitcoin-rpc-url=http://bitcoind:18443 wallet receive")
        if stdout != {}:
            print("topup",n,stdout["addresses"][0])
            address= stdout["addresses"][0]
        else: print(stderr)
        generate_block(n, address)
        
def create_inscription(file_path, generate_block = True):
    stdout, stderr = execute_command(f"ord -r --bitcoin-rpc-url bitcoind:18443 wallet inscribe --fee-rate 10 --file \"{file_path}\"")
    if stdout != {}:
        if generate_block:
            topup(1)
        return stdout, None
    else: print(stderr)
    

def execute_command(command):
    """
    Execute a command line command and return its output
    
    Args:
        command (str or list): Command to execute as string or list of arguments
        
    Returns:
        tuple: (stdout, stderr) - Output and error streams as strings
    """
    try:
        # Run command and capture output
        process = subprocess.Popen(
            command,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            shell=isinstance(command, str)
        )
        
        # Get output and error streams
        stdout, stderr = process.communicate()
        
        # Decode bytes to strings
        stdout = json.loads(stdout.decode('utf-8')) if stdout else {}
        stderr = stderr.decode('utf-8') if stderr else ''
        
        return stdout, stderr
        
    except Exception as e:
        print(e)
        return '', str(e)



