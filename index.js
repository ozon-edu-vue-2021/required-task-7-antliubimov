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
};

const sortMap = (myMap, list) => {
  return new Map([...myMap.entries()].sort((a, b) => {
    if (a[1] !== b[1]) {
      return b[1] - a[1];
    } else {
      return list.get(a) < list.get(b);
    }
  }))
};

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

const getHuman = (list, id) => {
  if (list.has(id)) {
    return list.get(id)['name'];
  }
};

const getFriends = (list, id) => {
  if (list.has(id)) {
    return list.get(id)['friends'];
  }
};

const getNoFriends = (people, friends, selfId) => {
  const friendsWithSelf = [...friends];
  friendsWithSelf.push(selfId);
  return people.filter(human => !friendsWithSelf.includes(human));
};

const getPopularCount = (list) => {
  let popular = new Map();
  for (let item of list.values()) {
    let friends = item['friends'];
    friends.forEach(friend => {
      if (popular.has(friend)) {
        popular.set(friend, popular.get(friend) + 1);
      } else {
        popular.set(friend, 1);
      }
    })
  }
  return popular;
};
const popular = [...sortMap(getPopularCount(peopleList), peopleList).keys()];

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
  } else {
    return;
  }

  const friends = getFriends(peopleList, id);
  let friendsList = createDetailsList(peopleList, friends, getHuman);
  insertAfter(friendsList, friendsListTitle);

  const noFriends = getNoFriends(peopleListKeys, friends, id);
  const noFriendsList = createDetailsList(peopleList, noFriends, getHuman);
  insertAfter(noFriendsList, noFriendsListTitle);

  const popularList = createDetailsList(peopleList, popular, getHuman);
  insertAfter(popularList, popularListTitle);

  contactDetailsView.style.zIndex = '1';
  isContactsDetailsVisible = true;
  //window.addEventListener('click', closeContactDetails);
}

const closeContactDetails = (e) => {
  if (e.target !== contactDetailsView && isContactsDetailsVisible) {
    contactDetailsView.style.zIndex = '0';
    isContactsDetailsVisible = false;
    window.removeEventListener('click', closeContactDetails);
  }
};

contactsList.addEventListener('click', showContactDetails);
