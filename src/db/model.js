const { Sequelize } = require('sequelize');
const config = require(__root+__core+'config.json');

global.Op = Sequelize.Op;
const operatorsAliases = {
    $notIn : Op.likenotIn,
    $like  : Op.like,
    $gte   : Op.gte,
    $lte   : Op.lte,
    $lt    : Op.lt,
    $gt    : Op.gt,
    $ne    : Op.ne,
    $or    : Op.or,
    $eq    : Op.eq,
    $col   : Op.col,
    $in    : Op.in,
    $cast  : (value, type) => Sequelize(`CAST(${value} AS ${type})`)
};
const sequelize = new Sequelize(config.db_name,config.db_username,config.db_password,{
	host : config.host,
	port : config.port,
	dialect : 'postgres',
	logging : false,
    timezone :'+05:30',
	operatorsAliases,
	dialectOptions: {
        statement_timeout: 60000
    }
});

sequelize.sync().then(success=>{
	console.log('WEB Database connected successfully');
},err=>{
	console.log("There was a problem to connecting Database "+ err);
});

var User = sequelize.define('users',{
	org_id        : { type:Sequelize.UUID},
  	user_id		  : { type:Sequelize.UUID,defaultValue:Sequelize.UUIDV1,primaryKey:true},
  	roles    	  : { type:Sequelize.STRING},
  	username	  : { type:Sequelize.STRING },
  	mobile 		  : { type:Sequelize.STRING },
  	email		  : { type:Sequelize.STRING,unique:true },
  	password	  : { type:Sequelize.STRING },
  	status		  : { type:Sequelize.BOOLEAN },
  	profile		  : { type:Sequelize.STRING,defaultValue:'image1'},
    type          : { type:Sequelize.STRING },
    logo          : { type:Sequelize.STRING },
    logo_insertion  : { type:Sequelize.BOOLEAN },
    admin_id        : { type:Sequelize.UUID},
    subscriber_limit : { type:Sequelize.STRING, defaultValue:0},
    partner_code          : { type:Sequelize.STRING }
});

var ResellerPackage = sequelize.define('reseller_package' ,{
    package_name : { type : Sequelize.STRING},
    package_id   : { type : Sequelize.UUID},
});

User.hasMany(ResellerPackage,{foreignKey:'user_id',onUpdate:'CASCADE',onDelete:'CASCADE'});


var Channel = sequelize.define('channels' ,{
    channel_id  : { type :Sequelize.UUID, defaultValue: Sequelize.UUIDV1, primaryKey : true},
    name        : { type : Sequelize.STRING },
    image_url   : { type : Sequelize.STRING },
    url       	: { type : Sequelize.STRING },
    lcn			: { type : Sequelize.INTEGER },
    language	: { type : Sequelize.STRING},
    genres 		: { type : Sequelize.STRING },
    user_id 		: { type : Sequelize.UUID },
    description 		: { type : Sequelize.STRING(5000) }
});

var Category = sequelize.define('category', {
    category_id       : { type : Sequelize.UUID, defaultValue : Sequelize.UUIDV1 , primaryKey:true},
    name              : { type : Sequelize.STRING ,unique: true},
    type              : { type : Sequelize.STRING }
});

var Inventory = sequelize.define('inventory' ,{
    inventory_id    : { type :Sequelize.UUID, defaultValue: Sequelize.UUIDV1, primaryKey : true},
    serial_no       : { type : Sequelize.STRING, unique : true },
    mac             : { type : Sequelize.STRING },
    status          : { type : Sequelize.STRING },
    subscriber_name : { type : Sequelize.STRING },
    expiry_date     : { type : Sequelize.DATE },
    reseller_id     : { type :Sequelize.UUID },
    reseller_name   : { type :Sequelize.STRING }
});

var InventoryPackage = sequelize.define('inventory_package' ,{
    package_name : { type : Sequelize.STRING},
    package_id   : { type : Sequelize.UUID},
    duration     : { type : Sequelize.STRING}
});

Inventory.hasMany(InventoryPackage,{foreignKey:'inventory_id',onUpdate:'CASCADE',onDelete:'CASCADE'});

var Package = sequelize.define('package' ,{
    package_id   : { type : Sequelize.UUID , defaultValue: Sequelize.UUIDV1, primaryKey : true},
    package_name : { type : Sequelize.STRING},
    package_cost : { type : Sequelize.FLOAT},
    user_id      : { type : Sequelize.UUID },
    duration     : { type : Sequelize.STRING }

});

var App = sequelize.define('app' ,{
    app_id   		: { type : Sequelize.UUID , defaultValue: Sequelize.UUIDV1, primaryKey : true},
    name 		: { type : Sequelize.STRING, unique :true},
    authentication_url  : { type : Sequelize.STRING }
});

