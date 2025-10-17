const express = require('express')
const { connectToDb, getDb } = require('./db')

const app = express()

let db
connectToDb((err) => {
    if (!err) {
        app.listen(3000, () => {
        console.log('app is listening to port 3000')
        })
        db = getDb()
    }
})

app.get('/Broadway', (req, res) => {
    let musicals = []
    db.collections('Musicals')
    .find
    .sort({ Title: 1 })
    .forEach(musical => musicals.push(musical))
    .then(() => {
        res.status(200).json(musicals)
    })
    .catch(() => {
        res.status(500).json({error: 'Could not fetch documents'})
    })
    //res.json({msg: "Welcome to Broadway"})
})