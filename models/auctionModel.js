module.exports = (sequelize,DataTypes) => {

    const Auction = sequelize.define('auction',{
        name:{
            allowNull:false,
            type: DataTypes.STRING,
        },
        description:{
            type: DataTypes.STRING
        },
        startingPrice:{
            allowNull:false,
            type: DataTypes.FLOAT
        },
        minBid:{
            allowNull:false,
            type: DataTypes.FLOAT
        },
        mode:{
            allowNull:false,
            type: DataTypes.STRING
        },
        endTime:{
            allowNull:false,
            type: DataTypes.DATE
        },
        images:{
            allowNull:false,
            type: DataTypes.ARRAY(DataTypes.STRING)
        },
        host:{
            allowNull:false,
            type: DataTypes.INTEGER,
            //unique: true,
            references:{
                model:'users',
                key:'id'
            }
        }
    })

    // Auction.associate = (models) => {
    //     Auction.belongsTo(models.User, { foreignKey: 'host' });
    // };

    return Auction
}