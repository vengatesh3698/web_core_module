var subscriptionExpiry = {};
var Inventory = __db_model.Inventory;

subscriptionExpiry.Execute = function(){
    const subscription_expiry = new Date().setHours(23,59,59,999);
    const sub_obj = {
        "expiry_date" : subscription_expiry,
        "status"      : 'Active'
    }
    Inventory.update({status:'Expire'},{where:sub_obj}).then(function(subs){

    })
}
module.exports = subscriptionExpiry;
