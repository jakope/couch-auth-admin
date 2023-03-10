import Nano  from 'nano'
const create = (url)=>{
    console.log("url 2",url);
let nano = Nano(url);
return nano;
}
export default create;
