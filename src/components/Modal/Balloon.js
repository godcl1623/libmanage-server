import React from 'react';

const Balloon = ({contents, display, style, hand}) => (
  <article
    id="balloon"
    style={display}
  >
    <section
      className="balloon-body"
      style={style}
    >
      {contents}
    </section>
    <div
      className="balloon-hand"
      style={hand}
    ></div>
  </article>
);

export default Balloon;