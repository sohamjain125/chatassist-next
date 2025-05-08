import {  faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const UserIcon = (props: any) => (
  <FontAwesomeIcon icon={faUser} style={{ color: "#4c95bb", fontSize: "14px" }} {...props} />
);

export default UserIcon;