var PackageChannels = sequelize.define('package_channels' ,{
    channel_id   : { type : Sequelize.UUID},
    name         : { type : Sequelize.STRING}
}); 

Package.hasMany(PackageChannels,{foreignKey:'package_id',onUpdate:'CASCADE',onDelete:'CASCADE'});

var Logo = sequelize.define('logo' ,{
    logo_id   : { type : Sequelize.UUID},
    user_id   : { type : Sequelize.UUID},
    x_axis    : { type : Sequelize.STRING},
    y_axis    : { type : Sequelize.STRING},
    logo      : { type : Sequelize.STRING}
});

var OTT = sequelize.define('ott' ,{
    ott_id  : { type :Sequelize.UUID, defaultValue: Sequelize.UUIDV1, primaryKey : true},
    title        : { type : Sequelize.STRING,unique:true },
    media_url   : { type : Sequelize.STRING(5000) },
    horizontal_url         : { type : Sequelize.STRING },
    vertical_url                 : { type : Sequelize.STRING },
    language    : { type : Sequelize.STRING},
    genre              : { type : Sequelize.STRING },
    user_id             : { type : Sequelize.UUID },
    description              : { type : Sequelize.STRING(5000) }
});

var Appupdate = sequelize.define('app_update' ,{
    app_id              : { type : Sequelize.UUID , defaultValue: Sequelize.UUIDV1, primaryKey : true},
    name                : { type : Sequelize.STRING, unique :true},
    version             : { type : Sequelize.FLOAT },
    apk                 : { type : Sequelize.STRING }

});

var Webseries = sequelize.define('webseries' ,{
    web_id  : { type :Sequelize.UUID, defaultValue: Sequelize.UUIDV1, primaryKey : true},
    title        : { type : Sequelize.STRING,unique:true },
    horizontal_image         : { type : Sequelize.STRING },
    vertical_image                 : { type : Sequelize.STRING },
    language    : { type : Sequelize.STRING},
    genre              : { type : Sequelize.STRING },
    description              : { type : Sequelize.STRING(5000) }
});

var WebEpisodes = sequelize.define('web_episodes' ,{
    season_name         : { type : Sequelize.STRING},
    episode_title         : { type : Sequelize.STRING},
    season_number         : { type : Sequelize.STRING},
    episode_number         : { type : Sequelize.STRING},
    image  		: { type : Sequelize.STRING},
    media_url  		: { type : Sequelize.STRING}
});

Webseries.hasMany(WebEpisodes,{foreignKey:'web_id',onUpdate:'CASCADE',onDelete:'CASCADE'});

var Credit = sequelize.define('credit' ,{
    credit_id   : { type : Sequelize.UUID, defaultValue: Sequelize.UUIDV1, primaryKey : true},
    user_id   : { type : Sequelize.UUID},
    username    : { type : Sequelize.STRING},
    from_user_id   : { type : Sequelize.UUID},
    from_user_name   : { type : Sequelize.STRING},
    to_user_id   : { type : Sequelize.UUID},
    to_user_name   : { type : Sequelize.STRING},
    type    : { type : Sequelize.STRING},
    amount    : { type : Sequelize.STRING},
    subscriber_name    : { type : Sequelize.STRING},
    expiry_date    : { type : Sequelize.DATE},
    serial_no    : { type : Sequelize.STRING},
    mac    : { type : Sequelize.STRING},
    balance    : { type : Sequelize.STRING},
    is_subscribed   : { type :Sequelize.BOOLEAN}
});

var Advertisement = sequelize.define('advertisement' ,{
   adv_id   : { type : Sequelize.UUID, defaultValue: Sequelize.UUIDV1, primaryKey : true},
   title    : { type : Sequelize.STRING},
   frequency   : { type : Sequelize.INTEGER},
   bottom_image    : { type : Sequelize.STRING},
   left_image    : { type : Sequelize.STRING},
   slot    : { type : Sequelize.STRING},
})

var exportTable = {
	"User"         	   : User,
	"Channel"	       : Channel,
	"Category"	       : Category,
    "Inventory"        : Inventory,
    "InventoryPackage" : InventoryPackage,
    "Package"          : Package,
    "PackageChannels"  : PackageChannels,
    "ResellerPackage"  : ResellerPackage,
    "App" : App,
    "Logo" : Logo,
	"OTT" : OTT,
    "Appupdate" : Appupdate,
    "Webseries" : Webseries,
    "WebEpisodes" : WebEpisodes,
    "Credit" : Credit,
    "Advertisement":Advertisement
};

module.exports = exportTable;
