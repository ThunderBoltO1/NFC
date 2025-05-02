import { db } from './database.js';
import {
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

async function loadJobs() {
  const tableBody = document.getElementById("dataBody");
  tableBody.innerHTML = "";

  try {
    const q = query(collection(db, "jobs"), orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const date = data.timestamp?.toDate().toLocaleString('th-TH') || '-';
      const row = `
        <tr class="hover:bg-gray-100">
        <td class="p-2 border">${data.vehicleNumber || '-'}</td>
          <td class="p-2 border">${data.employeeId || '-'}</td>
          <td class="p-2 border">${data.firstName || '-'}</td>
          <td class="p-2 border">${data.lastName || '-'}</td>
          <td class="p-2 border">${data.startLocation || '-'}</td>
          <td class="p-2 border">${data.endLocation || '-'}</td>
          <td class="p-2 border">${data.travelTimeSeconds || 0}</td>
          <td class="p-2 border">${date}</td>
        </tr>
      `;
      tableBody.innerHTML += row;
    });
  } catch (error) {
    console.error("❌ โหลดข้อมูลล้มเหลว:", error);
  }
}

loadJobs();