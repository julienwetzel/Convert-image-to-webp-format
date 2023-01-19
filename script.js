//références (reference objects) indispensables pour sélectionner les éléments DOM
let refs = {};
refs.imagePreviews = document.querySelector('#previews');
refs.fileSelector = document.querySelector('input[type=file]');

// fonction pour ajouter une imageBox
// l'argument passé est le conteneur dans lequel l'image sera insérée
function addImageBox(container) {
  // création d'élément DOM pour l'imageBox et pour la progression
  let imageBox = document.createElement("div");
  let progressBox = document.createElement("progress");
  // ajouter la progressBox à l'imageBox
  imageBox.appendChild(progressBox);
  // ajouter l'imageBox au conteneur
  container.appendChild(imageBox);
  
  // retourner l'imageBox à utiliser dans d'autres fonctions
  return imageBox;
}

// Fonction pour traiter le fichier, 
// l'argument est le fichier à traiter
function processFile(file) {
  // Vérifie si le fichier existe
  if (!file) {
    return;
  }

  // ajoute l'imageBox aux visualisations 
  let imageBox = addImageBox(refs.imagePreviews);

  // Charge les données d'image
  new Promise(function (resolve, reject) {
    // Création d'un nouvel élément Image
    let rawImage = new Image();

    // écoute à l'événement "load" pour déclencher la résolution de la Promise
    rawImage.addEventListener("load", function () {
      resolve(rawImage);
    });

    // Convertit le fichier en ObjectURL via des blob
    rawImage.src = URL.createObjectURL(file);
  })
  .then(function (rawImage) {
    // Convertit l'image en ObjectURL Webp via un canvas
    return new Promise(function (resolve, reject) {
      let canvas = document.createElement('canvas');
      let ctx = canvas.getContext("2d");

      // récupère la hauteur et la largeur de l'image
      let width = rawImage.width;
      let height = rawImage.height;

      // Redimensionne l'image de manière à ce que le côté le plus grand de l'image 
      // ne dépasse pas 1200px, tout en conservant les proportions de l'image d'origine
      let ratio = Math.min(1200 / width, 1200 / height);
      width *= ratio;
      height *= ratio;

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(rawImage, 0, 0, width, height);

      canvas.toBlob(function (blob) {
        resolve(URL.createObjectURL(blob));
      }, "image/webp");
    });
  })

   .then(function (imageURL) {
     // Charge l'image pour l'afficher sur la page
     return new Promise(function (resolve, reject) {
       let scaledImg = new Image();
 
       // écoute à l'événement "load" pour déclencher la résolution de la Promise
       scaledImg.addEventListener("load", function () {
         // retourne les données à utiliser dans d'autres fonctions
         resolve({imageURL, scaledImg});
       });
 
       // lié l'image à l'URL
       scaledImg.setAttribute("src", imageURL);
     });
   })
   .then(function (data) {
     // Injecter l'image dans le DOM
     let imageLink = document.createElement("a");
 
     // établir le lien et le téléchargement
     imageLink.setAttribute("href", data.imageURL);
     imageLink.setAttribute('download', `${file.name}.webp`);
     imageLink.appendChild(data.scaledImg);
 
     // remplace le contenu de l'imageBox
     imageBox.innerHTML = "";
     imageBox.appendChild(imageLink);
   });
 }
 
// Ajoute des commentaires en français sur le code suivant et affiche moi le code avec les commentaires ajoutés.
function processFiles(files) {
  // Loop des fichiers
  for (let file of files) {
    // Traite dates fichiers
    processFile(file);
  }
 }
 
 // Appeler processFiles lorsque le sélecteur de fichiers est changé
 function fileSelectorChanged() {
  processFiles(refs.fileSelector.files);
  // Réinitialiser le sélecteur de fichiers
  refs.fileSelector.value = "";
 }
 
 // Ajout l'événement pour changer le sélecteur
 refs.fileSelector.addEventListener("change", fileSelectorChanged);
 
 // Configurer glisser-déposer
 function dragenter(e) {
  // Arrêter la propagation de l'événement
  e.stopPropagation();
  // Interdire la propagation de l'événement
  e.preventDefault();
 }
 
 function dragover(e) {
  // Arrêter la propagation de l'événement
  e.stopPropagation();
  // Interdire la propagation de l'événement
  e.preventDefault();
 }
 
 function drop(callback, e) {
  // Arrêter la propagation de l'événement
  e.stopPropagation();
  // Interdire la propagation de l'événement
  e.preventDefault();
  // Appeller la fonction de rappel avec les fichiers
  callback(e.dataTransfer.files);
 }
 
 // Configuerer l'écoute des événement lors du glisser-déposer
 function setDragDrop(area, callback) {
  // Ajout de l'écoute "dragenter"
  area.addEventListener("dragenter", dragenter, false);
  // Ajout de l'écoute "dragover"
  area.addEventListener("dragover", dragover, false);
  // Ajout de l'écoute "drop"
  area.addEventListener("drop", function (e) { drop(callback, e); }, false);
 }
 
 // Définit le glisser-déposer document
 setDragDrop(document.documentElement, processFiles);