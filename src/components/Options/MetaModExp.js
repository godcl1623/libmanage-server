import React from 'react';

const MetaModExp = () => (
  <article
    id="metamodexp"
    style={{
      'display': 'flex',
      'width': '100%',
      'height': '100%'
    }}
  >
    <section
      className="wrapper-tab"
      style={{
        'display': 'flex',
        'flex-direction': 'column'
      }}
    >
      <button>일반</button>
      <button>미디어</button>
      <button>링크</button>
    </section>
    <form>
      <div
        className="wrapper-items-row"
        style={{
          'display': 'flex'
        }}
      >
        <div className="item">
          <label for="">게임명</label>
          <input type="" name="" />
        </div>
        <div className="item">
          <label for="">출시일</label>
          <input type="" name="" />
        </div>
      </div>
      <div
        className="wrapper-items-row"
        style={{
          'display': 'flex'
        }}
      >
        <div className="item">
          <label for="">플랫폼</label>
          <input type="" name="" />
        </div>
        <div className="item">
          <label for="">연령 등급</label>
          <input type="" name="" />
        </div>
      </div>
      <div
        className="wrapper-items-row"
        style={{
          'display': 'flex'
        }}
      >
        <div className="item">
          <label for="">장르</label>
          <input type="" name="" />
        </div>
        <div className="item">
          <label for="">지역</label>
          <input type="" name="" />
        </div>
      </div>
      <div
        className="wrapper-items-row"
        style={{
          'display': 'flex'
        }}
      >
        <div className="item">
          <label for="">개발</label>
          <input type="" name="" />
        </div>
        <div className="item">
          <label for="">배급</label>
          <input type="" name="" />
        </div>
      </div>
      <div
        className="wrapper-items-row"
        style={{
          'display': 'flex'
        }}
      >
        <div className="item">
          <label for="">카테고리</label>
          <input type="" name="" />
        </div>
        <div className="item">
          <label for="">버전</label>
          <input type="" name="" />
        </div>
      </div>
      <div
        className="wrapper-items-row"
        style={{
          'display': 'flex'
        }}
      >
        <div className="item">
          <label for="">크리틱 점수</label>
          <input type="" name="" />
        </div>
        <div className="item">
          <label for="">유저 점수</label>
          <input type="" name="" />
        </div>
      </div>
      <div className="item-big">
        <label for="">설명</label>
        <placeholder name="" />
      </div>
      <div
          className="wrapper-btn"
          style={{
            'display': 'flex',
            'justify-content': 'space-between'
          }}
        >
          <button>축소</button>
          <div className="wrapper-btn-submit">
            <button type="submit">확인</button>
            <button type="submit">닫기</button>
          </div>
        </div>
    </form>
  </article>
);

export default MetaModExp;