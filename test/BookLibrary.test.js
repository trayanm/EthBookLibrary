const { assert } = require('chai');

const BookLibrary = artifacts.require('BookLibrary');

contract('BookLibrary', function (accounts) {
    let theLibrary;

    const account_owner = accounts[0];
    const account_1 = accounts[1];
    const account_2 = accounts[2];
    const account_3 = accounts[3];

    const title_1 = 'Book one here'; // bookId: 0
    const title_2 = 'Book two here'; // bookId: 1
    const title_3 = 'Book thr here'; // bookId: 2

    beforeEach(async function () {
        theLibrary = await BookLibrary.new();

        // add three books
        await theLibrary.addNewBook(title_1, 1, { from: account_owner });
        await theLibrary.addNewBook(title_2, 2, { from: account_owner });
        await theLibrary.addNewBook(title_3, 3, { from: account_owner });
    });

    it('Test: addNewBook', async function () {
        let allbooks = await theLibrary.getBooks();
        assert.equal(allbooks.length, 3, 'Three books added');

        const bookTwo = await theLibrary.getBook(1);
        assert.equal(bookTwo.bookId, 1, `Book two found`);
        assert.equal(bookTwo.totalCount, 2, `Book two totalCount is 2`);
        assert.equal(bookTwo.availableCount, 2, `Book two availableCount is 2`);
        assert.equal(bookTwo.title, title_2, `Book with title '${title_2}' found`);

        const bookThr = await theLibrary.getBook(2);
        assert.equal(bookThr.bookId, 2, `Book thr found`);
        assert.equal(bookThr.title, title_3, `Book with title '${title_3}' found`);
    });

    it('Test: addNewBook - violation', async function () {
        try {
            await theLibrary.addNewBook("some title", 100, { from: account_1 });
        }
        catch (error) {
            assert.notEqual(error, undefined, 'Error must be thrown');
            assert.isAbove(error.message.search('Ownable: caller is not the owner'), -1, "Ownable: caller is not the owner");
        }
    });

    it('Test: addBookCopy', async function () {
        const bookTwo = await theLibrary.getBook(1);
        assert.equal(bookTwo.totalCount, 2, `Book two totalCount is 2`);
        assert.equal(bookTwo.availableCount, 2, `Book two availableCount is 2`);

        await theLibrary.addBookCopy(1, 12, { from: account_owner });
        const bookTwoAfter = await theLibrary.getBook(1);
        assert.equal(bookTwoAfter.totalCount, 14, `Book two totalCount is 14`);
        assert.equal(bookTwoAfter.availableCount, 14, `Book two availableCount is 14`);
    });

    it('Test: addBookCopy - violation', async function () {
        try {
            await theLibrary.addBookCopy(1, 12, { from: account_1 });
        }
        catch (error) {
            assert.notEqual(error, undefined, 'Error must be thrown');
            assert.isAbove(error.message.search('Ownable: caller is not the owner'), -1, "Ownable: caller is not the owner");
        }
    });

    it('Test: Book creation', async function () {
        let allbooks = await theLibrary.getBooks();
        assert.equal(allbooks.length, 3, 'Three books added');

        const bookTwo = await theLibrary.getBook(1);
        assert.equal(bookTwo.bookId, 1, `Book two found`);
        assert.equal(bookTwo.totalCount, 2, `Book two totalCount is 2`);
        assert.equal(bookTwo.availableCount, 2, `Book two availableCount is 2`);
        assert.equal(bookTwo.title, title_2, `Book with title '${title_2}' found`);
    });

    it('Test: Available counter', async function () {
        await theLibrary.borrowBook(1, { from: account_1 });
        await theLibrary.borrowBook(1, { from: account_2 });

        const books = await theLibrary.getBooks();

        const bookTwo = await theLibrary.getBook(1);
        assert.equal(bookTwo.availableCount, 0, 'Book two availableCount should be 0');
    });

    it('Test: Available counter and return', async function () {
        await theLibrary.borrowBook(1, { from: account_1 });
        await theLibrary.borrowBook(1, { from: account_2 });

        let bookTwo = await theLibrary.getBook(1);
        assert.equal(bookTwo.availableCount, 0, 'Book two availableCount should be 0');

        await theLibrary.returnBook(1, { from: account_2 });

        bookTwo = await theLibrary.getBook(1);
        assert.equal(bookTwo.availableCount, 1, 'Book two availableCount should be 0');
    });

    it('Test: Borrow violation - availableCount should be 0', async function () {
        await theLibrary.borrowBook(1, { from: account_1 });
        await theLibrary.borrowBook(1, { from: account_2 });

        try {
            await theLibrary.borrowBook(1, { from: account_3 });
        }
        catch (error) {
            assert.notEqual(error, undefined, 'Error must be thrown');
            assert.isAbove(error.message.search('The book is not available'), -1, "The book is not available");
        }
    });

    it('Test: Borrow violation - try borrow again the same book', async function () {
        // add three books
        await theLibrary.borrowBook(2, { from: account_1 });
        await theLibrary.borrowBook(2, { from: account_2 });

        try {
            await theLibrary.borrowBook(2, { from: account_2 }); // should throw error
        }
        catch (error) {
            assert.notEqual(error, undefined, 'Error must be thrown');
            assert.isAbove(error.message.search('Only one copy of book per address'), -1, "Only one copy of book per address");
        }
    });

    it('Test: Borrow violation - try to return not borrowed book', async function () {
        await theLibrary.borrowBook(1, { from: account_1 });
        await theLibrary.borrowBook(1, { from: account_2 });

        try {
            await theLibrary.returnBook(2, { from: account_2 });
        }
        catch (error) {
            assert.notEqual(error, undefined, 'Error must be thrown');
            assert.isAbove(error.message.search('Book not borrowed by sender'), -1, "Book not borrowed by sender");
        }
    });
});