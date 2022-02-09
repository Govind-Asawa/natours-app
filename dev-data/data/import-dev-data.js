const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');

dotenv.config({ path: './config.env' });

const dbPass = process.env.DATABASE_PASSWORD;
const DB = process.env.DATABASE.replace('<PASSWORD>', dbPass);

data = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'));

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then((con) => {
    console.log('DB Connected!');
  });

const importData = async () => {
  try {
    await Tour.createTour(data);
    console.log('data imported!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    await Tour.deleteAll();
    console.log('data deleted!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') importData();
else if (process.argv[2] === '--delete') deleteData();
