import { Link } from "react-router-dom";
import Avatar from "../../common/components/UIElements/Avatar";
import Card from "../../common/components/UIElements/Card";
import "./UserItem.css";

const UserItem = (props) => {
  return (
    <li className="user-item">
      <Card className="user-item-content">
        <Link to={`/${props.id}/places`}>
          <div className="user-item-image">
            <Avatar
              image={`http://localhost:5000/${props.image}`}
              alt={props.name}
            />
          </div>
          <div className="user-item-info">
            <h2>{props.name}</h2>
            <h3>
              {props.placeCount === 0
                ? "0 Destination"
                : `${props.placeCount} ${
                    props.placeCount === 1 ? "Destination" : "Destinations"
                  }`}
            </h3>
          </div>
        </Link>
      </Card>
    </li>
  );
};

export default UserItem;
