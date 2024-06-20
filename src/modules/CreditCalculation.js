var creditCalculation = {};
var Credit = __db_model.Credit;

creditCalculation.Calculate = function(obj, cb){
 Credit.findAll({raw:true,where:obj,order:[['createdAt','ASC']]}).then(function(trans){
    var array = {credit:0,debit:0}
    if(trans.length > 0){
      trans.map(function(item){
        if(item.type == 'Credit'){
          array.credit = array.credit + Number(item.amount);
        }
        else if(item.type == 'Debit'){
          array.debit = array.debit + Number(item.amount);
        }
      })
      var available_amount = (array.credit - array.debit)
      cb({status:200,msg:{'object':available_amount,'status':'success'}});
    }else{
        cb({status:500,	msg:{'object':'No Transaction found','status':'Failed'}});
    }
  },function(err){
    cb({status:500,msg:"There was a problem in finding the Transaction"});
  })
}

module.exports = creditCalculation;


