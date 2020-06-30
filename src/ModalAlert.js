import React from "react";
import { Modal, Paper } from "@material-ui/core";

export default class ModalAlert extends React.PureComponent {
  render() {
    const { closeModal, open, text } = this.props;
    return (
      <Modal id="modal-container" open={open} onClose={closeModal} disableAutoFocus={true}>
        <div>
          <Paper id="background-alert">{text}</Paper>
        </div>
      </Modal>
    );
  }
}
