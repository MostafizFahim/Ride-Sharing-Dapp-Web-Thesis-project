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
