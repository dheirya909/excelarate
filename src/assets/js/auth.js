import {getAuth, setPersistence, browserLocalPersistence} from "firebase/auth";
import app from "./app.js";

const auth = getAuth(app)

document.addEventListener('DOMContentLoaded', () => {
    setPersistence(auth, browserLocalPersistence)
        .then(_ => console.log('Persistence set'))
        .catch(err => console.error(err))
})

export default auth;