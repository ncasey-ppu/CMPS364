const express = require('express')
const { connectToDb, getDb } = require('./db')
const { ObjectId } = require('mongodb')

const app = express()
app.use(express.json())

let db
connectToDb((err) => {
    if (!err) {
        db = getDb();
        app.listen(3000, () => {
            console.log('Database connected and app listening.');
        });
    } else {
        console.log('Database connection failed:', err);
    }
});

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
    const musical = req.body

    db.collection('Musicals')
      .insertOne(musical)
      .then(result => {
        console.log('Insert successful.');
        res.status(201).json(result)
      })
      .catch(err => {
        res.status(500).json({err: 'Could not create new document'});
    })
})

//Delete by ID
app.delete('/Broadway/:id', (req, res) => {
    if (ObjectId.isValid(req.params.id)) {

    db.collection('Musicals')
      .deleteOne({ _id: new ObjectId(req.params.id) })
      .then(result => {
        res.status(200).json(result)
      })
      .catch(err => {
        res.status(500).json({error: 'Could not delete document'})
      })

    } else {
        res.status(500).json({error: 'Could not delete document'})
    }
})

//Delete without ID
app.delete('/Broadway', async (req, res) => {
    const query = req.body;
    try {
        const result = await db.collection('Musicals').deleteOne(query);
        if (result.deletedCount === 0) {
            return res.status(500).json({error: 'Could not delete document'})
        }
        res.status(200).json(result)
    } catch (err) {
        res.status(500).json({error: 'Could not delete document'})
      }
})