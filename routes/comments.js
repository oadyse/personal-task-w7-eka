const express = require('express');
const joi = require('joi')
const { Op } = require('sequelize');
const authMiddleware = require('../middlewares/auth-middleware');
const { Comment } = require('../models')

const router = express.Router();

//Specific from postId
router.get('/comments/:postId', async (req, res) => {
    const { postId } = req.params
    const comments = await Comment.findAll({ where: { postId } })
    res.json({
        data: comments
    })
})

const commentSchema = joi.object({
    comment: joi.string().required()
})
router.post('/comments/:postId', authMiddleware, async (req, res) => {
    try {
        const { user } = res.locals
        const userId = user.dataValues.userId
        const { postId } = req.params
        const { comment } = await commentSchema.validateAsync(req.body)

        const createComment = await Comment.create({
            postId,
            userId,
            comment
        })
        return res.json({
            comment: createComment
        })
    } catch (err) {
        console.log(err);
        res.status(400).send({
            errorMessage: "The requested data type is not valid!"
        })
    }
})

router.put('/comments/:commentId', authMiddleware, async (req, res) => {
    const { commentId } = req.params
    const { comment } = await commentSchema.validateAsync(req.body) 
    const { user } = res.locals
    const userId = user.dataValues.userId
    const data = await Comment.findOne({ where: { commentId } })

    if (userId !== data.userId) {
        return res.status(400).json({ errorMessage: "Forbidden" })
    }
    if (!data) {
        return res.status(400).json({ errorMessage: "Data not found" })
    }

    if (!comment) {
        return res.json({ errorMessage: "Please enter the comment content" })
    }

    if (data) {
        await data.update(
            {
                comment: comment
            })
    }
    return res.json({
        result: 'success',
        success: true,
    })
})

router.delete('/comments/:commentId', authMiddleware, async (req, res) => {
    const { commentId } = req.params
    const { user } = res.locals
    const userId = user.dataValues.userId
    const data = await Comment.findOne({ where: { commentId } })

    if (!data) {
        return res.status(400).json({
            errorMessage: "Data not found"
        })
    }
    if (userId !== data.userId) {
        return res.status(400).json({ errorMessage: "Forbidden" })
    }
    if (data) {
        await data.destroy()
    }
    return res.json({
        result: 'success',
        success: true,
    })
})

module.exports = router