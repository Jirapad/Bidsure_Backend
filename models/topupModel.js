module.exports = (sequelize,DataTypes) => {
    const Topup = sequelize.define("topup",{
        userId:{
            allowNull:false,
            type: DataTypes.INTEGER,
            references:{
                model:'users',
                key:'id'
            }
        },
        time:{
            allowNull:false,
            type: DataTypes.DATE
        },
        price:{
            allowNull:false,
            type: DataTypes.DECIMAL
        },
        status:{
            type:DataTypes.STRING
        },
        sessionId:{
            type: DataTypes.STRING
        },
        orderId:{
            type: DataTypes.STRING
        }
    })
    return Topup
}