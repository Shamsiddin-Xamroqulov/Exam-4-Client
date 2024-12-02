const setItem = (key, val) => window.localStorage.setItem(key, (typeof val == "object")? JSON.stringify(val): val);
const getItem = key => window.localStorage.getItem(key);
const removeItem = key => window.localStorage.removeItem(key);
const BASE_URL = "http://localhost:5000/";
const email_regex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
const phone_num_regex = /^(9[012345789]|6[125679]|7[01234569])[0-9]{7}$/;