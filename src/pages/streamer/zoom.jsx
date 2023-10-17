export const ZoomSlider = ({ min = 1, max = 5, step = 0.1, onChange }) => {
    return (
      <div className="zoom-slider-container">
        <label htmlFor="zoom-slider">Zoom: </label>
        <input
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


// TODO Alternative:
// Zoom video & IVS separately
// make local debug (not use AWS) just get a test channel instead.