import React, { Component } from "react";

class BookList extends Component {
  state = {
    title: '',
    books: [],
    onBorrowBook: null,
    onReturnBook: null
  };

  constructor(props) {
    super(props);

    this.state = {
      books: props.books,
      title: props.title,
      onBorrowBook: props.onBorrowBook,
      onReturnBook: props.onReturnBook
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      books: nextProps.books,
      title: nextProps.title,
      onBorrowBook: nextProps.onBorrowBook,
      onReturnBook: nextProps.onReturnBook
    });
  }

  componentDidMount() { };

  render() {
    return (
      <React.Fragment>
        <div className="row">
          <div className="col">
            <div className="row">
              <div className="col">
                <h2>{this.state.title}</h2>
              </div>
            </div>
            <div className="row">
              <div className="col">
                {this.state.books.map((ele, inx) => (
                  <div key={inx} className="item-book">
                    <h3>{ele.title}</h3>
                    <div>Total: {ele.totalCount}</div>
                    <div>Available: {ele.availableCount}</div>
                    {this.state.onBorrowBook != null &&
                      <button type="button" className="btn btn-primary" onClick={() => this.state.onBorrowBook({ bookId: ele.bookId })}>Borrow</button>
                    }

                    {this.state.onReturnBook != null &&
                      <button type="button" className="btn btn-light" onClick={() => this.state.onReturnBook({ bookId: ele.bookId })}>Return</button>
                    }
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </React.Fragment >
    );
  }
}

export default BookList;
