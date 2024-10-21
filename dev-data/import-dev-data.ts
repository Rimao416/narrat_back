import mongoose, { Model } from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { faker } from "@faker-js/faker";
import customerModel from "../models/customerModel";
import ratingModel from "../models/ratingModel";
import itemModel from "../models/itemModel";
import categoryModel from "../models/categoryModel";
import { allSubCategories, categories } from "./seed";
import subCategoryModel from "../models/subCategoryModel";

dotenv.config({ path: "./config.env" });

const database: string = process.env.DATABASE_TEST ?? "";
const databasePassword: string = process.env.DATABASE_PASSWORD ?? "";

const DB = database.replace("<password>", databasePassword);
mongoose.set("strictQuery", true);
mongoose.connect(DB).then(() => {
  console.log("Connexion réussie");
});

const getUserImagesFromJson = () => {
  const filePath = path.join(__dirname, "fichiers.json");
  const rawData = fs.readFileSync(filePath, "utf-8");
  const files = JSON.parse(rawData);

  // Filtrer les chemins dont le nom commence par "user"
  return files
    .filter((file: { nom: string }) =>
      file.nom.toLowerCase().startsWith("user")
    )
    .map((file: { nom: string }) => path.join(file.nom)); // Construire le chemin complet vers l’image
};

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

  const countryCode = faker.helpers.arrayElement(["+243", "+242"]);
  const userImages = getUserImagesFromJson(); // Récupérer les chemins des images

  for (const imagePath of userImages) {
    try {
      const newCustomer = await customerModel.create({
        fullName: "John Doe",
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        address: {
          street: faker.location.streetAddress(),
          city: faker.location.city(),
          state: faker.location.state(),
        },
        countryCode: countryCode,
        phoneNumber: faker.phone.imei(),
        bio: faker.lorem.sentence(),
        avatar: imagePath,
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
interface MediaFile {
  nom: string;
  type: "image" | "video";
}
const fichiers: MediaFile[] = JSON.parse(
  fs.readFileSync(path.join(__dirname, "fichiers.json"), "utf-8")
);

const createFakeItems = async () => {
  // deleteAllItems();
  // await deleteData(itemModel);
  const customers = await customerModel.find();
  const categories = await categoryModel.find(); // Fetch all categories

  const conditions = ["new", "used"];
  for (let i = 0; i < 30000; i++) {
    try {
      const seller = customers[Math.floor(Math.random() * customers.length)];
      const likes = [];
      const numLikes = faker.number.int({ min: 0, max: 50 });

      // Générer des likes aléatoires
      for (let j = 0; j < numLikes; j++) {
        const randomIndex = Math.floor(Math.random() * customers.length);
        likes.push(customers[randomIndex]._id);
      }

      // Sélectionner des médias à partir du fichier JSON

      // Sélectionner des images aléatoires
      const availableImages = fichiers.filter((f) => f.type === "image");
      const totalImages = faker.number.int({ min: 1, max: 8 });

      const images = Array.from({ length: totalImages }, () => {
        const selectedImage = faker.helpers.arrayElement(availableImages);
        return selectedImage.nom; // Utiliser le nom de l'image
      });

      // Sélectionner des catégories aléatoires
      const selectedCategories = [];
      const numCategories = faker.number.int({ min: 1, max: 5 });
      for (let k = 0; k < numCategories; k++) {
        const randomIndex = Math.floor(Math.random() * categories.length);
        selectedCategories.push(categories[randomIndex]._id);
      }

      // Créer un nouvel item
      const newItem = await itemModel.create({
        title: faker.commerce.productName(),
        description: faker.lorem.paragraph(),
        price: parseFloat(faker.commerce.price()),
        categories: selectedCategories,
        condition: conditions[Math.floor(Math.random() * conditions.length)],
        images: images,
        seller: seller._id,
        likes: likes,
      });

      // Ajouter l'item au vendeur et sauvegarder
      seller.items.push(newItem._id);
      await seller.save();
    } catch (error) {
      console.error("Erreur lors de la création des items:", error);
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
// Créations des catégories
const seedCategories = async () => {
  try {
    // await categoryModel.deleteMany({}); // Clear existing categories
    const createdCategories = await categoryModel.create(categories);
    console.log("Categories seeded successfully:", createdCategories);
  } catch (error) {
    console.error("Error seeding categories:", error);
  } finally {
    mongoose.disconnect();
  }
};

// Suppression des articles
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
// Mise à jour de tous les numéros de téléphone
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

// Fais la mise à jour des codes pays
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

// Ajouter une sous-categorys
const addsubCategory = async () => {
  try {
    // Trouver tous les documents
    const categories = await categoryModel.find({});
    for (const category of categories) {
      const responseCategories = allSubCategories.find((subCategory) => {
        return subCategory.name === category.name;
      });
      if (responseCategories) {
        for (const subCategory of responseCategories.subCategories) {
          await subCategoryModel.create({
            name: subCategory,
            category: category._id,
          });
        }
        // await subCategoryModel.create({
        //   name: responseCategories.name,
        //   category: category._id,
        // });
      }
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour des utilisateurs:", error);
  }
};

const Thanos = async () => {
  // DELETE ALL DATA FROM DB
  await deleteData(customerModel);
  await deleteData(itemModel);
  await deleteData(categoryModel);
  await deleteData(subCategoryModel);
  await deleteData(ratingModel);
  await deleteData(customerModel);
  // WHEN FINISH STOP
  console.log("Fin operation");
  process.exit();
};

// Cette fonction me permet de directement créer des données prédisposées à être utilisées dans mon application
// Je commence par créer les catégories, sous catégories, utilisateurs, items
// C'est l'opposé de Thanos
const createAll = async () => {
  await seedCategories();
  await addsubCategory();
  await createFakeUsers();
  await createFakeItems();
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
} else if (process.argv[2] === "--thanos") {
  Thanos();
} else if (process.argv[2] === "--addSubcategory") {
  addsubCategory();
} else if (process.argv[2] === "--createAll") {
  createAll();
}
