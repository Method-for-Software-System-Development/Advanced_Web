import app from '../src/server';
import { connectToDatabase } from '../src/utils/dbConnection';

// Ensure database connection is established
connectToDatabase().catch(console.error);

export default app;
