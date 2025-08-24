const jwt=require("jsonwebtoken");
const JWT_SECRET=process.env.JWT_SECRET||"dev_secret";
module.exports=function(req,res,next){
  const h=req.headers.authorization||"";const [,t]=h.split(" ");
  if(!t) return res.status(401).json({ok:false,error:"no_token"});
  try{const p=jwt.verify(t,JWT_SECRET);if(p.typ!=="access")return res.status(401).json({ok:false,error:"wrong_type"});
    req.user={sub:p.sub};next();}catch{res.status(401).json({ok:false,error:"invalid_token"});}
};
