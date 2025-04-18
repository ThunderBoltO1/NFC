// database.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBTV8M7e_y8zjHR_8eFv2B6Zvnj4ZikDQI",
  authDomain: "nfc-c0d91.firebaseapp.com",
  projectId: "nfc-c0d91",
  storageBucket: "nfc-c0d91.appspot.com",
  messagingSenderId: "353816260176",
  appId: "1:353816260176:web:8b26af7cfab59e9e98eb55",
  measurementId: "G-VVBDNKNMQ4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and export
const db = getFirestore(app);
export { db };
// เพิ่ม event listener ให้ปุ่ม (กรณีใช้ฟอร์มในหน้า dashboard ด้วย)
document.getElementById("startButton")?.addEventListener("click", async () => {
  const data = {
    employeeId: document.getElementById("employeeId").value,
    firstName: document.getElementById("firstName").value,
    lastName: document.getElementById("lastName").value,
    vehicleNumber: document.getElementById("vehicleNumber").value,
    startLocation: document.getElementById("startLocation").value,
    endLocation: document.getElementById("endLocation").value,
    timestamp: serverTimestamp()
  };

  try {
    await addDoc(collection(db, "jobs"), data);
    alert("✅ บันทึกข้อมูลเรียบร้อยแล้ว!");
  } catch (error) {
    alert("❌ เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    console.error(error);
  }
});