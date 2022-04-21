import React, { Component } from "react";
import BookLibrary from "./contracts/BookLibrary.json";
import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
  state = { loaded: false, books: [], isOwner: false, newBookTitle: '' };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      this.web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      this.accounts = await this.web3.eth.getAccounts();

      // Get the contract instance.
      this.networkId = await this.web3.eth.net.getId();

      this.BookLibraryInstance = new this.web3.eth.Contract(
        BookLibrary.abi,
        BookLibrary.networks[this.networkId] && BookLibrary.networks[this.networkId].address
      );

      const ownerAddress = await this.BookLibraryInstance.methods.owner().call();

      this.state.isOwner = ownerAddress == this.accounts[0];
      this.state.loaded = true;
      this.setState(this.state);

      await this.loadBooks();
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  // #region Private Methods
  loadBooks = async () => {
    const books = await this.BookLibraryInstance.methods.getBooks().call();
    this.state.books = books;
    this.setState(this.state);
  };
  // #endregion

  // #region Handlers
  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value
    const name = target.name;
    this.setState({
      [name]: value
    });
  };

  handleNewBookClick = async (event) => {
    await this.BookLibraryInstance.methods.addNewBook(this.state.newBookTitle, 1).send({ from: this.accounts[0] });
    this.state.newBookTitle = '';
    await this.loadBooks();
  };
  // #endregion


  render() {
    return (
      <React.Fragment>
        <div className="container">
          <div className="row">
            <div className="col">
              <h1>Eth Book Library</h1>
              <p>Simple client for Eth Book Library</p>
            </div>
          </div>

          {this.state.isOwner > 0 &&
            <div className="row">
              <div className="col">
                <h2>Add new book</h2>
                <div className="row">
                  <div className="col">
                    <input type="text" name="newBookTitle" value={this.state.newBookTitle} onChange={this.handleInputChange} />
                    <button type="button" onClick={this.handleNewBookClick}>Submit</button>
                  </div>
                </div>
              </div>
            </div>
          }

          <div className="row">
            <div className="col">
              <h2>All books</h2>
            </div>
          </div>
          <div className="row">
            <div className="col">
              {this.state.books.map((ele, inx) => (
                <div key={inx} className="item-book">
                  <h3>{ele.title}</h3>
                  <div>totalCount: {ele.totalCount}</div>
                  <div>availableCount: {ele.availableCount}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default App;
