# pc-wifi-poc
tokenized wifi-sharing via payment channels

## Quick Start
follow `access-point-config.txt` to configure your raspberry pi as an access point 

### Ethereum Client
```sh
geth --testnet --cache 128 --rpc --rpcport 8545 --rpcaddr 0.0.0.0 --rpccorsdomain "*" --rpcapi "eth,net,web3"
```

### Payment-Channel-Server
#### 1. Install Requirements
- python 3.6 (virtualenv)
- https://microraiden.readthedocs.io/en/latest/tutorials/raspi-tutorial.html
- https://microraiden.readthedocs.io/en/latest/contract/deployment.html

MacOS:
```sh
brew install automake gmp pkg-config openssl libtool solc
```

#### 2. Install Payment-Channel-Server
```sh
cd pc-wifi-poc/server/microraiden-server/
virtualenv -p python3 env
. env/bin/activate 
git clone https://github.com/JohannesGitHub/microraiden.git
cd microraiden/
pip install -r requirements.txt
python3 setup.py develop
cd ../
chmod 600 key.txt && echo <privatekey> > key.txt
python3 server.py --private-key key.txt # make sure your node is synced
```

### Access Control Server
```sh
cd pc-wifi-poc/server/access-control-server/
npm install
node index.js
```

### App
- fill in address, private key of sender in 
`src/services/web3Service.js` 
- fill in address of the receiver in `src/services/uraidenService.js`

```sh
cd pc-wifi-poc/app/
npm install
npx react-native upgrade
npx react-native link react-native-sound
```
- add an silent audio file named "silence.mp3" to project in xcode (to make sure app is able to run in background on iOS)
- run via Xcode and connect to access point
