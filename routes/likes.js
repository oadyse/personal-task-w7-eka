const express = require('express');
const joi = require('joi')
const { Op } = require('sequelize');
const authMiddleware = require('../middlewares/auth-middleware');
const { Like, Post } = require('../models')

const router = express.Router();

router.get('/like', authMiddleware, async(req,res) => {
    const { user } = res.locals
    const userId = user.dataValues.userId
    const like = await Like.findAll({ where: { userId } })
    res.json({
        data: like
    })
})

router.post('/like/:postId', authMiddleware, async(req, res) => {
    const { user } = res.locals
    const userId = user.dataValues.userId
    const {postId} = req.params

    const createLike = await Like.create({
            postId,
            userId,
        })
    
    const post = await Post.findOne({postId})
    const likes = await Like.findAll({postId})
    const updatePostLike = await post.update({
        likes : likes.length
    })

    res.send(200).json({
        postId,
        likes: updatePostLike
    })
})

module.exports = router