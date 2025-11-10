const express = require('express')
const { connectToDb, getDb } = require('./db')
const { ObjectId } = require('mongodb')

const app = express()

app.use(express.json())

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
    db.collection('Musicals')
    .find()
    .sort({ title: 1 })
    .forEach(musical => musicals.push(musical))
    .then(() => {
        res.status(200).json(musicals)
    })
    .catch(() => {
        res.status(500).json({error: 'Could not fetch documents'})
    })
    //res.json({msg: "Welcome to Broadway"})
})

app.get('/Broadway/:id', (req, res) => {
    let musicals = []
    if(ObjectId.isValid(req.params.id)){
      db.collection('Musicals')
        .findOne({ _id: new ObjectId(req.params.id) })
        .then(doc => {
         res.status(200).json(doc)
        })
        .catch(err => {
        res.status(500).json({error: 'Could not fetch the document'})
        })
    } else {
        res.status(500).json({error: 'Could not fetch the document'})
    }
})

app.post('/Broadway', (req, res) => {
  console.log('Incoming POST request...')
  console.log('Request body:', req.body)

  if (!db) {
    console.error('Database not connected yet')
    return res.status(500).json({ error: 'Database not connected' })
  }

  const musical = req.body
  db.collection('Musicals')
    .insertOne(musical)
    .then(result => {
      console.log('Insert success:', result.insertedId)
      res.status(201).json(result)
    })
    .catch(err => {
      console.error('Insert error:', err)
      res.status(500).json({ error: 'Could not create new document' })
    })
})