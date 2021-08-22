import React from 'react';

const Register = () => (
  <article
    id="register"
    style={{
      'display': 'flex',
      'flex-direction': 'column',
      'justify-content': 'center',
      'align-content': 'center'
    }}
  >
    <form
      action=""
      style={{
        'display': 'flex',
        'flex-direction': 'column',
        'justify-content': 'center',
        'align-content': 'center'
      }}
    >
      <label for="ID">아이디: </label>
      <input type="text" name="ID" />
      <label for="PWD">비밀번호: </label>
      <input type="password" name="PWD" />
      <label for="PWD-check">비밀번호 확인: </label>
      <input type="password" name="PWD-check" />
      <label for="nickname">별명: </label>
      <input type="text" name="nickname" />
      <label for="EMAIL">이메일: </label>
      <input type="text" name="EMAIL" />
      <select name="EMAIL">
        <option value="">선택</option>
        <option value="@google.com">@google.com</option>
        <option value="@naver.com">@naver.com</option>
        <option value="@hanmail.net">@hanmail.net</option>
        <option value="">직접 입력</option>
      </select>
      <label for="sub-PWD">2차 비밀번호: </label>
      <input type="password" name="sub-PWD" />
      <label for="sub-PWD-check">2차 비밀번호 확인: </label>
      <input type="password" name="sub-PWD-check" />
      <p>※ 2차 비밀번호는 데이터 암호화를 위해 쓰입니다.</p>
      <button name="cancel">취소</button>
      <button type="submit" name="confirm">확인</button>
    </form>
  </article>
);

export default Register;