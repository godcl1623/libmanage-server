import React from 'react';

const ManageStore = () => (
  <article id="managestore">
    <section className="heading">
      <h3>서비스 1</h3>
    </section>
    <form>
      <label for="connected_id">연동된 아이디: </label>
      <input type="text" name="connected_id" />
      <button>아이디 표시</button>
      <button>연동해제</button>
    </form>
    <button>닫기</button>
  </article>
);

export default ManageStore;