const app = require("express")();
const { graphqlHTTP } = require("express-graphql");
const {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLString,
} = require("graphql");

// data

const authors = [
  { id: 1, name: "J. K. Rowling" },
  { id: 2, name: "J. R. R. Tolkien" },
  { id: 3, name: "Brent Weeks" },
];

const books = [
  { id: 1, name: "Harry Potter and the Chamber of Secrets", authorId: 1 },
  { id: 2, name: "Harry Potter and the Prisoner of Azkaban", authorId: 1 },
  { id: 3, name: "Harry Potter and the Goblet of Fire", authorId: 1 },
  { id: 4, name: "The Fellowship of the Ring", authorId: 2 },
  { id: 5, name: "The Two Towers", authorId: 2 },
  { id: 6, name: "The Return of the King", authorId: 2 },
  { id: 7, name: "The Way of Shadows", authorId: 3 },
  { id: 8, name: "Beyond the Shadows", authorId: 3 },
];

const AuthorType = new GraphQLObjectType({
  name: "Author",
  description: "Author of the book",
  fields: () => {
    return {
      id: { type: new GraphQLNonNull(GraphQLInt) },
      name: { type: new GraphQLNonNull(GraphQLString) },
      books: {
        type: new GraphQLList(BookType),
        resolve: (author) => books.filter((book) => book.authorId === author.id),
      },
    };
  },
});

const BookType = new GraphQLObjectType({
  name: "Book",
  description: "Book name and the author",
  fields: () => {
    return {
      id: { type: new GraphQLNonNull(GraphQLInt) },
      name: { type: new GraphQLNonNull(GraphQLString) },
      authorId: { type: new GraphQLNonNull(GraphQLInt) },
      author: {
        type: AuthorType,
        resolve: (book) => authors.find((author) => author.id === book.authorId),
      },
    };
  },
});

const RootQueryType = new GraphQLObjectType({
  name: "Query",
  description: "Root Query",
  fields: () => {
    return {
      book: {
        type: BookType,
        description: "A single book",
        args: {
          id: { type: GraphQLInt },
        },
        resolve: (parent, args) => books.find((book) => book.id === args.id),
      },
      books: {
        type: new GraphQLList(BookType),
        description: "List of all books",
        resolve: () => books,
      },
      author: {
        type: AuthorType,
        args: {
          id: { type: GraphQLInt },
        },
        resolve: (parent, args) => authors.find((author) => author.id === args.id)
      },
      authors: {
        type: new GraphQLList(AuthorType),
        description: "List of authors",
        resolve: () => authors,
      },
    };
  },
});

const RootMutationType = new GraphQLObjectType({
  name: 'Mutation',
  description: 'Root Mutation',
  fields: () => {
    return {
      addBook: {
        type: BookType,
        description: 'Add a book',
        args: {
          name: { type: new GraphQLNonNull(GraphQLString) },
          authorId: { type: new GraphQLNonNull(GraphQLInt) }
        },
        resolve: (parent, args) => {
          const book = { id: books.length + 1, name: args.name, authorId: args.authorId };
          books.push(book)
          return book
        }
      },
      addAuthor: {
        type: AuthorType
      }
    }
  }
})

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType
});

app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    graphiql: true,
  })
);

app.listen(5000, () => console.log("Server running"));
