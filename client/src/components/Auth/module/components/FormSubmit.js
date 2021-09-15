import React from 'react';
import { useHistory } from 'react-router-dom';

const FormSubmit = () => {
  const history = useHistory();

  return (
    <>
      <button
      name="cancel"
      onClick={e => {
        e.preventDefault();
        if (window.confirm(`정말 취소하시겠습니까?\n작성한 데이터가 전부 삭제됩니다.`)) {
          history.push('/');
        }
      }}>취소</button>
    <button type="submit" name="confirm">확인</button>
    </>
  );
};

export default FormSubmit;