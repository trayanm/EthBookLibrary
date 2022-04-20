const path = require("path");
require('dotenv').config({ path: './.env'});

const BookLibrary = artifacts.require("./BookLibrary.sol");

module.exports = async function(deployer) {
  const addr = await web3.eth.getAccounts();

  await deployer.deploy(BookLibrary);
};
