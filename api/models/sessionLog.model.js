import mongoose from 'mongoose';

const SessionSchema = new mongoose.Schema({
    branchId:Number,
    branch:String,
    host: String,
    user: String,
    startTime: Date,
    endTime: Date,
    commands: [
      {
        command: String,
        time: Date
      }
    ]
  });
  
  const SessionLog = mongoose.model("SessionLog", SessionSchema);
  export default SessionLog;