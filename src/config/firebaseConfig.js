import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyC7cx8bQbNY1Y7DfBE7pOIBjFSo5XsTVwY",
  authDomain: "dedektif-oyunu-36e13.firebaseapp.com",
  databaseURL: "https://dedektif-oyunu-36e13-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "dedektif-oyunu-36e13",
  storageBucket: "dedektif-oyunu-36e13.firebasestorage.app",
  messagingSenderId: "140134422208",
  appId: "1:140134422208:web:c49b2989a4ca005c5d7f25",
  measurementId: "G-BPQXF9YZEP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };
