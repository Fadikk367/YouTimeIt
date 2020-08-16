import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import helmet from 'helmet';

// Import routers
import exampleRoute from './routes/exampleRoute';
import registerRoute from './routes/register.route';
import loginRoute from './routes/login.route';
import serviceRoute from './routes/service.route';
import visitsRoute from './routes/visits.route';

// Import middlewares
import { authUser } from './middlewares/authUser';

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
app.use(morgan('common'));

// Connect routers
app.use('/example', authUser, exampleRoute);
app.use('/register', registerRoute);
app.use('/login', loginRoute);
app.use('/services', authUser, serviceRoute);
app.use('/visits', visitsRoute);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).send('Something broke!')
});

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});