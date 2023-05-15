import Nano from 'nano'
const create = (url)=>{
let nano = Nano(url);
return nano;
}
export default create;
