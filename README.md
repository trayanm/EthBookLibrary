## Setup and test
```
# Install Dependencies
npm install

# Build contracts
truffle build

# Run tests
truffle test
```

## Publish to Rinkeby using Infura
- Create .env file with the following content
```
MNEMONIC=<YOUR MNEMONIC HERE>
```

- Set the HDWalletProvider in truffle-config.js for network rinkeby_infura
- Run command 
```
truffle migrate --network rinkeby_infura
```