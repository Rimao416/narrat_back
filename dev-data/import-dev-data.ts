import mongoose, { Model } from "mongoose";
import dotenv from "dotenv";
import { faker } from "@faker-js/faker";
import customerModel from "../models/customerModel";
import ratingModel from "../models/ratingModel";
import itemModel from "../models/itemModel";
import categoryModel from "../models/categoryModel";
import { categories } from "./seed";
dotenv.config({ path: "./config.env" });

const database: string = process.env.DATABASE_TEST ?? "";
const databasePassword: string = process.env.DATABASE_PASSWORD ?? "";

const DB = database.replace("<password>", databasePassword);
mongoose.set("strictQuery", true);
mongoose.connect(DB).then(() => {
  console.log("Connexion réussie");
});

//   import data into DB

//   delete data from DB
const deleteData = async (model: Model<any>) => {
  try {
    await model.deleteMany();
    console.log("Data successfully deleted");
  } catch (err) {
    console.log(err);
  }
  // process.exit();
};
// Cette fonction permet de créer des auteurs
const createFakeUsers = async () => {
  // const users: IAuthor[] = [];

  await deleteData(customerModel);

  for (let i = 0; i < 20000; i++) {
    try {
      const newCustomer = await customerModel.create({
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        address: {
          street: faker.location.streetAddress(),
          city: faker.location.city(),
          state: faker.location.state(),
        },
        phoneNumber: faker.phone.imei(),
        bio: faker.lorem.sentence(),
        avatar: faker.image.avatar(),
      });
      // Example: Add initial ratings
      const ratings = [];
      for (let j = 0; j < faker.number.int({ min: 0, max: 10 }); j++) {
        const rating = await ratingModel.create({
          user: new mongoose.Types.ObjectId(),
          customer: newCustomer._id,
          rating: faker.number.int({ min: 1, max: 5 }),
          comment: faker.lorem.sentence(),
        });
        ratings.push(rating._id);
      }

      newCustomer.ratings = ratings;
      await newCustomer.save();
    } catch (error) {
      console.log(error);
    }
  }
  process.exit();
};

const createFakeItems = async () => {
  // deleteAllItems();
  // await deleteData(itemModel);
  const customers = await customerModel.find();
  const categories = await categoryModel.find(); // Fetch all categories

  const conditions = ["new", "used"];
  for (let i = 0; i < 200; i++) {
    try {
      const seller = customers[Math.floor(Math.random() * customers.length)];
      const likes = [];
      const numLikes = faker.datatype.number({ min: 0, max: 50 });
      for (let j = 0; j < numLikes; j++) {
        const randomIndex = Math.floor(Math.random() * customers.length);
        likes.push(customers[randomIndex]._id);
      }

      const media = [];
      const totalMedia = faker.datatype.number({ min: 1, max: 8 });
      for (let j = 0; j < totalMedia; j++) {
        const isImage = faker.datatype.boolean();
        media.push({
          type: isImage ? "image" : "video",
          url: isImage ? faker.image.imageUrl() : faker.internet.url(),
        });
      }

      const selectedCategories = [];
      const numCategories = faker.datatype.number({ min: 1, max: 5 });
      for (let k = 0; k < numCategories; k++) {
        const randomIndex = Math.floor(Math.random() * categories.length);
        selectedCategories.push(categories[randomIndex]._id);
      }

      const newItem = await itemModel.create({
        title: faker.commerce.productName(),
        description: faker.lorem.paragraph(),
        price: parseFloat(faker.commerce.price()),
        categories: selectedCategories,
        condition: conditions[Math.floor(Math.random() * conditions.length)],
        media: media,
        seller: seller._id,
        likes: likes,
      });
      seller.items.push(newItem._id); // Explicit cast to ObjectId
      await seller.save();
    } catch (error) {
      console.log(error);
    }
  }

  console.log("Items generation completed");
};

