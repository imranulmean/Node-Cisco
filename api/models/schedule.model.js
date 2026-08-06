import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
    isActive:    { type: Boolean, default: true },
    workingDays: { type: [Number], default: [0,1,2,3,4] },
    startHour:   { type: Number, default: 10 },
    endHour:     { type: Number, default: 18 },
    offDays:     { type: [String], default: [] }
}, { timestamps: true });

export const Schedule = mongoose.model('Schedule', scheduleSchema);