import { faClockRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const HistoryIcon = (props: any) => (
  <FontAwesomeIcon icon={faClockRotateLeft} style={{ color: "#4c95bb", fontSize: "14px" }} {...props} />
);

export default HistoryIcon;
