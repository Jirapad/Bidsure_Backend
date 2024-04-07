module.exports = (sequelize,DataTypes) => {
    const User = sequelize.define("user",{
        fullname:{
            allowNull:false,
            type: DataTypes.STRING,
            validate:{
                notEmpty: true,
                notNull: {
                    msg: 'Null, Please provide a username'
                }
            }
        },
        username:{
            allowNull:false,
            type: DataTypes.STRING,
            unique: true,
            validate:{
                notEmpty: true,
                notNull: {
                    msg: 'Null, Please provide a username'
                }
            }
        },
        email:{
            allowNull:false,
            type: DataTypes.STRING,
            unique: true,
            validate:{
                isEmail:{
                    msg: 'invalid email format'
                },
                notEmpty: true,
                notNull: {
                    msg: 'Null, Please provide a username'
                }
            }
        },
        password:{
            allowNull:false,
            type: DataTypes.STRING,
            validate:{
                notEmpty: true,
                notNull: {
                    msg: 'Null, Please provide a username'
                }
            }
        },
        addresses:{
            type: DataTypes.ARRAY(DataTypes.STRING),
            defaultValue: []
        },
        image:{
            type: DataTypes.STRING
        },
        bio:{
            type: DataTypes.STRING
        },
        following:{
            type: DataTypes.ARRAY(DataTypes.STRING)
        }
    })

    //User.hasMany(Address,{foreignKey:'userId'})
    //Address.belongsTo(User,{foreignKey:'userId'})

    // User.hasOne(Auction, { foreignKey: 'host' });
    // Auction.belongsTo(User, { foreignKey: 'host' });

    // User.associate = (models) => {
    //     User.hasOne(models.Auction, { foreignKey: 'host' });
    // };

    return User

}