export const categories = [
  {
    name: "Mode",
  },
  {
    name: "Électronique",
  },
  {
    name: "Maison et Jardin",
  },
  {
    name: "Véhicules",
  },
  {
    name: "Immobilier",
  },

  {
    name: "Famille",
  },
  {
    name: "Santé et Beauté",
  },
];
type SubCategory={
  name:string,
  subCategories:string[]
}
export const allSubCategories :SubCategory[] =[
  {
    name: "Mode",
    subCategories: [
      "Vêtements",
      "Chaussures",
      "Montres et Bijoux",
      "Accessoires et Bagageries",
    ]
  },
  {
    name: "Électronique",
    subCategories: [
      "Ordinateurs",
      "Smartphones et objets connectés",
      "Tablettes",
      "Accessoires",
      "Jeux vidéos",
      "Électroménager",
      "Photo, audio et vidéo",
    ]
  },
  {
    name: "Maison et Jardin",
    subCategories: [
      "Jardinage",
      "Cuisine",
      "Bricolage",
      "Divers",
    ]
  },
  {
    name: "Véhicules",
    subCategories: [
      "Automobiles",
      "Camions",
      "Camionnettes",
      "Vélos",
      "Motos",
      "Divers",
    ]
  },
  {
    name: "Immobilier",
    subCategories: [
      "Maisons",
      "Appartements",
      "Villas",
      "Divers",
    ]
  },
  {
    name:"Maison et Jardin",
    subCategories: [
      "Ameublement",
      "Décorations",
      "Jardinage",
      "Linge de maison",
      "Électromenager",
      // "Papeterie et Fourniture"
    ]
  }


]