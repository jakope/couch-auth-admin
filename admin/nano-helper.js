import Nano from 'nano';
const create = (url)=>{
    console.log("url",url);
let nano = Nano({
  url,
  requestDefaults: {
    jar: true,
  },
});
return nano;
}
export default create;
