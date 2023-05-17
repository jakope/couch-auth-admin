import createNano from "./nano-helper.js";
import { v4 as uuidv4 } from "uuid";
import URLSafeBase64 from 'urlsafe-base64';
const USER_REGEXP = /^[a-z0-9_-]{3,16}$/;
let localNano;
function removeHyphens(uuid) {
    return uuid.split('-').join('');
  }
  async function generateUsername(userDB){
    let keyOK = false;
    let newKey;
    while (!keyOK) {
      newKey = generateSlUserKey();
      keyOK = await verifyNewDBKey(newKey,userDB);
    }
    return newKey;
  }

  async function verifyNewDBKey(newKey,userDB){
    const keyQuery = {
      selector: {
        key: newKey
      },
      fields: ['key']
    };
    const results = await userDB.find(keyQuery);
    return results.docs.length === 0;
  }
  function generateSlUserKey() {
    let newKey = getUserKey();
    while (!USER_REGEXP.test(newKey)) {
      newKey = getUserKey();
    }
    return newKey;
  }
  function getUserKey() {
    return URLSafeUUID().substring(0, 8).toLowerCase();
  }
  export function URLSafeUUID() {
    return URLSafeBase64.encode(uuidv4(null, Buffer.alloc(16)));
  }

export const replicateDatabase = async function (url,dbname, newUrl, newDbname){
    console.log("start replication");
    const nano = createNano(url);
    const response = await nano.db.replicate(dbname,
        newUrl + '/' + newDbname,
                  { create_target:true })
    console.log("stop");
  }
export const createNewUsersdb = async function (dburl,oldDb,newDb){
    console.log("host",dburl,oldDb,newDb);
    const nano = createNano(dburl);
    
    const users = nano.db.use(oldDb);
    console.log("newDb",newDb);
try{
    await nano.db.create(newDb);
console.log("userdb created");
}catch(e){

}
    const newDatabase = nano.db.use(newDb);
    console.log("new UserDb created");
    console.log("start fetching userslist");
    const doclist = await users.list();
    console.log("userslist fetched");
    for(const doc of doclist.rows){
        const user_uid = await uuidv4();
        const newId = removeHyphens(user_uid);
        //const legady_user_id = await generateUsername(newDatabase);
        const fullDoc = await users.get(doc.id);
        let newDoc = {
            ...fullDoc,
            user_uid,
            _id : newId,
            key : doc.id,
        }
        delete newDoc._rev;
        await newDatabase.insert(newDoc);
        console.log("user written");
        console.log(fullDoc._id,newDoc._id);
    }
    console.log("all done");
}
