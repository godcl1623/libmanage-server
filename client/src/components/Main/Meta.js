import React from 'react';
import { useSelector } from 'react-redux';

const Meta = () => {
  const selectedItem = useSelector(state => state.selectedItem);
  const selectedItemData = useSelector(state => state.selectedItemData);
  return (
    <article
      id="meta"
      style={{
        'flex': '2'
      }}
    >
      <article className="meta-wrapper-top">
        <h3>{selectedItemData.name}</h3>
        <article className="meta-wrapper-tab">
          <nav id="meta-tab">
            <button>정보</button>
            <button>사용자 입력 정보</button>
          </nav>
          <article className="meta-wrapper-contents">
            <p>{selectedItemData.summary}</p>
          </article>
        </article>
      </article>
    </article>
  );
};

export default Meta;