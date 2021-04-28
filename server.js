const { ApolloServer } = require("apollo-server");

const { sequelize } = require('./models');

// A map of functions which return data for the schema.
const resolvers = require('./grapqhql/resolvers');
const typeDefs = require("./grapqhql/typeDefs");
const contextMiddleware = require("./Middleware/context");

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: contextMiddleware
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);

  sequelize
    .authenticate()
    .then(() => console.log("==> Database Connected"))
    .catch((err) => console.log(err));
  
    //Disable query going out to the console. (Enable only for debbuging)
    sequelize.options.logging = false;
});
