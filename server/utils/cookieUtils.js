
export const setAuthCookie = (res,newAccessToken,refToken) => {
    res.cookie("accessToken" ,newAccessToken ,{
         httpOnly : true,
         secure:process.env.NODE_ENV === 'production',
         sameSite:process.env.NODE_ENV ==='production' ? 'none' :"strict",
         maxAge: 15 * 60 * 1000
        })

   res.cookie("refreshToken" ,refToken ,{
         httpOnly : true,
         secure:process.env.NODE_ENV === 'production',
         sameSite:process.env.NODE_ENV ==='production' ? 'none' :"strict",
         maxAge :  7 * 24 * 60 * 60 * 1000,
        })

}

export const clearAuthCookie = (res) =>{
   res.clearCookie("accessToken",{
            httpOnly : true,
            secure:process.env.NODE_ENV === 'production',
            sameSite:process.env.NODE_ENV ==='production' ? 'none' :"strict",
    })
      
    res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : "strict",
  });


}


