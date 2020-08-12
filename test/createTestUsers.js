const fs = require("fs");

const names = [
  "Ned Stark",
  "Robert Baratheon",
  "Jaime Lannister",
  "Catelyn Stark",
  "Cersei Lannister",
  "Daenerys Targaryen",
  "Jorah Mormont",
  "Viserys Targaryen",
  "Jon Snow",
  "Robb Stark",
  "Sansa Stark",
  "Arya Stark",
  "Theon Greyjoy",
  "Bran Stark",
  "Joffrey Baratheon",
  "Sandor Clegane",
  "Tyrion Lannister",
  "Petyr Baelish",
  "Davos Seaworth",
  "Samwell Tarly",
  "Stannis Baratheon",
  "Jeor Mormont",
  "Margaery Tyrell",
  "Tywin Lannister",
  "Talisa Maegyr",
  "Tormund Giantsbane",
  "Ramsay Bolton",
  "Daario Naharis",
  "Ellaria Sand",
  "Tommen Baratheon",
  "Roose Bolton",
  "Grey Worm",
];
const emailServers = ["gmail", "hotmail", "msn", "test"];

const countries = [
  "Dorne",
  "King's Landing",
  "Highgarden",
  "Iron Islands",
  "Braavos",
  "Winterfell",
  "Astapor",
  "Meereen",
];

const validChars =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.:;\\-_+!@#$%^&*";

const getRandomPostalCode = () => Math.ceil(Math.random() * 51000).toString();

const getRandomElement = (list) =>
  list[Math.floor(Math.random() * list.length)];

const getRandomValidPassword = (validChars) => {
  const length = Math.floor(Math.random() * 12) + 8;
  let password = "";
  for (let i = 0; i < length; i++) {
    password += validChars.charAt(
      Math.floor(Math.random() * validChars.length)
    );
  }
  return password;
};

const getRandomPhoneNumber = () => {
  const ri = (n) => Math.ceil(Math.random() * n);
  const rd = () => Math.floor(Math.random() * 10);
  const rn = (n) => {
    let res = "";
    for (let i = 0; i < n; i++) {
      res += `${rd()}`;
    }
    return res;
  };
  return `+${rn(ri(2))} ${rn(3)}-${rn(2)}-${rn(2)}-${rn(2)}`;
};

const getNames = (names, countries, emailServers, validChars) => {
  return names.map((name) => {
    const [firstName, lastName] = name.split(" ");
    return {
      name: firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${getRandomElement(
        emailServers
      )}.com`,
      password: getRandomValidPassword(validChars),
      role: "user",
      phoneNumber: getRandomPhoneNumber(),
      country: getRandomElement(countries),
      postalCode: getRandomPostalCode(),
    };
  });
};

fs.writeFileSync(
  "users.json",
  JSON.stringify(getNames(names, countries, emailServers, validChars))
);
