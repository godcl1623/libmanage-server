import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { _TESTCREATOR as testUp } from '../actions';

const Progress = () => {
  const testState = useSelector(state => state._TEST);
  const [ count, setCount ] = useState('');
  const [ total, setTotal ] = useState('');
  const [ status, setStatus ] = useState('1');
  const history = useHistory();
  const dispatch = useDispatch();
  const statusText = status => {
    switch (status) {
      case ('1'):
        return '보유 중인 라이브러리를 IGDB 서비스에 검색 중입니다'
      case ('2'):
        return '누락된 항목을 IGDB 서비스에 재검색 중입니다'
      case ('3'):
        return 'IGDB 서비스로부터 메타데이터를 수신하는 중입니다'
      case ('4'):
        return '수신한 메타데이터를 가공하는 중입니다'
      case ('5'):
        return '메타데이터의 저장이 완료됐습니다'
      default:
        return '오류가 발생했습니다'
    }
  }
  useEffect(() => {
    axios.post('http://localhost:3002/check_login', { message: ''}, {withCredentials: true})
      .then(res => {
        const reqUserInfo = res.data;
        return (new Promise((resolve, reject) => resolve(reqUserInfo)));
      })
      .then(res => {
        axios.post('http://localhost:3003/api/search', { reqUserInfo: res }, {withCredentials: true})
          .then(res => {
            if (res.data.result) {
              dispatch(testUp(res.data.newInfo));
              setTimeout(() => history.push('/main'), 3000);
            }
          })
      })
  }, [])
  // useEffect(() => {
  //   axios.post('http://localhost:3003/api/search', {}, {withCredentials: true})
  //     .then(res => {
  //       if (res.data) {
  //         setTimeout(() => history.push('/main'), 3000);
  //       }
  //     })
  //   }, []);
  useEffect(() => {
    const requestStatus = setInterval(() => {
      axios.post('http://localhost:3003/stat/track', {}, {withCredentials: true})
        .then(res => {
          if (res.data.status === status) {
            setCount(res.data.count);
            setTotal(res.data.total);
          } else {
            setCount(res.data.count);
            setTotal(res.data.total);
            setStatus(res.data.status);
          }
        })
    }, 100);
    return () => clearInterval(requestStatus);
  }, [total]);
  return (
    <>
      <h1>Progress</h1>
      <p>{`${statusText(status)} (${count}/${total})`}</p>
    </>
  );
}

export default Progress;