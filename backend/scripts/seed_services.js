const mongoose = require('mongoose');

const mongoURI = 'mongodb://127.0.0.1:27017/hms';

const initialServices = [
  { name: 'Premium Breakfast', price: 250, category: 'Food', icon: 'Utensils', status: 'Active' },
  { name: 'Extra Mattress', price: 500, category: 'Comfort', icon: 'Zap', status: 'Active' },
  { name: 'Mini Bar Subscription', price: 1200, category: 'Beverage', icon: 'Coffee', status: 'Active' },
  { name: 'High-Speed WiFi', price: 100, category: 'Tech', icon: 'Wifi', status: 'Active' },
];

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const Service = mongoose.connection.collection('services');
    
    for (const s of initialServices) {
      const exists = await Service.findOne({ name: s.name });
      if (!exists) {
        await Service.insertOne({
          ...s,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log(`Added Service: ${s.name}`);
      }
    }
    
    console.log('Finished populating services.');
    process.exit();
  })
  .catch(err => {
    console.error('Connection error:', err);
    process.exit(1);
  });
