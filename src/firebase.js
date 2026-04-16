import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyCBltTlgjZBE9ptY7Sy3_AE24ssBGEPCaE",
  authDomain: "cleaning-checklist-506a7.firebaseapp.com",
  databaseURL: "https://cleaning-checklist-506a7-default-rtdb.firebaseio.com",
  projectId: "cleaning-checklist-506a7",
  storageBucket: "cleaning-checklist-506a7.firebasestorage.app",
  messagingSenderId: "1035809782186",
  appId: "1:1035809782186:web:5dfe754f3fd2f0f49993d3"
}

const app = initializeApp(firebaseConfig)
export const db = getDatabase(app)
