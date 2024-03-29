// db.js

const mongoose = require('mongoose');

const mongoURI = 'mongodb+srv://user:user@jms.c0vv4uq.mongodb.net/JMS';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });


const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});
