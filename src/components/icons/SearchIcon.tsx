import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const SearchIcon = (props: any) => (
  <FontAwesomeIcon icon={faMagnifyingGlass} style={{ color: "#4c95bb", fontSize: "14px" }} {...props} />
);

export default SearchIcon;
