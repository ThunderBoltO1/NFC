import { db } from './database.js';
import {
  collection,
  addDoc,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// ฟังก์ชันสำหรับเพิ่มสถานที่
async function addLocation(locationData) {
  try {
    const docRef = await addDoc(collection(db, "location"), locationData);
    console.log("✅ เพิ่มสถานที่สำเร็จ, ID:", docRef.id);
    return docRef;
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาดในการเพิ่มสถานที่:", error);
    throw error;
  }
}

// ตัวอย่างข้อมูลสถานที่
const sampleLocations = [
  { name: "สำนักงานใหญ่" },
  { name: "คลังสินค้าบางนา" },
  { name: "สาขารังสิต" }
];

// ฟังก์ชันสำหรับเพิ่มข้อมูลตัวอย่าง
async function addSampleLocations() {
  try {
    for (const location of sampleLocations) {
      await addLocation(location);
    }
    console.log("✅ เพิ่มข้อมูลตัวอย่างทั้งหมดสำเร็จ");
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาดในการเพิ่มข้อมูลตัวอย่าง:", error);
  }
}

// เรียกใช้ฟังก์ชันเพิ่มข้อมูลตัวอย่าง
// addSampleLocations();

// Export functions สำหรับใช้งานภายนอก
export { addLocation, addSampleLocations }; 