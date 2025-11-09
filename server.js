const express = require('express')
const { connectToDb, getDb } = require('./db')
const { ObjectId } = require('mongodb')

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

app.get('/Broadway/title/:title', async (req, res) => {
  const titleParam = req.params.title
  console.log('Searching for title:', titleParam)

  try {
    const musical = await db.collection('Musicals').findOne({
      title: { $regex: new RegExp(`^${titleParam.trim()}$`, 'i') }
    })
    console.log('Found musical:', musical)

    if (!musical) return res.status(404).json({ error: 'No musical found' })

    res.status(200).json(musical)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Could not fetch document' })
  }
})

app.post('/Broadway', (req, res) => {
    const musical = req.body

    db.collection('Musicals')
    .insertOne(musical)
    .then(result => {
        res.status(201).json(result)
    })
    .catch(err => {
        res.status(500).json({err: 'Could not create new document'})
    })
})