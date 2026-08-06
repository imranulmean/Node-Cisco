import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
    CartesianGrid
  } from "recharts";
  
  export default function BandwidthChart({ data, title }) {
    return (
      <div>  
        <h3 className="text-sm text-center p-2">{title}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
  
            <XAxis
              dataKey="time"
              tickFormatter={(value) => {
                const date = new Date(value);
                const m = date.getMinutes();
                return m === 0 || m === 30
                  ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  : "";
              }}
            />
  
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="in" stroke="#00C49F" name="IN Mbps" dot={false} />
            <Line type="monotone" dataKey="out" stroke="#FF8042" name="OUT Mbps" dot={false} />
          </LineChart>
        </ResponsiveContainer>        
      </div>
    );
  }