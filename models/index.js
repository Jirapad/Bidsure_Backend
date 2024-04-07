require('dotenv').config()
const { Sequelize, DataTypes } = require('sequelize');

const config = {
    "development": {
        "username": process.env.DB_USERNAME,
        "password": process.env.DB_PASSWORD,
        "database": process.env.DB_NAME,
        "host": process.env.DB_HOST,
        "port": process.env.DB_PORT,
        "dialect": "postgres"
    },
    "production": process.env.DATABASE_URL
}

const sequelize = new Sequelize(config[process.env.NODE_ENV])

sequelize.authenticate().then(()=>{
    console.log('Connection has been established successfully.')
}).catch(error => {
    console.log('Unable to connect to the database:', error)
}) 

const db = {}

db.Sequelize = Sequelize
db.sequelize = sequelize

//add new model here!
db.users = require('./userModel')(sequelize,DataTypes)
db.auctions = require('./auctionModel')(sequelize,DataTypes)
db.topups = require('./topupModel')(sequelize,DataTypes)
db.transections = require('./transectionModel')(sequelize,DataTypes)

//define association
db.users.hasMany(db.auctions, { foreignKey: 'host' });
db.auctions.belongsTo(db.users, { foreignKey: 'host' });

db.users.hasMany(db.topups, {foreignKey: 'userId'})
db.topups.belongsTo(db.users,{foreignKey: 'userId'})

//db.users.hasMany(db.transections,{foreignKey:'buyerId'})
//db.transections.belongsTo(db.users,{foreignKey:'buyerId'})

//db.users.hasMany(db.transections,{foreignKey:'sellerId'})
//db.transections.belongsTo(db.users,{foreignKey:'sellerId'})

//db.auctions.hasOne(db.transections,{foreignKey:'auctionId'})
//db.transections.belongsTo(db.auctions,{foreignKey:'auctionId'})

//keep all column but constraints is same as first running
db.sequelize.sync({alter:true}).then(()=>{
    console.log('re-sync done!')
})

//reset all column
// db.sequelize.sync({force:true}).then(()=>{
//     console.log('re-sync done!')
// })

module.exports = db