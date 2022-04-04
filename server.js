const mongoose = require('mongoose');
const dotenv = require('dotenv');
//This reads configurations from the config file and places 'em into the process module
dotenv.config({ path: './config.env' });
const app = require('./app');

const dbPass = process.env.DATABASE_PASSWORD;
const DB = process.env.DATABASE.replace('<PASSWORD>', dbPass);

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

const port = process.env.PORT || 8000;
const server = app.listen(port, () =>
  console.log(`started listening to requests at port ${port}`)
);

// All the unhandled Promise rejections need to be handled
process.on('unhandledRejection', (err) => {
  console.error(err.message);
  server.close(() => {
    console.log('closed the server');
    process.exit(1);
  });
});

// Heroku
process.on('SIGTERM', (err) => {
  console.log('Received SIGTERM Signal. Shutting down...');
  // This finishes all the pending requests before closing the server
  server.close(() => {
    console.log('Exiting the process...');
  });
});
