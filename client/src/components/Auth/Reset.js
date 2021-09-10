import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import ChangePwd from './module/ChangePwd';
import { tokenStateCreator as setTokenState } from '../../actions';

const now = () => {
  const date = new Date();
  const year = date.getFullYear();
  const rawMonth = date.getMonth();
  const month = rawMonth + 1 < 10 ? `0${rawMonth + 1}` : rawMonth + 1;
  const rawDay = date.getDate();
  const day = rawDay < 10 ? `0${rawDay}` : rawDay;
  const rawHour = date.getHours();
  const hour = rawHour < 10 ? `0${rawHour}` : rawHour;
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  return `${year}-${month}-${day} ${hour}:${minutes}:${seconds}`;
};

const Reset = () => {
  // const [tokenState, setTokenState] = useState('');
  const [requestedToken, setRequestToken] = useState({});
  const tokenState = useSelector(state => state.tokenState);
  const dispatch = useDispatch();
  const history = useHistory();
  const tokenTail = history.location.pathname.slice(-7,);
  const requestedTime = now();

  useEffect(() => {
    axios.post('http://localhost:3002/member/reset', { tokenTail, requestedTime }, { withCredentials: true })
      .then(res => {
        dispatch(setTokenState(res.data.tokenState));
        setRequestToken(res.data.token);
      })
      .catch(err => alert(err));
  }, []);

  switch(tokenState) {
    case true:
      return (<ChangePwd token={requestedToken} reqTime={now} />);
    case false:
      return(<h1>요청이 만료되었습니다.</h1>);
    case 'abnormal':
      return(<h1>잘못된 접근입니다.</h1>)
    case 'no_token':
      return(<h1>요청이 존재하지 않습니다.</h1>)
    default:
      return (<></>);
  }
};

export default Reset;