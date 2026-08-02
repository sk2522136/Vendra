
import express from 'express';
import 'dotenv/config';
import connectDb from './config/db.js';
import cookieParser from 'cookie-parser';
import http from 'http';  
import { Server } from 'socket.io';  
import authRouter from './routes/authRoute.js';
import productRouter from './routes/productRoute.js';
import categoryRouter from './routes/categoryRoute.js';
import supplierRouter from './routes/supplierRoute.js';
import salesRouter from './routes/saleRoutes.js';
import inventoryRouter from './routes/inventoryRoutes.js';
import expenseRouter from './routes/expenseRoute.js';
import analyticalRouter from './routes/analyticalRoute.js';
import ExpressError from "./utils/expressError.js";
import customerRouter from './routes/customerRoute.js';
import paymentRouter from './routes/paymentRoute.js';
import chatbotRouter from './routes/chatbotRoute.js';
import voiceRouter from './routes/voiceRoute.js';
import backupRouter from './routes/backupRoute.js';
import pricingRouter from './routes/pricingRoute.js';
import superAdminRouter from './routes/superAdminRoute.js';
import startScheduleBackup from './utils/scheduleBackup.js';
import {handleStripeWebhook} from './controllers/pricingController.js'
import compression from 'compression';
import cors from 'cors';
import { attachSecurityHeaders, csrfProtection, sanitizeInput } from './middleware/security.js';



const app = express();
const server = http.createServer(app);
app.use(compression({
  level: 6, 
  threshold: 1024 
}));

//socket io setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"]
  }
});

// CONNECTION
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});


connectDb();
startScheduleBackup();

const allowedOrigin = ['http://localhost:5173', 'http://127.0.0.1:5173']

app.post('/api/billing/webhook', express.raw({ type: "application/json" }), handleStripeWebhook);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:true}));
app.use(cors({origin:allowedOrigin,credentials: true}));
app.use(attachSecurityHeaders);
app.use(sanitizeInput);
app.use(csrfProtection);

app.get('/',(req,res)=>{res.send('Api is Working')});
app.use('/api/auth', authRouter);
app.use('/api/product',productRouter);
app.use('/api/category',categoryRouter);
app.use('/api/supplier',supplierRouter);
app.use('/api/sale',salesRouter);
app.use('/api/inventory',inventoryRouter);
app.use('/api/expense',expenseRouter);
app.use('/api/analytical',analyticalRouter);
app.use('/api/customer',customerRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/chatbot', chatbotRouter);
app.use('/api/voice', voiceRouter);
app.use('/api/backup', backupRouter);
app.use('/api/billing', pricingRouter);
app.use('/api/super-admin', superAdminRouter);





app.all(/.*/,(req , res , next)=>{
    next(new ExpressError('page not found' ,404))
});


app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  let { message = 'something went wrong', statusCode = 500 } = err;
  res.status(statusCode).json({ 
    success: false,
    message 
  });
});


const PORT = process.env.PORT || 4000;
server.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
})

export { io };