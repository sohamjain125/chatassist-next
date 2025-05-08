import { faBars } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const MenuIcon = (props : any) => (
    <FontAwesomeIcon icon={faBars} style={{ color: "#4c95bb",fontSize: "14px"  }} {...props} />
  );

export default MenuIcon;