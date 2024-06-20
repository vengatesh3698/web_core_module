const jwt         = require('jsonwebtoken'),
    User          = __db_model.User,
    conf          = require(__root+'config.json');

const accessVerification=(role,url,method)=>{
    var access = require(__root+__core+'ApiMapper.json');
    if(!access[url]) return false;
    if(!access[url][method]) return false;
    if(!access[url][method].includes(role)) return false;
    else return true;
};

const VerifyToken=(req,res,next)=>{
	if(!req.headers['x-access-token']) return res.status(403).send({auth:false,message:'No token provided'});
 	jwt.verify(req.headers['x-access-token'],conf.secret_key,(err,decoded)=>{
        	if(err) return res.status(401).send({auth:false,message:'Failed to authenticate token'});
		if(decoded && decoded.provider_id) req.providerId = decoded.provider_id;
        	User.findOne({raw:true,where:{user_id:decoded.id,status:true}}).then(user=>{
	    		if(!user) return res.status(403).send("No permission to access");
    			// if(!accessVerification(user['roles'],req.baseUrl,req.method)) return res.status(403).send("No permission to access");
      			req.userId=user.user_id;
      			req.user_type=user.type;
	      		req.orgId=user.org_id;
	      		req.roles=user.roles;
			req.username = user.username;
    			next();
		});
    	});
};
module.exports=VerifyToken;

