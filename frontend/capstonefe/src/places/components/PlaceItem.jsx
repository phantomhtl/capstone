import React, { useState, useContext } from "react";
import Card from "../../common/components/UIElements/Card";
import Button from "../../common/components/FormElements/Button";
import Modal from "../../common/components/UIElements/Modal";
import Map from "../../common/components/UIElements/Map";
import ErrorModal from "../../common/components/UIElements/ErrorModal";
import LoadingSpinner from "../../common/components/UIElements/LoadingSpinner";
import { AuthContext } from "../../common/context/auth-context";
import { useHttpClient } from "../../common/hooks/http-hook";
import "./PlaceItem.css";

// Handlers for modal state management
const useModalHandlers = () => {
  const [showMap, setShowMap] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const openMapHandler = () => setShowMap(true);
  const closeMapHandler = () => setShowMap(false);
  const showDeleteWarningHandler = () => setShowConfirmModal(true);
  const cancelDeleteHandler = () => setShowConfirmModal(false);

  return {
    showMap,
    showConfirmModal,
    openMapHandler,
    closeMapHandler,
    showDeleteWarningHandler,
    cancelDeleteHandler,
    setShowConfirmModal,
  };
};

// Main component
const PlaceItem = (props) => {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const auth = useContext(AuthContext);

  const {
    showMap,
    showConfirmModal,
    openMapHandler,
    closeMapHandler,
    showDeleteWarningHandler,
    cancelDeleteHandler,
    setShowConfirmModal,
  } = useModalHandlers();

  const confirmDeleteHandler = async () => {
    setShowConfirmModal(false);
    try {
      await sendRequest(
        `http://localhost:5000/api/places/${props.id}`,
        "DELETE",
        null,
        { Authorization: "Bearer " + auth.token }
      );
      props.onDelete(props.id);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      <Modal
        show={showMap}
        onCancel={closeMapHandler}
        header={props.address}
        contentClass="place-item__modal-content"
        footerClass="place-item__modal-actions"
        footer={<Button onClick={closeMapHandler}>Close</Button>}
      >
        <div className="map-container">
          <Map center={props.coordinates} zoom={16} />
        </div>
      </Modal>
      <Modal
        show={showConfirmModal}
        onCancel={cancelDeleteHandler}
        header="Are you sure?"
        footerClass="place-item__modal-actions"
        footer={
          <>
            <Button inverse onClick={cancelDeleteHandler}>
              Cancel
            </Button>
            <Button danger onClick={confirmDeleteHandler}>
              Delete
            </Button>
          </>
        }
      >
        <p>Are you sure you want to delete this place?</p>
      </Modal>
      <li className="place-item">
        <Card className="place-item__content">
          {isLoading && <LoadingSpinner asOverlay />}
          <div className="place-item__image">
            <img
              src={`http://localhost:5000/${props.image}`}
              alt={props.title}
            />
          </div>
          <div className="place-item__info">
            <h2>{props.title}</h2>
            <h3>{props.address}</h3>
            <p>{props.description}</p>
          </div>
          <div className="place-item__actions">
            <Button inverse onClick={openMapHandler}>
              View on Map
            </Button>
            {auth.userId === props.creatorId && (
              <>
                <Button to={`/places/${props.id}`}>Edit</Button>
                <Button danger onClick={showDeleteWarningHandler}>
                  Delete
                </Button>
              </>
            )}
          </div>
        </Card>
      </li>
    </>
  );
};

export default PlaceItem;
