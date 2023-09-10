import { FC } from "react";
import { getTimeZone } from "../../services/util/utils.service";
import "./TimeZoneDisplay.scss";

export const TimeZoneDisplay: FC = () => {
  const timeZone = getTimeZone();
  return (
    <div className="time-zone">
      <h3 className="time-zone-title">Time Zone</h3>
      <div className="time-zone-container">
        <p className="time-zone-value">{timeZone}</p>
      </div>
    </div>
  );
};
