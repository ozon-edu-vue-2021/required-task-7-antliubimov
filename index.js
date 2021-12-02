"use strict";

const contactsList = document.querySelector('.contacts-list');
const contactDetailsView = document.querySelector('.details-view');
const peopleLists = document.querySelectorAll('.people-title');
const friendsListTitle = peopleLists[0];
const noFriendsListTitle = peopleLists[1];
const popularListTitle = peopleLists[2];
const MAX_VISIBLE_PEOPLE = 3;
let isContactsDetailsVisible = false;

const arrayToMap = function (arr) {
  let hashMap = new Map();
  arr.forEach(elem => hashMap.set(elem.id, elem));
  return hashMap;
}

function insertAfter(newNode, existingNode) {
  existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
}

const getPeople = async () => {
  try {
    let res = await fetch('./data.json');
    return res.json();
  } catch (e) {
    console.log(e);
  }
}

const people = await getPeople();
const peopleList = arrayToMap(people);

const peopleListKeys = [...peopleList.keys()];

const createPeopleList = (users, list) => {
  users.forEach(user => {
    const listItem = document.createElement('li');
    const strongItem = document.createElement('strong');
    listItem.id = user.id;
    strongItem.textContent = user.name;
    listItem.appendChild(strongItem);
    list.appendChild(listItem);
  })
};

createPeopleList(peopleList, contactsList);

const getFriends = (list, id) => {
  if (list.has(id)) {
    return list.get(id)['friends'];
  }
};

const getHuman = (list, id) => {
  if (list.has(id)) {
    return list.get(id)['name'];
  }
}

const getNoFriends = (people, friends) => {
  return people.filter(human => !friends.includes(human));
}

const createListItem = (list, id, fn) => {
  const listItem = document.createElement('li');
  const listItemSpan = document.createElement('span');
  const listItemIcon = document.createElement('i');
  listItemIcon.classList.add('fa', 'fa-male');
  listItem.appendChild(listItemIcon);

  listItemSpan.textContent = fn(list, id);
  listItem.appendChild(listItemSpan);

  return listItem;
};

const createDetailsList = (list, additionalList, fn) => {
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < MAX_VISIBLE_PEOPLE; i++) {
    fragment.appendChild(createListItem(list, additionalList[i], fn));
  }
  return fragment;
};

const showContactDetails = (e) => {
  let id;

  if (e.target.tagName.toLowerCase() === 'li') {
    id = +(e.target.id);
  } else if (e.target.parentElement.tagName.toLowerCase() === 'li') {
    id = +(e.target.parentElement.id);
  }

  const friends = getFriends(peopleList, id);
  let friendsList = createDetailsList(peopleList, friends, getHuman);
  insertAfter(friendsList, friendsListTitle);

  const noFriends = getNoFriends(peopleListKeys, friends);
  const noFriendsList = createDetailsList(peopleList, noFriends, getHuman);
  insertAfter(noFriendsList, noFriendsListTitle);


  contactDetailsView.style.zIndex = '1';
  isContactsDetailsVisible = true;
}



contactsList.addEventListener('click', showContactDetails);
