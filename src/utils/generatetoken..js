import jwt from "jsonwebtoken"

const genertetoken=(id)=>{
       return jwt.sign({id},"suhiuahihiugigs",{
        expiresIn:"30d"
       })
}

export {
    genertetoken
}