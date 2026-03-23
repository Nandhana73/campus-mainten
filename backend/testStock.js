const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/campus')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const Stock = require('./models/stock.js');

async function testStock() {
  try {
    // Test create
    const newStock = new Stock({
      item: 'Test Hammer',
      qty: 10,
      location: 'Tool Room'
    });
    await newStock.save();
    console.log('Created:', newStock);
    
    // Test find
    const stocks = await Stock.find();
    console.log('All stocks:', stocks);
    
    // Test delete
    await Stock.findByIdAndDelete(stocks[0]._id);
    console.log('Deleted first stock');
  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    mongoose.connection.close();
  }
}

testStock();
