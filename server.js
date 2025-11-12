const express = require('express')
const { connectToDb, getDb } = require('./db')
const { ObjectId } = require('mongodb')

const app = express()

app.use(express.json())

let db;

app.post('/test', (req, res) => {
  console.log('✅ POST /test route hit!');
  res.status(200).json({ message: 'Test successful' });
});

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

app.post('/Broadway', async (req, res) => {
  console.log('POST /Broadway hit');
  console.log('Request body:', req.body);

  try {
    const result = await db.collection('Musicals').insertOne(req.body);
    console.log('Insert result:', result);
    res.status(201).json(result);
  } catch (err) {
    console.error('❌ Error inserting musical:', err);
    res.status(500).json({ error: err.message });
  }
});
