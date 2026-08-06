import mongoose from 'mongoose';

const mailSentSchema = new mongoose.Schema({
    branchId: { type:Number },
    router: { type:String },
    email:{ type: String },
    host:{ type: String },
    ispName:{ type: String },
    lastDown: { type: String },
    lastDownTime: { type: String },
    sentBy:{type: String, default:""}

}, { timestamps: true });

const MailLog = mongoose.model('MailLog', mailSentSchema);
export default MailLog;