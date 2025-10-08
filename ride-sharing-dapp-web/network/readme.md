----------------------------GETH Private Node Setup-------------------------------------
Step 1: Create Node Folders
-> cd network
-> mkdir node1
-> mkdir node2

Step 2: Create Node Account
-> cd node1
-> geth --datadir "./data" account new
-> cd ../node2
-> geth --datadir "./data" account new

Step 3: Create genesis.json
Step 4: Init Node 1 and Node 2
-> cd ../node1
-> geth --datadir ./data init ../genesis.json
-> cd ../node2
-> geth --datadir ./data init ../genesis.json

Step 5: Create Bootnode
-> cd ..
-> mkdir bnode
-> cd bnode
-> bootnode -genkey boot.key

Step 6: Start Bootnode
-> bootnode -nodekey boot.key -verbosity 7 -addr "127.0.0.1:30301"

Step 7: Start Node 1
-> geth --datadir "./data" --port 30304 --bootnodes enode://6e5cd4b17774197e9240e08d1b006b1fe19217bcdcbbfda1774864969ed0de235ab413744ae5ee03bcd5d8168c455d3be0278eb8d160ae2bf9019f96c6c8367b@127.0.0.1:0?discport=30301 --authrpc.port 8547 --ipcdisable --allow-insecure-unlock --http --http.corsdomain="https://remix.ethereum.org/" --http.api web3,eth,debug,personal,net --networkid 212121 --unlock 0xE0357b202E2317D7e0aC407a9e3B0fE450876053 --password password.txt --mine --miner.etherbase=0xE0357b202E2317D7e0aC407a9e3B0fE450876053

Step 8: Start Node 2
-> geth --datadir "./data" --port 30306 --bootnodes enode://6e5cd4b17774197e9240e08d1b006b1fe19217bcdcbbfda1774864969ed0de235ab413744ae5ee03bcd5d8168c455d3be0278eb8d160ae2bf9019f96c6c8367b@127.0.0.1:0?discport=30301 --authrpc.port 8546 --networkid 212121 --unlock 0xf1e26b9d0B658E79F5E41B98Ad8676222521ad1d --password password.txt

RPC URL: http://127.0.0.1:8545/

geth attach http://127.0.0.1:8545/

eth.sendTransaction({ from: "0xE0357b202E2317D7e0aC407a9e3B0fE450876053", to: "0x6d8A1E44477a7d44015DB9E67E1b19E976C38084", value: web3.toWei(1, "ether"), gas: 21000 })

for node 1 starting:
geth --datadir "./data" --port 30304 --networkid 212121 --bootnodes enode://6e5cd4b17774197e9240e08d1b006b1fe19217bcdcbbfda1774864969ed0de235ab413744ae5ee03bcd5d8168c455d3be0278eb8d160ae2bf9019f96c6c8367b@127.0.0.1:30301?discport=30301 --authrpc.port 8547 --ipcdisable --http --http.addr 127.0.0.1 --http.port 8545 --http.api web3,eth,debug,personal,net,txpool --http.corsdomain "https://remix.ethereum.org/" --allow-insecure-unlock --unlock 0xE0357b202E2317D7e0aC407a9e3B0fE450876053 --password password.txt --mine --miner.etherbase=0xE0357b202E2317D7e0aC407a9e3B0fE450876053 --miner.gasprice 0 --txpool.pricelimit 0

for node 2 starting:
geth --datadir "./data" --port 30306 --networkid 212121 --bootnodes enode://6e5cd4b17774197e9240e08d1b006b1fe19217bcdcbbfda1774864969ed0de235ab413744ae5ee03bcd5d8168c455d3be0278eb8d160ae2bf9019f96c6c8367b@127.0.0.1:30301?discport=30301 --authrpc.port 8546 --ipcdisable --allow-insecure-unlock --unlock 0xf1e26b9d0B658E79F5E41B98Ad8676222521ad1d --password password.txt
