
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');


const app = express();
app.use(bodyParser.json());


mongoose.connect('mongodb://0.0.0.0:27017/ticketDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;


const ticketSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    required: true,
    unique: true
  },
  numbers: {
    type: [[Number]],
    required: true
  }
});


const Ticket = mongoose.model('Ticket', ticketSchema);


app.post('/tickets', async (req, res) => {
  const { tickets } = req.body;

  try {
    const createdTickets = [];
    for (const ticketKey in tickets) {
      if (tickets.hasOwnProperty(ticketKey)) {
        const ticketNumbers = tickets[ticketKey];
        const ticketId = generateTicketId();

        const ticket = new Ticket({ ticketId, numbers: ticketNumbers });
        await ticket.save();
        createdTickets.push({ ticketId });
      }
    }

    res.json({ tickets: createdTickets });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create tickets' });
  }
});


app.get('/tickets', async (req, res) => {
  const { page, limit } = req.query;
  const pageNumber = parseInt(page) || 1;
  const limitNumber = parseInt(limit) || 10;

  try {
    const tickets = await Ticket.find()
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .exec();

    res.json({ tickets });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});


function generateTicketId() {
  return new Date().getTime().toString(); 
}

// Start the server
app.listen(4000, () => {
  console.log('Tambula ticket API server is running on port 4000');
});
