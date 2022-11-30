const express = require('express');
const joi = require('joi')
const { Op } = require('sequelize');
const authMiddleware = require('../middlewares/auth-middleware');

const { Post } = require('../models')

const router = express.Router();

router.get('/posts', async (req, res) => {
    const posts = await Post.findAll();
    const result = posts.map(post => {
        return post
    })

    res.json({ data: result })
})


const postSchema = joi.object({
    title: joi.string().required(),
    content: joi.string().required()
})

router.post('/posts', authMiddleware, async (req, res) => {
    try {
        const { title, content } = await postSchema.validateAsync(req.body)
        const { user } = res.locals
        const userId = user.dataValues.userId
        const posts = await Post.findOne({ where: { title } })
        if (posts) {
            return res.status(400).json({
                success: false,
                errorMessage: 'The post already exists'
            })
        }
        const createPost = await Post.create({
            userId,
            title,
            content
        })
        return res.json({
            post: createPost
        })
    } catch (err) {
        console.log(err);
        res.status(400).send({
            errorMessage: "The requested data type is not valid!"
        })
    }
})

router.get('/posts/:postId', async (req, res) => {
    try {
        const { postId } = req.params
        const post = await Post.findOne({ where: { postId } })

        if (post.length === 0) {
            return res.json({
                success: true,
                errorMessage: 'Data is empty'
            })
        }
        res.json({ data: post })
    } catch (error) {
        console.log(error);
        res.status(400).send({
            errorMessage: "Data is empty"
        })
    }
})

router.put('/posts/:postId', authMiddleware, async (req, res) => {
    const { title, content } = await postSchema.validateAsync(req.body)
    const { postId } = req.params
    const { user } = res.locals
    const userId = user.dataValues.userId
    const post = await Post.findOne({ where: { postId } })

    if (userId !== post.userId) {
        return res.status(400).json({ errorMessage: "Forbidden"})
    }
    
    if (!post) {
        return res.status(400).json({ errorMessage: "Data not found" })
    }

    if (post) {
        await post.update(
            {
                title: title,
                content: content
            })
    }
    res.json({
        result: 'success',
        success: true,
    })
})

router.delete('/posts/:postId', authMiddleware, async (req, res) => {
    const { user } = res.locals
    const userId = user.dataValues.userId
    const {postId} = req.params
    const post = await Post.findOne({ where: { postId } })

    if (!post) {
        return res.status(400).json({
            errorMessage: "Data not found"
        })
    }

    if (userId !== post.userId) {
        return res.status(400).json({ errorMessage: "Forbidden"})
    }

    if (post) {
        await post.destroy()
    }
    res.json({
        result: 'success',
        success: true,
    })
})



module.exports = router