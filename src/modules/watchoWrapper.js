const axios = require('axios');
const url = 'https://api.mxplayer.in/v1/web/detail/browseItem?&pageSize=300&isCustomized=true&pageNum=0&browseLangFilterIds=hi&type=1&device-density=2&userid=91a4e0a6-bc89-4443-a455-15b39bbc9f7f&platform=com.mxplay.desktop&content-languages=hi,en&kids-mode-enabled=false';
var main_url="https://media-content.akamaized.net/"
var OwnOTT = __db_model.OTT;

function extractedData(jsonData){
        jsonData.items.map(item => {
          var obj={}
          if(item.stream!=null){
          obj.title=item.title
          if(item.stream.hls.high!=null){
            obj.media_url=main_url+item.stream.hls.high
          }else{
                obj.media_url=main_url+item.stream.hls.base
          }
          obj.genre =item.genres[0]
 obj.horizontal_url=main_url+item.imageInfo[0].url
          obj.vertical_url=main_url+item.imageInfo[item.imageInfo.length-1].url
          obj.user_id="28ff7bb0-0abc-11ee-97c6-6dbccd0a041c"
          OwnOTT.create(obj).then(function(create_data){
                                console.log("created successfully")
          },function(err){console.log("err in own ott", err)})
        }
        });
}
request_movie(url)
function request_movie(url,type){
        axios.get(url)
        .then(response => {
        // Handle the API response here
        extractedData(response.data)
        })
        .catch(error => {
        // Handle errors here
        console.error('Error:', error.message);
        });
}
