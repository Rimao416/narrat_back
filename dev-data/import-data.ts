// import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
// import authorModel from "../models/authorModel";
import { IAuthor } from "../models/authorModel";
// Fonction pour générer des catégories

const createFakeUsers = async () => {
  // const users: IAuthor[] = [];

  for (let i = 0; i < 200; i++) {
    // const user = new User({
    //   name: faker.name.fullName(),
    //   email: faker.internet.email(),
    //   password: faker.internet.password(),
    //   avatar: faker.image.avatar(),
    // });

    // users.push(user);
    console.log(faker.person.fullName());
  }
};
createFakeUsers();
