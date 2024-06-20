var SYNC_DATA = {};
var ServerSetting = __db_model.ServerSetting;
var Endpointer = __db_model.Endpointer;
var EndPointTransaction = __db_model.EndPointTransaction;
var Org = __WEB_db_model.Org;
var User = __WEB_db_model.User;
var Subscription = __db_model.Subscription;
var API_CLI = require(__root+__core+'modules/ClientModule.js');
var Handlebars = require('handlebars');

var MAP = {
        'org_creation':{'db':Org, 'field':'org_id'},
        'org_updation':{'db':Org, 'field':'org_id'},
        'org_deactivate':{'db':Org, 'field':'org_id'},
        'user_creation':{'db':User, 'field':'user_id'},
        'user_updation':{'db':User, 'field':'user_id'},
        'subscription_creation':{'db':Subscription, 'field':'subscription_id'},
        'subscription_updation':{'db':Subscription, 'field':'subscription_id'},
        'subscription_deactivation':{'db':Subscription, 'field':'subscription_id'},
        'subscription_renewal':{'db':Subscription, 'field':'subscription_id'},
        'subscription_activation':{'db':Subscription, 'field':'subscription_id'}

}
function changeMapValue(map, key, newValue) {
       if (map.hasOwnProperty(key)) map[key] = newValue;
	return map;
}
const endPointerFormation = (type, payload) => {
        return new Promise(resolve => {
                Endpointer.findOne({
                        raw:true,
                        where:{endpoint_name:type},
                        attributes:['api','method','payload'],
                        include:[{model:ServerSetting,attributes:['url','name','token']}]
                }).then(end_point => {
			const nextInteration = (data) => {
  			        this.url = end_point['server.url'] + end_point.api + '/' + end_point.endpoint_name;
			        this.method = end_point.method;
			        this.token = end_point['server.token'];
			        this.module = end_point.endpoint_name;
			        this.result = data;
			        return resolve(this);
			};
			end_point.payload = (typeof end_point.payload == 'string') ? JSON.parse(end_point.payload) : end_point.payload;
			if(type=='subscription_creation' || type=='subscription_renewal' || type=='subscription_deactivation' || type=='subscription_activation'){
                                var backup_end_point = JSON.stringify(end_point.payload);
				var array=payload,index=0;
				var finalArr=[];
				const callFunction=(object,index)=>{
					const callback=(index)=>{
						if(array.length==index) return nextInteration(finalArr);
						callFunction(array[index], index);
					};
					var count = 1;
                                        end_point.payload = JSON.parse(backup_end_point)
                                        var obj_keys = Object.keys(end_point.payload);
                                        var obj_length = obj_keys.length;
                                        obj_keys.forEach((keys,key_index)=> {
                                            let modifiedMap = changeMapValue(end_point.payload, keys, object[end_point.payload[keys]])
                                            if((key_index+1) == obj_length){
                                                finalArr.push(modifiedMap);
                                                callback(index+1);
                                            }
                                        })
                                        /*
                        		for (keys in end_point.payload) {
                                		let modifiedMap = changeMapValue(end_point.payload, keys, object[end_point.payload[keys]]);
		                                count++;
                		                if (Object.keys(end_point.payload).length == count) {
							finalArr.push(modifiedMap);
							callback(index+1);
						}
                        		}
                                        */

				};
					callFunction(array[index],index)

			}else{
				var count = 1;
				for (keys in end_point.payload) {
                                       let modifiedMap = changeMapValue(end_point.payload, keys, payload[end_point.payload[keys]]);
                                        count++;
                                        if (Object.keys(end_point.payload).length == count) {
						nextInteration(modifiedMap)
                                        }
                                 }
			}
                        if(type == 'get_transaction'){
                                this.url = end_point['server.url']+end_point.api+'/'+payload.transaction_id;
                        }else{
                                this.url = end_point['server.url']+end_point.api+'/'+type;
                        }
                        this.method = end_point.method;
                        this.token = end_point['server.token'];
                        return resolve(this);
                },err=>{
                        return resolve(0)
                });
        })
}

SYNC_DATA.dataProcess = (payload, type, cb) => {
                function guid() {
                    function s4() {
                        return Math.floor((1 + Math.random()) * 0x10000)
                        .toString(16)
                        .substring(1);
                   }
                    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
                }
                var trans_id = guid();
                if(type == 'subscription_creation' || type=='subscription_renewal' || type=='subscription_deactivation' || type=='subscription_activation'){
			payload['transaction_id']= trans_id;
                        payload.map(function(val){
                                val['transaction_id']= trans_id;
                        })
                }
                else if((!payload.end_point_status) || (payload.end_point_status == 'NOT_SENT')){
                        payload['transaction_id']= trans_id;
                }
                var end_point_transaction_obj = {
                        payload : payload,
                        status  : 'SENT',
                        type    : type,
                        transaction_id : trans_id
                }
        endPointerFormation(type,payload).then(res => {
                if(!res) return cb(0);

                const scb = (d) => {
                 EndPointTransaction.update({"receiver_transaction_id":d.receiver_transaction_id},{where:{"transaction_id":d.transaction_id}}).then(function(end_point_update){
                         cb(1);
                 })
                };
                const ecb = (e) => {
                        EndPointTransaction.update({ status: 'RETRY' }, { where: { 'transaction_id': e.transaction_id } })
                        cb(0) 
                };
                if(type == 'subscription_creation' || type=='subscription_renewal' || type=='subscription_deactivation' || type=='subscription_activation'){
			EndPointTransaction.create(end_point_transaction_obj).then(function(create_end_point){
                        payload.map(function(data, index){
                                var index_data = data;
                                update_db(index_data)
                                if(index+1 == payload.length){
					res.result['transaction_id']=payload[0]['transaction_id'];
                                        API_CLI.makeRequest(API_CLI.formRequest((res.result),res.method,res.token,res.url,null),scb,ecb)
                                }
                        })
                        function update_db(value){
                                var field = MAP[type]['field'];
                                var find_obj = {};
                                find_obj[field]=value[field]
                                MAP[type]['db'].update({'endpoint_transaction_id':trans_id},{where:find_obj}).then(function(update_trans){})
                        }
			})
                }else if((!payload.end_point_status) || (payload.end_point_status == 'NOT_SENT')){
                        EndPointTransaction.create(end_point_transaction_obj).then(function(create_end_point){
                               // var field = MAP[type]['field'];
                               // var find_obj = {}
                               // find_obj[field]=payload[field]
                                //MAP[type]['db'].update({'endpoint_transaction_id':trans_id},{where:find_obj}).then(function(update_trans){
                                        api_call(res.result,res);
                               // },function(err){})
                        })
                }else{
                        api_call(res.result,res);
                }
                function  api_call(result, res){
			var out = (typeof(result) == 'string') ? JSON.parse(result) : result;
                        API_CLI.makeRequest(API_CLI.formRequest(out,res.method,res.token,res.url,null),scb,ecb)
                }
        });
};

module.exports = SYNC_DATA
