import React, { Component } from "react";
import BookLibrary from "./contracts/BookLibrary.json";
import getWeb3 from "./getWeb3";

import BookList from "./BookList"

import 'bootstrap/dist/css/bootstrap.min.css';
import "./App.css";

class App extends Component {
  state = { loaded: false, books: [], myBooks: [], isOwner: false, newBookTitle: '' };

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
      this.state.isOwner = ownerAddress === this.accounts[0];
      this.state.loaded = true;
      this.setState(this.state);

      await this.loadBooks();
      await this.loadMyBooks();
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

  loadMyBooks = async () => {
    const books = await this.BookLibraryInstance.methods.getMyBooks().call({ from: this.accounts[0] });
    this.state.myBooks = books;
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

  handlerBorrowBook = async (event) => {
    await this.BookLibraryInstance.methods.borrowBook(event.bookId).send({ from: this.accounts[0] });
    await this.loadBooks();
    await this.loadMyBooks();
  };

  handlerReturnBook = async (event) => {
    await this.BookLibraryInstance.methods.returnBook(event.bookId).send({ from: this.accounts[0] });
    await this.loadBooks();
    await this.loadMyBooks();
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

          <BookList title="All books" books={this.state.books} onBorrowBook={this.handlerBorrowBook} />
          <BookList title="My books" books={this.state.myBooks} onReturnBook={this.handlerReturnBook} />
        </div>
      </React.Fragment>
    );
  }
}

export default App;
