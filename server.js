const express = require('express')

const app = express()

app.listen(3000, () => {
    console.log('app is listening to port 3000')
})

app.get('/Broadway', (req, res) => {
    res.json({msg: "Welcome to Broadway"})
})