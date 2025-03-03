import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC67yvOnj-8ltRpFVfSJaOBjxDjS3Du-Rc",
  authDomain: "mariantbi-monitoring.firebaseapp.com",
  projectId: "mariantbi-monitoring",
  storageBucket: "mariantbi-monitoring.firebasestorage.app",
  messagingSenderId: "200018396961",
  appId: "1:200018396961:web:0986c4699ced3d79562060",
  measurementId: "G-4YGFR43WZ2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
