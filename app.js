const express = require('express')
const Route = require('./routes')


const app = express()
app.use(express.json())
const router = express.Router()
const port = 3001

app.use('/api', express.urlencoded({extended:false}), Route)

app.listen(port, () => {
    console.log(port, "Port is active");
})