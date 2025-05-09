import {  faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const UserIcon = (props: any) => (
  <FontAwesomeIcon 
    icon={faUser} 
    className="!text-[#4c95bb] text-sm transition-colors duration-200"
    {...props} 
  />
);

export default UserIcon;
