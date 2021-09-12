export const verifyId = string => {
  const form = /^[A-Za-z0-9]{6,12}$/;
  return form.test(string);
};

export const verifyPwd = string => {
  // const form = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^*]).{8,16}$/;
  const form = /^[A-Za-z0-9!@#$%^&*]{8,16}$/;
  return form.test(string);
};

export const verifyNick = string => {
  const form = /^[가-힣a-zA-Z0-9]{2,10}$/;
  return form.test(string);
};

export const verifyEmail = string => {
  const form = /^[A-Za-z0-9_\.\-]+@[A-Za-z0-9\-]+\.[A-Za-z0-9\-]+/;
  return form.test(string);
}
