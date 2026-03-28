const mongoose = require('mongoose');

const mongoURI = 'mongodb://127.0.0.1:27017/hms';

const snackService = { name: 'Snacks', price: 80, category: 'Food', icon: 'Coffee', status: 'Active' };

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const Service = mongoose.connection.collection('services');
    
    const exists = await Service.findOne({ name: snackService.name });
    if (!exists) {
      await Service.insertOne({
        ...snackService,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`Added Service: ${snackService.name}`);
    } else {
      console.log('Snack service already exists.');
    }
    
    process.exit();
  })
  .catch(err => {
    console.error('Connection error:', err);
    process.exit(1);
  });
