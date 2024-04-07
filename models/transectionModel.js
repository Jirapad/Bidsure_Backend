module.exports = (sequelize,DataTypes) => {

    const Transection = sequelize.define('transection',{
        time:{
            allowNull:false,
            type: DataTypes.DATE,
        },
        auctionId:{
            allowNull:false,
            type: DataTypes.INTEGER,
            unique: true,
            references:{
                model:'auctions',
                key:'id'
            }
        },
        buyerId:{
            allowNull:false,
            type: DataTypes.INTEGER,
            references:{
                model:'users',
                key:'id'
            }
        },
        sellerId:{
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
    return Transection
}