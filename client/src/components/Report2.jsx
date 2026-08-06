import React from "react";
import moment from 'moment';

const Report2 = ({ ispName, data, dateStrings, fromUrl }) => {

  
  // const formatMinutes = (mins) => {
  //   const duration = moment.duration(mins * 60 *1000);
  //   const day= duration.asDays();
  //   const hours = Math.floor(duration.asHours());
  //   const minutes = duration.minutes();
  //   return `${day} day ${hours} hr : ${minutes.toString().padStart(2, '0')} min`;
  // };

  const formatMinutes = (mins) => {
      const duration = moment.duration(mins, 'minutes'); // ← cleaner
      const days    = Math.floor(duration.asDays());
      const hours   = duration.hours();   // ← remaining hours after days
      const minutes = duration.minutes(); // ← remaining minutes after hours

      if (days > 0) {
          return `${days}d ${hours}hr : ${minutes.toString().padStart(2, '0')}min`;
      }
      return `${hours}hr : ${minutes.toString().padStart(2, '0')}min`;
  };  
  
  // Calculate Month Total Down Time
  const monthTotalMinutes = data.reduce((total, day) => {
    return total + day.totalDownTime
  }, 0);
        

  return (
      <div className="p-4 flex flex-col justify-center items-center">
        <style>
          {`
            @media print {
                @page {
                    margin: 1cm;
                    @bottom-right {
                        content: "Page " counter(page) " of " counter(pages);
                        font-size: 10px;
                        color: #666;
                    }
                }
                * {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }                    
            }
         `}
        </style>        
        <div className="mb-6 w-full flex flex-col items-center">
          <table className="w-full text-sm text-left rtl:text-right text-body">
            <thead className="text-sm text-body bg-neutral-secondary-medium">
              <tr>
                <td colSpan={fromUrl !== 'automaticReport' ? 6 : 5}>
                  <div className="flex items-center justify-between border border-gray-400 p-2">
                        <img src="https://www.aibl.com.bd/wp-content/themes/aiblTheme/images/aibplc-logo2.png" alt="AIBL Logo" 
                            style={{ width: '100px', height: 'auto' }}
                        />
                        <p className="flex flex-col items-center mt-2">
                          <span className="font-semibold text-gray-900">{ispName}</span> 
                          <span className="text-gray-900 text-xs">{dateStrings.fromStr} - {dateStrings.toStr}</span>
                        </p>
                        <p className="flex flex-col items-center mt-2">
                          <span className="text-gray-500 text-xs">Print Date</span> 
                          <span className="text-gray-900 text-xs">{moment(new Date).format("DD-MM-YYYY")}</span>
                        </p>                        
                  </div>
                </td>
              </tr>
              <tr className="border border-gray-400">
                <th className="p-2 font-medium text-center bg-gray-900 text-gray-200 border border-r border-gray-400">Branch</th>
                <th className="p-2 font-medium text-center bg-gray-900 text-gray-200 border border-r border-gray-400">ID</th>
                <th className="p-2 font-medium text-center bg-gray-900 text-gray-200 border border-r border-gray-400">Down</th>
                <th className="p-2 font-medium text-center bg-gray-900 text-gray-200 border border-r border-gray-400">Up</th>
                {
                  fromUrl !== 'automaticReport' && <th className="p-2 font-medium text-center bg-gray-900 text-gray-200 border border-r border-gray-400">Reason</th>
                }                    
                <th className="p-2 font-medium text-center bg-gray-900 text-gray-200 border border-r border-gray-400">Duration</th>
              </tr>
            </thead>
            <tbody>
              {data.map(log => (
                <tr key={log._id} className="bg-neutral-primary-soft border-b border-default hover:bg-neutral-secondary-medium">
                  <td className="text-center border border-gray-400">{log.branchName}</td>
                  <td className="text-center border border-gray-400">{log.id}</td>
                  <td className="text-center border border-gray-400">
                      {moment(log.downAt).format("MMMM Do YYYY, h:mm a")}
                  </td>
                  <td className="text-center border border-gray-400">
                      {moment(log.upAt).format("MMMM Do YYYY, h:mm a")}
                  </td>
                  {
                    fromUrl !== 'automaticReport' &&
                    <td className="text-center border border-gray-400">
                      {log.reason}
                    </td>                         
                  }
                    
                  <td className="text-center border border-gray-400">
                      { formatMinutes(log.totalDownTime)}
                  </td>                       
                </tr>
              ))}
            </tbody>
          </table>                  
        </div>
        <span className="text-gray-900 self-center text-xl text-heading font-bold whitespace-nowrap mt-6">
            Total Down Time: {formatMinutes(monthTotalMinutes)}
        </span>
      </div>
    );
};

export default Report2;