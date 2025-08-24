const crypto = require("crypto");
function parseInitData(raw) {
  const params = new URLSearchParams(raw);
  const map = {}; for (const [k,v] of params.entries()) map[k]=v;
  if (map.user) { try { map.user = JSON.parse(map.user); } catch{} }
  return map;
}
function verifyInitData(rawInitData, botToken, ttlSec=86400) {
  if (!rawInitData||!botToken) throw new Error("Missing initData or bot token");
  const data=parseInitData(rawInitData);
  const receivedHash=data.hash;
  if(!receivedHash) return {ok:false,reason:"no_hash"};
  const items=Object.keys(data).filter(k=>k!=="hash").sort()
    .map(k=>`${k}=${typeof data[k]==="object"?JSON.stringify(data[k]):data[k]}`);
  const dataCheckString=items.join("\n");
  const secretKey=crypto.createHmac("sha256","WebAppData").update(botToken).digest();
  const computedHash=crypto.createHmac("sha256",secretKey).update(dataCheckString).digest("hex");
  if(computedHash!==receivedHash) return {ok:false,reason:"bad_hash"};
  if(ttlSec && data.auth_date){
    const ageSec=Math.floor(Date.now()/1000)-Number(data.auth_date);
    if(ageSec>ttlSec) return {ok:false,reason:"expired"};
  }
  return {ok:true,data};
}
function makeDevInitData(sampleUser={id:777,first_name:"Dev",username:"devuser"}){
  const params=new URLSearchParams();
  params.set("query_id","AADevQueryId");
  params.set("user",JSON.stringify(sampleUser));
  params.set("auth_date",String(Math.floor(Date.now()/1000)));
  params.set("hash","FAKEHASH_DEV_ONLY");
  return params.toString();
}
module.exports={verifyInitData,makeDevInitData,parseInitData};
