import React, { useEffect, useRef } from "react";

export const ZoomSlider = ({ min = 1, max = 5, step = 0.1, value = 1, onChange }) => {

    const inputRef = useRef(null);

    // Set the initial value of the input
    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.value = value;
      }
    }, []);

    return (
      <div className="zoom-slider-container">
        <label htmlFor="zoom-slider">Zoom: </label>
        <input
          ref={inputRef}
          type="range"
          id="zoom-slider"
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(parseFloat(e.target.value))}
        />
      </div>
    );
  };
