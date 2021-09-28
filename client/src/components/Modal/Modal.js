import React from 'react';
import ReactDOM from 'react-dom';
import { useSelector, useDispatch } from 'react-redux';
import { modalStateCreator } from '../../actions';

const Modal = ({ style, contents }) => {
  const modalState = useSelector(state => state.modalState);
  const dispatch = useDispatch();
  const display = !modalState ? 'none' : 'block';
  return ReactDOM.createPortal(
    <div
      className="modal-bg"
      style={{
        'display': display,
        'position': 'absolute',
        'width': '100%',
        'height': '100%',
        'background': 'rgba(0, 0, 0, 0.3)',
        'top': '0',
        'left': '0',
        'zIndex': '2'
      }}
      onClick={e => {
        // e.preventDefault();
        if (e.target.className === 'modal-bg') {
          dispatch(modalStateCreator(false));
        }
      }}
    >
      <div
        className="modal-body"
        style={{
          ...style
        }}
      >
        { contents() }
      </div>
    </div>,
    document.querySelector('#modal')
  );
}
export default Modal;