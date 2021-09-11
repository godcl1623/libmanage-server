import React from 'react';

const InputTemplate = ({ inputType, labelText, inputFor, style, handler, placeholder }) => (
  <>
    <label htmlFor={inputFor}>{ labelText }</label>
    <input type={inputType} name={inputFor} onChange={handler} placeholder={placeholder} />
  </>
);

export default InputTemplate;