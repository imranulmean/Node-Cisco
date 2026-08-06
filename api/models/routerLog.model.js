import mongoose from 'mongoose';

const routerLogSchema = new mongoose.Schema({
    logDate:    Date, 
    id:   Number,
    branchName:     String,
    branchType: String,
    host:       String,
    ispName:        String,
    downAt:   Date,
    upAt:     Date,
    totalDownTime: Number
}, { timestamps: true });

const RouterLog = mongoose.model('RouterLog', routerLogSchema);
export default RouterLog;