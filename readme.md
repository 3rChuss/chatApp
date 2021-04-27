#Basic chat app with node.js, graphql, mySql & react

npm install

Connect your database in config/config.json

Development
npm run dev


Used sequelize to create the schema models
sequelize model:generate --name User --attributes username:string,email:string,phone:string