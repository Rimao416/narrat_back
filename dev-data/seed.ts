import fs from "fs";
const books = JSON.parse(fs.readFileSync(`${__dirname}/best_books.json`, "utf-8"));
console.log(books);
const importData = async () => {
  try {
    console.log(books);
  } catch (err) {
    console.log(err);
  }
  process.exit();
};
if (process.argv[2] === "--import") {
  importData();
} 
// const makeSeeder=async()=>{
//     try {

//     } catch (error) {

//     }
// }
