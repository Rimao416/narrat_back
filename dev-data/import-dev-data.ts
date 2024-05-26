import mongoose, { Model } from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import { faker } from "@faker-js/faker";
import categoryModel, { ICategory } from "../models/categoryModel";
import authorModel, { IAuthor } from "../models/authorModel";
import bookModel from "../models/bookModel";
dotenv.config({ path: "./config.env" });

const database: string = process.env.DATABASE_TEST ?? "";
const databasePassword: string = process.env.DATABASE_PASSWORD ?? "";

const DB = database.replace("<password>", databasePassword);
mongoose.set("strictQuery", true);
mongoose.connect(DB).then(() => {
  console.log("Connexion réussie");
});
const categories = JSON.parse(
  fs.readFileSync(`${__dirname}/categories.json`, "utf-8")
);
const books = JSON.parse(
  fs.readFileSync(`${__dirname}/best_books.json`, "utf-8")
);

function generateISBN13(): string {
  // Générer les 12 premiers chiffres aléatoires
  let isbn: string = "978"; // Préfixe standard pour les ISBN-13
  for (let i = 0; i < 9; i++) {
    isbn += Math.floor(Math.random() * 10).toString();
  }

  // Calculer le chiffre de contrôle
  let sum: number = 0;
  for (let i = 0; i < 12; i++) {
    const digit: number = parseInt(isbn[i], 10);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  const checkDigit: number = (10 - (sum % 10)) % 10;

  // Ajouter le chiffre de contrôle à la fin
  isbn += checkDigit.toString();

  return isbn;
}

//   import data into DB
const importData = async () => {
  try {
    await categoryModel.create(categories);
    console.log("Data successfully loaded");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};
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
  await deleteData(authorModel);

  for (let i = 0; i < 200; i++) {
    try {
      await authorModel.create({
        fullname: faker.person.fullName(),
        bio: faker.lorem.sentence(),
        photo: faker.image.avatar(),
        books: [],
        surname: faker.person.lastName(),
        nationality: faker.location.country(),
        email: faker.internet.email(),
        website: faker.internet.url(),
      });
    } catch (error) {
      console.log(error);
    }
  }
  process.exit();
};

function getRandomNumberBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomAuthors(
  authors: IAuthor[] | ICategory[],
  maxAuthors: number
) {
  const numberOfAuthors = getRandomNumberBetween(1, maxAuthors);
  const selectedAuthors = new Set();

  while (selectedAuthors.size < numberOfAuthors) {
    const randomAuthor = authors[Math.floor(Math.random() * authors.length)];
    selectedAuthors.add(randomAuthor);
  }

  return Array.from(selectedAuthors);
}

// Cette fonction permet de créer des livres
const createBooks = async () => {
  // get authors
  await deleteData(bookModel);
  const authors = await authorModel.find();
  // get categories
  const categories = await categoryModel.find();

  // books.map((book: Book_dev) => {

  // });
  // 63 Categories
  // 200 Authors
  // 394
  // Parcourir jusqu'ç 393
  // create books

  for (let i = 0; i < 293; i++) {
    const actualBook = books[i];
    try {
      await bookModel.create({
        isbn: generateISBN13(),
        title: actualBook.title,
        pages: actualBook.pageCount > 0 ? actualBook.pageCount : 150,
        description: actualBook.shortDescription,
        cover: actualBook.thumbnailUrl,
        authors: getRandomAuthors(authors, 3),
        category: getRandomAuthors(categories, 3),
        year: actualBook.publishedDate,
      });
    } catch (error) {
      console.log(error);
    }
  }
  console.log(books.length);

  process.exit();
};
// Cette fonction attribue à chaque auteur son (ses) livre(s)
async function updateAuthorsWithBooks() {
  try {
    // Récupérer tous les livres de la base de données
    const books = await bookModel.find();

    // Parcourir tous les livres
    for (const book of books) {
      // Récupérer les identifiants des auteurs de ce livre
      const authorIds = book.authors;

      // Récupérer les informations sur les auteurs à partir de leurs identifiants
      const authors = await authorModel.find({ _id: { $in: authorIds } });

      // Mettre à jour la collection de chaque auteur avec le livre
      for (const author of authors) {
        // Vérifier si le livre n'est pas déjà dans la collection de l'auteur
        if (!author.books.includes(book._id.toString())) {
          // Ajouter le livre à la collection de l'auteur
          author.books.push(book._id.toString());
          // Enregistrer les modifications dans la base de données
          await author.save();
        }
      }
    }
    console.log("Mise à jour des auteurs avec les livres terminée.");
    process.exit()
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour des auteurs avec les livres :",
      error
    );
  }
}

if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData(bookModel);
} else if (process.argv[2] === "--createUser") {
  createFakeUsers();
} else if (process.argv[2] === "--createBooks") {
  createBooks();
} else if (process.argv[2] === "--asyncAuthors") {
  updateAuthorsWithBooks();
}