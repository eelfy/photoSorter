const {APP_START} = require('./app/app')

const STORE = {
  photos: null,
  spread: null
}

window.addEventListener("DOMContentLoaded", () => {
  const dropPhotos = document.getElementById("dropPhotos");
  const dropSpread = document.getElementById("dropSpread");

  const fileLoad = document.getElementById("fileLoad");
  const spreadLoad = document.getElementById("spreadLoad");

  const testBtn = document.getElementById("testBtn");
  const sortBrt = document.getElementById("sortBrt");
  
  const loaderWrapper = document.querySelector(".loaderWrapper");


  [("dragenter", "dragover", "dragleave", "dropPhotos")].forEach((eventName) => {
    dropPhotos.addEventListener(eventName, preventDefaults, false);
  });
  [("dragenter", "dragover", "dragleave", "dropPhotos")].forEach((eventName) => {
    dropSpread.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  const handleDropFile = async (e) => {
    let dt = e.dataTransfer;
    let photos = [...dt.files].reduce((prev, curr) => {
      prev[curr.name.split('.')[0]] = curr.path
      return prev
    }, {});
    console.log(photos);

    STORE.photos = photos
  }

  const handleDropSpread = async (e) => {
    let dt = e.dataTransfer;
    let spread = dt.files;
    console.log(spread);

    STORE.spread = spread
  }

  const saveFilesToStore = () => {
    STORE.photos = [...fileLoad.files].reduce((prev, curr) => {
      prev[curr.name.split('.')[0]] = curr.path
      return prev
    }, {});
    
  }

  const saveSpreadToStore = () => {
    STORE.spread = spreadLoad.files
  }
  
  dropPhotos.addEventListener("drop", handleDropFile, false);
  dropSpread.addEventListener("drop", handleDropSpread, false);

  fileLoad.addEventListener("change", saveFilesToStore);
  spreadLoad.addEventListener("change", saveSpreadToStore);

  testBtn.addEventListener('click', () => {
    console.log(STORE)
  })

  sortBrt.addEventListener('click', async () => {
    // const loader = document.createElement('span')
    // loader.className = 'loader'
    // loaderWrapper.appendChild(loader)
    
    const spreadFilePath = STORE.spread[0].path
    
    await APP_START(spreadFilePath, STORE.photos)

    // loader.remove()
    // loaderWrapper.textContent = 'done'
  })
});
