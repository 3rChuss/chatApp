# Realtime chat app 

Real-time chat app made with Nodejs, Express and the wrong database (MySQL)



## Built using

#### Front-end

- [ReactJS](https://reactjs.org/) - Frontend framework
- [Apollo Client](https://www.apollographql.com/docs/react/) - State management library to manage both local and remote data with GraphQL
- [Apollo Subscriptions](https://www.apollographql.com/docs/react/data/subscriptions/) - Get real-time updates from your GraphQL server
- [Context API w/ hooks](https://reactjs.org/docs/context.html) - For state of user, selected chat, toast notifs, theme etc.
- [React Router](https://reactrouter.com/) - For general routing & navigation
- [React-Bootstrap](https://react-bootstrap.netlify.app/) - UI library

#### Back-end

- [Node.js](https://nodejs.org/en/) - Runtime environment for JS
- [Apollo Server](https://www.apollographql.com/docs/apollo-server/) - To build a self-documenting GraphQL API server
- [Apollo Subscriptions](https://www.apollographql.com/docs/apollo-server/data/subscriptions/) - Subscriptions are GraphQL operations that watch events emitted from Apollo Server.
- [MySQL](https://www.mysql.com/) - WRONG CHOOSE
- [Sequelize](https://sequelize.org/) - NodeJS ORM for SQL-based databases
- [Bcrypt.js](https://www.npmjs.com/package/bcryptjs) - For hashing passwords

## Features

- Authentication (login/register w/ email/phone & password)
- Real-time chat using web-sockets
- Private messaging with all registered users
- Creation of groups with users of choice
- Error management with descriptive messages
- Markdown chat support


#### config file:

```
  "development": {
    "username": "DDBBusername",
    "password": "password",
    "database": "database",
    "host": "127.0.0.1",
    "dialect": "mysql"

```

#### Client:

Open client/src/ApolloProvider.js & change the urls:

```
{
  uri: "http://localhost:4000"
  uri: "ws://localhost:4000/graphql"
}
```

Run client development server:

```
cd client
npm install
npm start
```

#### Server:

Open server/config/config.json & update the development keys values to match your local database credentials.

Install 'sequelize-cli' & 'nodemon' as global packages, if you haven't yet.

Run this command to migrate the SQL table to your own local PSQL:
`sequelize db:migrate`

For test porpuses run this command to seed your local database with some examples
`sequelize db:seed:all`

Run backend development server:

```
cd ./
npm install
npm run dev
```
