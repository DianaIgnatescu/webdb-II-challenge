const express = require('express');
const helmet = require('helmet');
const knex = require('knex');
const knexConfig = require('./knexfile');

const db = knex(knexConfig.development);

const server = express();

server.use(express.json());
server.use(helmet());

// endpoints here

server.post('/api/zoos', (req, res) => {
  const { name } = req.body;
  if (!name) {
    res.status(400).json({ errorMessage: 'Please provide a name for the zoo.' });
  } else {
    db('zoos').insert({ name })
        .then(arrayOfIds => {
          return db('zoos').where({ id: arrayOfIds[0] })
        })
      .then(arrayOfRoles => {
        res.status(201).json(arrayOfRoles[0]);
      })
      .catch(error => {
        res.status(500).json({ errorMessage: 'The zoo could not be created. '});
      });
  }
});

server.get('/api/zoos', (req, res) => {
  db('zoos')
    .then((zoos) => {
      res.status(200).json(zoos);
    })
    .catch((error) => {
      res.status(500).json({ errorMessage: 'The zoos could not be retrieved.' });
    })
});

server.get('/api/zoos/:id', (req, res) => {
  const {id} = req.params;
  db('zoos')
    .where({ id: id })
    .then((zoo) => {
    if(!zoo) {
      res.status(404).json({ message: 'The zoo with the specified ID does not exist.' });
    } else {
      res.status(200).json(zoo)
    }
    })
    .catch((error) => {
      res.status(500).json({ error: 'The zoo information could not be retrieved.' });
    });
});

server.delete('/api/zoos/:id', (req, res) => {
  const { id } = req.params;
  db('zoos')
    .where({ id: id })
    .del()
    .then(count => {
      res.status(200).json({ message: `${count} item removed from the database.` });
    })
    .catch((error) => {
      res.status(500).json({ error: "The zoo record could not be deleted." });
    });
});

server.put('/api/zoos/:id', (req, res) => {
  const { id } = req.params;
  const zoo = req.body;
  if (!zoo) {
    res.status(400).json({ errorMessage: 'Please provide a name for the zoo.' });
  } else {
    db('zoos')
      .where({ id: id })
      .update(zoo)
      .then(() => {
        return db('zoos').where({id: id }).first();
      })
      .then( record => res.status(200).json(record))
      .catch(error => {
        res.status(500).json({ errorMessage: 'The zoo information could not be modified.' })
      });
  }
});

const port = 3300;
server.listen(port, function() {
  console.log(`\n=== Web API Listening on http://localhost:${port} ===\n`);
});
