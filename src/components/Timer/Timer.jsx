import React, { useState, useEffect } from 'react';
import './Timer.css';  // Assuming your CSS is named Timer.css

// import image
import historyIcon from '../../assets/icons/history-icons8/icons8-history-96.png';
import liveIcon from '../../assets/icons/live/live.webp';

// element with an up and down arrow on bottom/top that will cycle through options
const Picker = ({ value, onChange }) => {
    const handleClick = (direction) => {
        onChange(direction);
    };

    return (
        <div className="picker">
            <div className="picker__controls">
                <button onClick={() => handleClick(1)}> ▲ </button>
                <span>{value}</span>
                <button onClick={() => handleClick(-1)}> ▼ </button>
            </div>
        </div>
    );
};

// Day Date Month
// HH:MM:SS.
// All are pickers, when one changes check all of the rest and update accordingly
const DateTimePicker = () => {
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentDate(prevDate => new Date(prevDate.getTime() + 1000));
        }, 1000);
    
        return () => clearInterval(intervalId);
    }, []);

    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

    const handlePickerChange = (field, direction) => {
        const newDate = new Date(currentDate);
        
        if (field === "day" || field === "date") {
            newDate.setDate(newDate.getDate() + direction);
          } else if (field === "month") {
            newDate.setMonth(newDate.getMonth() + direction);
          } else if (field === "year") {
            newDate.setFullYear(newDate.getFullYear() + direction);
          } else if (field === "minute") {
            newDate.setMinutes(newDate.getMinutes() + direction);
          } else if (field === "hour") {
            newDate.setHours(newDate.getHours() + direction);
          } else if (field === "second") {
            newDate.setSeconds(newDate.getSeconds() + direction);
          }
    
        setCurrentDate(newDate);
    };

    const formatDate = (date) => {
        return {
            day: days[date.getDay()],
            date: date.getDate(),
            month: months[date.getMonth()],
            hours: date.getHours().toString().padStart(2, '0'),
            minutes: date.getMinutes().toString().padStart(2, '0'),
            seconds: date.getSeconds().toString().padStart(2, '0'),
            year: date.getFullYear(),
        };
    };

    const handleSliderChange = (e) => {
        const totalSeconds = parseInt(e.target.value, 10);
        const newDate = new Date(currentDate);
        newDate.setHours(Math.floor(totalSeconds / 3600));
        newDate.setMinutes(Math.floor((totalSeconds % 3600) / 60));
        newDate.setSeconds(totalSeconds % 60);
        setCurrentDate(newDate);
      };

    const formattedDate = formatDate(currentDate);
    const currentSeconds = currentDate.getHours() * 3600 + currentDate.getMinutes() * 60 + currentDate.getSeconds();

    return (
        <div className="dateTimePicker">
            <div className="dateTimePicker__date">
                <Picker value={formattedDate.day} onChange={(direction) => handlePickerChange("day", direction)} />
                <Picker value={formattedDate.date} onChange={(direction) => handlePickerChange("date", direction)} />
                <Picker value={formattedDate.month} onChange={(direction) => handlePickerChange("month", direction)} />
                <Picker value={formattedDate.year} onChange={(direction) => handlePickerChange("year", direction)} />
            </div>
            <div className="dateTimePicker__time">
                <Picker value={formattedDate.hours} onChange={(direction) => handlePickerChange("hour", direction)} />
                <Picker value={formattedDate.minutes} onChange={(direction) => handlePickerChange("minute", direction)} />
                <Picker value={formattedDate.seconds} onChange={(direction) => handlePickerChange("second", direction)} />
            </div>

            <div className="dateTimePicker__slider">
            <input
                type="range"
                min={0}
                max={86399} // 24*60*60 - 1
                value={currentSeconds}
                onChange={handleSliderChange}
                className="slider"
            />
            </div>

        </div>
    );
};
    


const Timer = () => {
  const [isLive, setIsLive] = useState(true);
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    if (isLive) {
      const interval = setInterval(() => {
        setDateTime(new Date());
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [isLive]);

  return (
    <div className="timer-container">

        <div className={`date-time-container ${isLive ? '' : 'active'}`}>
            <DateTimePicker dateTime={dateTime} onChange={setDateTime} />
      </div>

      <img 
        src={historyIcon}
        alt="history" 
        height={100}
        className={`icon icon--history ${isLive ? '' : 'active'}`}
        onClick={() => setIsLive(false)}
      />

      <div 
        className={`icon icon--live ${isLive ? 'icon--live--active' : 'icon--live--inactive'}`} 
        onClick={() => setIsLive(true)}
      >
        <div className="live-circle">
            <img src={liveIcon} alt="live" className="live-icon" height={100}/>
        </div>
      </div>
    </div>
  );
};

export default Timer;
