import React from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

const Test = () => {
  const [ count, setCount ] = React.useState('');
  const [ total, setTotal ] = React.useState('');
  const history = useHistory();
  React.useEffect(() => {
    // const foo = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    // let count = 0;
    // foo.forEach((ele, index) => {
    //   setTimeout(() => {
    //     axios.post('http://localhost:3003/test', {}, {withCredentials: true})
    //       .then(res => {
    //         console.log(res)
    //         count++;
    //         console.log(count)
    //         if (count === 10) console.log('bar');
    //       });
    //   }, index * 1000);
    // });
    axios.post('http://localhost:3003/test', {}, {withCredentials: true})
      .then(res => {
        console.log(res.data)
        if (res.data) {
          history.push('/main');
        }
      })
    }, []);
    React.useEffect(() => {
      axios.post('http://localhost:3003/test2', {}, {withCredentials: true})
          .then(res => {
            console.log(res.data)
            setTotal(Number(res.data.total))
          })
    }, []);
    React.useEffect(() => {
      if (total !== '' || total !== 0) {
        const foo = [...Array(total).keys()];
        foo.forEach((ele, index) => {
          setTimeout(() => {
            axios.post('http://localhost:3003/test2', {}, {withCredentials: true})
            .then(res => {
              console.log(res.data)
              setCount(res.data.count)
            })
          }, index * 1000);
        })
      }
    }, [total]);
  return (
    <>
      <h1>Test</h1>
      <p>{`${count}/${total}`}</p>
    </>
  );
}

export default Test;