import React from "react";
import { Modal, CircularProgress } from "@material-ui/core";

export default class ModalLoading extends React.PureComponent {
  render() {
    return this.props.loading ? (
        <Modal id="modal-container" open>
          {/* <CircularProgress
            size={"10vh"}
            style={{ color: "rgb(15, 111, 198)" }}
          /> */}
          <div id="modal-container">
            <CircularProgress
              size={"20vh"}
              style={{ color: "rgb(255, 255, 255)" }}
            />
          </div>
        </Modal>
    ) : null;
  }
}
