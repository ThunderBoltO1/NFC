// add-employee.js
import { db, collection, addDoc, serverTimestamp } from './database.js';

// ฟังชั่นเพิ่มพนักงาน
document.getElementById("saveEmployeeButton")?.addEventListener("click", async () => {
  const employeeData = {
    employeeId: document.getElementById("newEmployeeId").value,
    firstName: document.getElementById("newFirstName").value,
    lastName: document.getElementById("newLastName").value,
    timestamp: serverTimestamp()
  };

  try {
    await addDoc(collection(db, "employee"), employeeData);
    alert("✅ เพิ่มพนักงานเรียบร้อยแล้ว!");
    document.querySelectorAll("input").forEach(input => (input.value = ""));
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาดในการเพิ่มพนักงาน:", error);
    alert("❌ ไม่สามารถเพิ่มพนักงานได้");
  }
});
