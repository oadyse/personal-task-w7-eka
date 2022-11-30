const express = require('express')
const { User } = require('../models')
const jwt = require('jsonwebtoken')
const joi = require('joi')
const { Op } = require('sequelize')
const authMiddleware = require('../middlewares/auth-middleware')
const checkloginMiddleware = require('../middlewares/checklogin-middleware')
const SECRET_KEY = "SPARTA"

const router = express.Router()

const createUserSchema = joi.object({
    nickname: joi.string().required().min(3).alphanum(),
    password: joi.string().required().min(4),
    confirmPassword: joi.string().required()

})

router.post("/signup", async (req, res) => {
    try {
        const { nickname, password, confirmPassword } = await createUserSchema.validateAsync(req.body);

        if (password !== confirmPassword) {
            res.status(400).send({
                errorMessage: "The password is not the same as the password checkbox.",
            });
            return;
        }

        const existUsers = await User.findAll({
            where: {
                [Op.or]: [{ nickname }],
            },
        });
        if (existUsers.length) {
            res.status(400).send({
                errorMessage: "This is a duplicate nickname",
            });
            return;
        }

        await User.create({ nickname, password });

        res.status(201).send({});
    } catch (err) {
       console.log(err);
       res.status(400).send({
        errorMessage: "The requested data type is not valid!"
       }) 
    }
});

const loginUserSchema = joi.object({
   nickname: joi.string().required().alphanum(),
   password: joi.string().required()
})

router.post("/login", checkloginMiddleware, async (req, res) => {
    try {
        const { nickname, password } = await loginUserSchema.validateAsync( req.body );

        const user = await User.findOne({ where: { nickname, password } });

        if (!user) {
            res.status(400).send({
                errorMessage: "Wrong nickname or password.",
            });
            return;
        }

        const token = jwt.sign({ userId: user.userId }, SECRET_KEY);
        res.send({
            token,
        });
    } catch (err) {
       console.log(err);
       res.status(400).send({
        errorMessage: "The requested data type is not valid!"
       }) 
    }
});

router.get("/users/me", authMiddleware, async (req, res) => {
    const { user } = res.locals;
    console.log(user.dataValues.userId);
    res.send({
        user,
    });
});

router.get('/tes', async(req, res) => {
    console.log(res.locals);
    res.send({})
})

router.get('/logout', async(req, res) => {
    console.log(res.locals);
    res.end()
})

module.exports = router