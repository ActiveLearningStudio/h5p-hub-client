import

export default class Hub {
  constructor(){
    console.log('im a hub');
    const contentBrowser = new H5P.contentBrowser();
  }

  getElement() {
    const res = document.createElement('div');
    res.innerHTML = "Hello world";
    return res;
  }
}
