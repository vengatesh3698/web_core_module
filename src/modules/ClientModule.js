const editJsonFile = require("edit-json-file");
const axios        = require('axios');
const https        = require('https');
const conf         = editJsonFile(__root+'config.json');
var API_CLI={};
var platform={
    'RESELLER':conf.data.reseller
};
API_CLI.formRequest=(payload,method,token,api,machine)=>{
    this.header={
        headers: {
            'x-access-token':token
        }
    };
    this.method=method.toLowerCase();
    this.api=(platform[machine])?platform[machine]+api:api;
    this.payload=(typeof payload == 'string') ? JSON.parse(payload) : payload;
    return this;
};

API_CLI.makeRequest=(obj,scb,ecb)=>{
    const agent = new https.Agent({ rejectUnauthorized: false });
    const instance = axios.create({ httpsAgent: agent });
    if(obj.method=='post'){
        instance.post(obj.api,obj.payload,obj.header).then(response=>{
            if(response && response.data) scb(response.data);
        },err=>{
        console.log("error",err)
            ecb(err);
        });
    }else if(obj.method=='put'){
        instance.post(obj.api,obj.payload,obj.header).then(response=>{
            if(response && response.data) scb(response.data);
        },err=>{
            ecb(err);
        });
    }else{
        instance.get(obj.api,obj.header).then(response=>{
            if(response && response.data) scb(response.data);
        },err=>{
            ecb(err);
        });
    };
};

module.exports=API_CLI;
