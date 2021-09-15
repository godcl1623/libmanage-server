import React from 'react';
import ReactDOM from 'react-dom';
import { useSelector } from 'react-redux';

const Modal = () => {
  const modalState = useSelector(state => state.modalState);
  const display = !modalState ? 'none' : 'block';
  return ReactDOM.createPortal(
    <div
      className="modal-bg"
      style={{
        'display': display
      }}
    >
      <div className="modal-body">
        <h1>modal</h1>
      </div>
    </div>,
    document.querySelector('#modal')
  );
}
export default Modal;