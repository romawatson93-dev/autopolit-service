const jwt=require("jsonwebtoken");
const JWT_SECRET=process.env.JWT_SECRET||"dev_secret";
const ACCESS_TTL="15m", REFRESH_TTL="30d";
const refreshStore=new Map();
function signAccess(sub){return jwt.sign({sub,typ:"access"},JWT_SECRET,{expiresIn:ACCESS_TTL});}
function signRefresh(sub){const t=jwt.sign({sub,typ:"refresh"},JWT_SECRET,{expiresIn:REFRESH_TTL});refreshStore.set(t,sub);return t;}
function createSession(sub){return {accessToken:signAccess(sub),refreshToken:signRefresh(sub)};}
function refreshSession(rt){try{const p=jwt.verify(rt,JWT_SECRET);if(p.typ!=="refresh")throw Error();if(!refreshStore.has(rt))throw Error();return {accessToken:signAccess(p.sub)};}catch{let e=new Error("invalid_refresh_token");e.status=401;throw e;}}
function getViewerData(sub){return {userId:sub,role:"client",features:{viewer:true,screenshot:true},pagesCount:2};}
module.exports={createSession,refreshSession,getViewerData};
