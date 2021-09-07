import React from 'react';

const InputTemplate = ({ inputType, labelText, inputFor, style, handler }) => (
  <>
    <label htmlFor={inputFor}>{ labelText }</label>
    <input type={inputType} name={inputFor} onChange={handler} />
  </>
);

export default InputTemplate;