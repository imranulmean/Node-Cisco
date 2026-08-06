import mongoose from 'mongoose';

const downTimeSchema = new mongoose.Schema({
    id: { type:Number, required:true },
    branchName:{ type: String, required: true },
    ispName:{ type: String, required: true },
    downAt:{ type: Date, required: true },
    upAt:{ type: Date, required: true },
    reason:{ type: String, required: true },
    totalDownTime:{ type: Number }, // minutes, calculated at import time    
    addedBy: { type: String },

}, { timestamps: true });

const DownTimeLog = mongoose.model('DownTimeLog', downTimeSchema);
export default DownTimeLog;