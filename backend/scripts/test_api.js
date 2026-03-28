const axios = require('axios');

const test = async () => {
  try {
    const res = await axios.post('http://localhost:5000/api/inventory', {
      name: 'Test Item',
      category: 'Toiletries',
      stock: 5,
      minStock: 10,
      unit: 'pcs'
    });
    console.log('Success:', res.data);
  } catch (err) {
    console.log('Error:', err.response?.status, err.response?.data);
  }
};

test();
