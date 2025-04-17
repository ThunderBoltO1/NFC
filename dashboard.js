// dashboard.js
import { db } from './database.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

async function loadJobs() {
  const table = document.getElementById("data-table");
  table.innerHTML = "";

  try {
    const querySnapshot = await getDocs(collection(db, "jobs"));
    let index = 1;

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const row = `
        <tr>
          <td class="p-2 border">${index++}</td>
          <td class="p-2 border">${data.employeeId || "-"}</td>
          <td class="p-2 border">${data.firstName || "-"}</td>
          <td class="p-2 border">${data.lastName || "-"}</td>
          <td class="p-2 border">${data.vehicleNumber || "-"}</td>
          <td class="p-2 border">${data.startLocation || "-"}</td>
          <td class="p-2 border">${data.endLocation || "-"}</td>
          <td class="p-2 border">${data.travelTimeSeconds || 0} วินาที</td>
        </tr>
      `;
      table.innerHTML += row;
    });
  } catch (error) {
    console.error("โหลดข้อมูลล้มเหลว:", error);
  }
}

loadJobs();