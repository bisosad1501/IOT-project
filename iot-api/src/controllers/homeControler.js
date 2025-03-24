let getHomePage = async (req, res) => {
    try {
        // let data = await db.Airs.findAll()
        return res.render('homePage.ejs', {data: "Hello from backend server!"})
    } catch (error) {
        console.log(error)  
    }
}


module.exports = {
    getHomePage
}