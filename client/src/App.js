import React, { Component } from "react";
import ABCToken from "./contracts/ABCToken.json";
import MyTokenSale from "./contracts/MyTokenSale.json";
import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
  state = { loaded: false, amount:1001, tokenSaleAddress: null, userTokens: 0 };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      this.web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      this.accounts = await this.web3.eth.getAccounts();

      // Get the contract instance.
      this.networkId = await this.web3.eth.net.getId();

      this.TokenInstance = new this.web3.eth.Contract(
        ABCToken.abi,
        ABCToken.networks[this.networkId] && ABCToken.networks[this.networkId].address
      );

      this.TokenSaleInstance = new this.web3.eth.Contract(
        MyTokenSale.abi,
        MyTokenSale.networks[this.networkId] && MyTokenSale.networks[this.networkId].address
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.listenToTokenTransfer();
      this.setState({ loaded: true, tokenSaleAddress: MyTokenSale.networks[this.networkId].address }, this.updateUserTokens);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  updateUserTokens = async () => {
    let userTokens = await this.TokenInstance.methods.balanceOf(this.accounts[0]).call();
    this.setState({ userTokens: userTokens });
  }

  listenToTokenTransfer = () => {
    this.TokenInstance.events.Transfer({ to: this.accounts[0] }).on("data", this.updateUserTokens);
  }

  handleMoABCTokensPurchase = async () => {
    const tokenAmount = this.state.amount;
    console.log(tokenAmount);
    await this.TokenSaleInstance.methods.buyTokens(this.accounts[0]).send({ from: this.accounts[0], value: this.web3.utils.toWei(tokenAmount.toString(), "wei") })
      ;
  }

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value
    const name = target.name;
    this.setState({
      [name]: value
    });
  };

  render() {
    if (!this.state.loaded) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>ABC Token Sale</h1>
        <p>Get your tokens today</p>
        <p>
          From the historic tales of Godric, the unmatched prowess of Albus, to the clever charm of Hermione. This house has attained glory unsurpassed and has always provided a light to vanquish the darkness.
          There is no greater than honour than an official symbol of association with this noble house.
        </p>
        <h2>Buy Tokens</h2>
        <p>If you want to buy tokens, send wei to this address: {this.state.tokenSaleAddress} </p>
        <p>¥ou currently have {this.state.userTokens} ABC</p>
        <input type="number" name="amount" min="1" value={this.state.amount} onChange={this.handleInputChange} />
        <button type="button" onClick={this.handleMoABCTokensPurchase}>Buy More ABC Tokens</button>
      </div>
    );
  }
}

export default App;
