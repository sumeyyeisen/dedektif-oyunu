import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyACbXG5mrAepRkjlZ-ToxKuce498LGseA8",
  authDomain: "dedektif-oyunu-5c012.firebaseapp.com",
  databaseURL: "https://dedektif-oyunu-5c012-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "dedektif-oyunu-5c012",
  storageBucket: "dedektif-oyunu-5c012.firebasestorage.app",
  messagingSenderId: "363711389354",
  appId: "1:363711389354:web:4db9184e33dc508bf73ad3"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };
