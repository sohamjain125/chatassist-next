import {  faMap } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const DashboardIcon = (props: any) => (
  <FontAwesomeIcon
    icon={faMap}
    style={{ color: "#4c95bb", fontSize: "18px" }}
    {...props}
  />
);

export default DashboardIcon;