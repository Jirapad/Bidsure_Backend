module.exports = (sequelize,DataTypes) => {

    const Bidding = sequelize.define('bidding',{
        time:{
            allowNull:false,
            type: DataTypes.DATE,
        },
        auctionId:{
            allowNull:false,
            type: DataTypes.INTEGER,
            references:{
                model:'auctions',
                key:'id'
            }
        },
        userId:{
            allowNull:false,
            type: DataTypes.INTEGER,
            references:{
                model:'users',
                key:'id'
            }
        },
        price:{
            allowNull:false,
            type: DataTypes.DECIMAL
        },
    })
    return Bidding
}