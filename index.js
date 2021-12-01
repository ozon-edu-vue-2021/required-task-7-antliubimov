"use strict";

const getUsers = async () => {
  try {
    let res = await fetch('./data.json');
    return res.json();
  } catch (e) {
    console.log(e);
  }

}
let users = await getUsers();
console.log(users);
