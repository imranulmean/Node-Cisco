import { useEffect, useState } from "react";

export default function ScheduleCompo() {
    const BASE_API = import.meta.env.VITE_API_BASE_URL;
    const accessToken = localStorage.getItem('accessToken')
    const [schedule, setSchedule] = useState({
        isActive: true,
        workingDays: [0,1,2,3,4],
        startHour: 10,
        endHour: 18,
        offDays: []
    });
    const [holidayInput, setHolidayInput] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getSchedule();
    }, []);

    const getSchedule = async()=>{
        const res= await fetch(`${BASE_API}/schedule/getSchedule`,{
            method:"GET",
                headers: { 
                    "Content-Type": "application/json",
                    "authorization": accessToken
                 },
        });
        const data = await res.json();
        if(!data.success){
            alert(data.message)
            return;
        }        
        if(data.schedule) setSchedule(data.schedule);
    }

    const toggleDay = (day) => {
        setSchedule(prev => ({
            ...prev,
            workingDays: prev.workingDays.includes(day) ? prev.workingDays.filter(d => d !== day) : [...prev.workingDays, day]
        }));
    };

    const addHoliday = () => {
        if (!holidayInput) return;
        setSchedule(prev => ({ ...prev, offDays: [...prev.offDays, holidayInput] }));
        setHolidayInput('');
    };

    const removeHoliday = (date) => {
        setSchedule(prev => ({ ...prev, offDays: prev.offDays.filter(d => d !== date) }));
    };

    const saveSchedule = async () => {
        setLoading(true);
        try{
            const res = await fetch(`${BASE_API}/schedule/updateSchedule`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', "authorization": accessToken },
                body: JSON.stringify(schedule)
            });
            const data= await res.json();
            if(!data.success){
                alert(data.message)
                return;
            }            
            alert(data.message)
        }catch(err){
            alert(err)
        }finally{
            await getSchedule();
            setLoading(false)
        }
        
    };

    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

    return (
        <div className="max-w-xl mx-auto flex flex-col gap-3">

            {/* kill switch */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
                <div>
                    <p className="font-medium text-sm">monitoring schedule</p>
                    <p className="text-xs text-gray-500">control when the system runs</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`text-xs ${schedule.isActive ? 'text-green-600' : 'text-red-500'}`}>
                        {schedule.isActive ? 'active' : 'paused'}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={schedule.isActive} className="sr-only peer" 
                           onChange={e => setSchedule(p => ({...p, isActive: e.target.checked}))} />
                        <div className="w-9 h-5 bg-gray-300 rounded-full peer peer-checked:bg-green-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>                        
                    </label>
                </div>
            </div>

            {/* working days */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-3">working days</p>
                <div className="flex gap-2 flex-wrap">
                    {days.map((d, i) => (
                        <button key={i} onClick={() => toggleDay(i)}
                            className={`px-3 py-1.5 rounded-lg text-sm border ${
                                schedule.workingDays.includes(i) ? 
                                'bg-green-50 border-green-400 text-green-700' : 'border-gray-300 text-gray-600'
                            }`}>
                            {d}
                        </button>
                    ))}
                </div>
            </div>

            {/* working hours */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-3">working hours</p>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <p className="text-xs text-gray-400 mb-1">start</p>
                        <select value={schedule.startHour} className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                            onChange={e => setSchedule(p => ({...p, startHour: Number(e.target.value)}))}>
                            {[5,6,7,8,9,10].map(h => <option key={h} value={h}>{h}:00 AM</option>)}
                        </select>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 mb-1">end</p>
                        <select value={schedule.endHour} className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                            onChange={e => setSchedule(p => ({...p, endHour: Number(e.target.value)}))}>
                            {[16,17,18,19,20,21,22,23].map(h => <option key={h} value={h}>{h-12}:00 PM</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* holidays */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-3">holidays / off days</p>
                <div className="flex gap-2 mb-3">
                    <input type="date" value={holidayInput} onChange={e => setHolidayInput(e.target.value)}
                        className="flex-1 border border-gray-300 rounded-lg p-2 text-sm" />
                    <button onClick={addHoliday}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm">+ add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {schedule.offDays.map(d => (
                        <span key={d} className="flex items-center gap-1 bg-yellow-50 text-yellow-700 border border-yellow-300 rounded-lg px-2 py-1 text-xs">
                            {d}
                            <button onClick={() => removeHoliday(d)} className="text-yellow-600 font-bold">×</button>
                        </span>
                    ))}
                </div>
            </div>

            {/* save */}
            {
                !loading ? 
                    <div className="flex gap-2">
                        <button onClick={saveSchedule}
                            className="flex-1 bg-green-900 text-white rounded-lg py-2 text-sm">
                            save schedule
                        </button>
                    </div> : <p className="text-xs text-green-600 text-center">Processing Data ...</p>
            }
        </div>
    );
}