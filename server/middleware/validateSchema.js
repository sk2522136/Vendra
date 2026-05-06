import ExpressError from "../utils/expressError.js";


export const validateSchema = (schema) => {
  return (req,res,next)=>{
    let { error,value } = schema.validate(req.body,{
        stripUnknown: true
    });
   
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(errMsg,400 ); 
    } else {
        req.body = value;
        next();
    }
}
}