const deleteAllItemsAndRemoveReferences = async () => {
  try {
    // Fetch all items
    const items = await itemModel.find();

    // Remove each item and trigger the post deleteOne hook
    for (const item of items) {
      await item.deleteOne(); // Trigger post deleteOne hook
    }

    console.log(
      "Tous les articles et leurs références ont été supprimés des customers."
    );
  } catch (error) {
    console.error(
      "Erreur lors de la suppression des articles et de leurs références des customers :",
      error
    );
  }
};

// CATEGORIES

const seedCategories = async () => {
  try {
    await categoryModel.deleteMany({}); // Clear existing categories
    const createdCategories = await categoryModel.create(categories);
    console.log("Categories seeded successfully:", createdCategories);
  } catch (error) {
    console.error("Error seeding categories:", error);
  } finally {
    mongoose.disconnect();
  }
};

const deleteAllItems = async () => {
  try {
    await itemModel.deleteMany({});
    await customerModel.updateMany({}, { $unset: { items: 1 } });
    console.log("Tous les articles ont été supprimés avec succès.");
  } catch (error) {
    console.error("Erreur lors de la suppression des articles :", error);
  } finally {
    mongoose.disconnect();
  }
};

const generateRandomPhoneNumber = () => {
  const min = 100000000; // 9 chiffres minimum
  const max = 999999999; // 9 chiffres maximum
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const updateAllPhoneNumbers = async () => {
  try {
    // Connectez-vous à la base de données

    // Met à jour tous les numéros de téléphone des utilisateurs
    const result = await customerModel.updateMany(
      { phoneNumber: { $exists: true } }, // Filtre pour trouver les documents à mettre à jour
      { $set: { phoneNumber: generateRandomPhoneNumber().toString() } } // Mise à jour
    );

    console.log(`Nombre de documents mis à jour : ${result.modifiedCount}`);
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour des numéros de téléphone :",
      error
    );
  } finally {
    // Déconnectez-vous de la base de données
    mongoose.disconnect();
  }
};

const countryCodes = ["+243", "+242"];

const getRandomCountryCode = () => {
  const randomIndex = Math.floor(Math.random() * countryCodes.length);
  console.log(countryCodes[randomIndex]);
  return countryCodes[randomIndex];
};

const addCountryCode = async () => {
  try {
    // Trouver tous les documents
    const customers = await customerModel.find({});
    // Mettre à jour chaque document avec un code de pays aléatoire
    for (const customer of customers) {
      const countryCode = getRandomCountryCode();
      await customerModel.updateOne(
        { _id: customer._id },
        { $set: { countryCode } }
      );
    }

    console.log("Mise à jour des codes pays terminée");
  } catch (error) {
    console.error("Erreur lors de la mise à jour des utilisateurs:", error);
  } finally {
    mongoose.disconnect();
  }
};
const removeCountryField = async () => {
  try {
    // Mise à jour de tous les documents pour supprimer le champ address.country
    const result = await customerModel.updateMany(
      {}, // Filtre vide pour sélectionner tous les documents
      { $unset: { "address.country": "" } } // Supprime le champ country de l'objet address
    );

    console.log(`Documents modifiés: ${result.modifiedCount}`);
  } catch (error) {
    console.error("Erreur lors de la suppression du champ country:", error);
  } finally {
    mongoose.disconnect();
  }
};

if (process.argv[2] === "--import") {
  // importData();
} else if (process.argv[2] === "--delete") {
  deleteData(customerModel);
} else if (process.argv[2] === "--createUser") {
  createFakeUsers();
} else if (process.argv[2] === "--asyncAuthors") {
  //
} else if (process.argv[2] === "--createItems") {
  createFakeItems();
} else if (process.argv[2] === "--seedCategories") {
  seedCategories();
} else if (process.argv[2] === "--deleteAllItems") {
  deleteAllItems();
} else if (process.argv[2] === "--deleteAllItemsAndRemoveReferences") {
  deleteAllItemsAndRemoveReferences();
} else if (process.argv[2] === "--updatePhoneNumber") {
  updateAllPhoneNumbers();
} else if (process.argv[2] === "--addCountry") {
  addCountryCode();
} else if (process.argv[2] === "--deleteCountry") {
  removeCountryField();
}
