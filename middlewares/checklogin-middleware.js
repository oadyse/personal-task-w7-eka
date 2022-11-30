module.exports = async(req,res,next) => {
	const {authorization} = req.headers
    if (authorization) {
        return res.status(400).send({errorMessage: "You have been logged in"})
    }
    next()
}