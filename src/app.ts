import express, { Request, Response } from 'express';
import bodyParser from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import helmet from 'helmet';


// Load environmental variables if in development
if (process.env.NODE_ENV !== 'production') {
  const dotenv = require('dotenv');
  dotenv.config();
}

const PORT = process.env.PORT || 3000;


// Setup database connection
const DB_CONNECT_DEBUG = process.env.DB_CONNECT_DEBUG as string;

mongoose.connect(
  DB_CONNECT_DEBUG, 
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
  }, 
  () => {
    console.log(`Connected to the database`);
  }
)


const app = express();

// Apply midlewares
app.use(cors());
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});