// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract BookLibrary is Ownable {
    using SafeMath for uint256;

    // #region Definitions
    struct Book {
        uint256 bookId;
        string title;
        uint256 totalCount;
        uint256 availableCount;
    }

    struct Borrow {
        address userAdddress;
        uint256 borrowDate;
    }
    // #endregion

    // #region Public Properties
    // used for generating pseudo bookId - based to 0
    uint256 public bookCount = 0;

    // array of Books - array of book where the index will be equal to Id
    Book[] public BookStore;

    // map msg.sender => (bookId => isLended)
    mapping(address => mapping(uint256 => bool)) bookLending;

    // map bookId to address
    mapping(uint256 => Borrow[]) ownersHistory;

    // #endregion

    // #region Modifiers
    modifier requireBookExists(uint256 _bookId) {
        require(_bookId < bookCount, "Book does not exists");
        _;
    }

    modifier onlyBorrowedBySender(uint256 _bookId) {
        require(
            bookLending[msg.sender][_bookId],
            "Book not borrowed by sender"
        );
        _;
    }

    // #endregion

    // #region Events
    event onBookAdded(uint _bookId);
    event onBookChanged(uint _bookId);
    event onBookBorrowed(uint _bookId);
    event onBookReturned(uint _bookId);
    // #endregion

    // #region Owner Methods
    function addNewBook(string memory _title, uint256 _count) public onlyOwner {
        require(bytes(_title).length != 0, "Title cannot be empty");
        require(_count > 0, "Count should be greater than zero");

        // first we construct the id as bookCount (zero based), then we will increase bookCount
        uint256 _bookId = bookCount;

        BookStore.push(Book(_bookId, _title, _count, _count));

        // after createing the very fist book - id will be 0, bookCunt will be 1
        bookCount = bookCount.add(1); // increase bookCount, next bookId will be bookCouont + 1

        emit onBookAdded(_bookId);
    }

    function addBookCopy(uint256 _bookId, uint256 _count)
        public
        onlyOwner
        requireBookExists(_bookId)
    {
        require(_count > 0, "Count should be greater than zero");

        BookStore[_bookId].availableCount = BookStore[_bookId]
            .availableCount
            .add(_count);

        BookStore[_bookId].totalCount = BookStore[_bookId].totalCount.add(
            _count
        );

        emit onBookChanged(_bookId);
    }

    // #endregion

    // #region Public Methods
    function getBook(uint256 _bookId)
        public
        view
        requireBookExists(_bookId)
        returns (Book memory)
    {
        return BookStore[_bookId];
    }

    function getBooks() public view returns (Book[] memory) {
        // TODO : Handle large result set
        return BookStore;
    }

    function getAvailableBooks() public view returns (Book[] memory) {
        // TODO : Handle large result set
        uint256 resultCount;

        for (uint256 i = 0; i < BookStore.length; i++) {
            if (BookStore[i].availableCount > 0) {
                resultCount++;
            }
        }

        Book[] memory result = new Book[](resultCount);
        uint256 j;

        for (uint256 i = 0; i < BookStore.length; i++) {
            if (BookStore[i].availableCount > 0) {
                result[j] = BookStore[i];
                j++;
            }
        }

        return result;
    }

    function borrowBook(uint256 _bookId) public requireBookExists(_bookId) {
        // validate if available
        require(
            BookStore[_bookId].availableCount >= 1,
            "The book is not available"
        );

        // Only one copy of book
        require(
            !bookLending[msg.sender][_bookId],
            "Only one copy of book per address"
        );

        // borrow the book
        bookLending[msg.sender][_bookId] = true;

        // update book count
        BookStore[_bookId].availableCount = BookStore[_bookId]
            .availableCount
            .sub(1);

        // write history
        ownersHistory[_bookId].push(Borrow(msg.sender, block.timestamp));

        emit onBookBorrowed(_bookId);
    }

    function getBookHistory(uint256 _bookId)
        public
        view
        returns (Borrow[] memory)
    {
        return ownersHistory[_bookId];
    }

    function returnBook(uint256 _bookId)
        public
        requireBookExists(_bookId)
        onlyBorrowedBySender(_bookId)
    {
        BookStore[_bookId].availableCount = BookStore[_bookId]
            .availableCount
            .add(1);

        bookLending[msg.sender][_bookId] = false;

        emit onBookReturned(_bookId);
    }

    // #endregion

    // #region Private Methods
    // #endregion
}
