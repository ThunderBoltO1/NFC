import { db } from './database.js';
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  deleteDoc
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
          <td class="p-2 border">${data.employeeId || '-'}</td>
          <td class="p-2 border">${data.firstName || '-'}</td>
          <td class="p-2 border">${data.lastName || '-'}</td>
          <td class="p-2 border">${data.vehicleNumber || '-'}</td>
          <td class="p-2 border">${data.startLocation || '-'}</td>
          <td class="p-2 border">${data.endLocation || '-'}</td>
          <td class="p-2 border">${data.travelTimeSeconds || 0}</td>
          <td class="p-2 border">${date}</td>
          <td class="p-2 border">
            <button 
              class="delete-btn bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600" 
              data-id="${doc.id}">
              ลบ
            </button>
          </td>
        </tr>
      `;
      tableBody.innerHTML += row;
    });

    // Add event listeners to delete buttons
    addDeleteEventListeners();
  } catch (error) {
    console.error("❌ โหลดข้อมูลล้มเหลว:", error);
  }
}

function addDeleteEventListeners() {
  const deleteButtons = document.querySelectorAll('.delete-btn');
  deleteButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
      const docId = e.target.getAttribute('data-id');
      if (confirm('คุณต้องการลบข้อมูลนี้ใช่หรือไม่?')) {
        try {
          await deleteJob(docId);
          alert('ลบข้อมูลสำเร็จ');
          loadJobs(); // Reload the data
        } catch (error) {
          console.error("❌ ลบข้อมูลล้มเหลว:", error);
          alert('เกิดข้อผิดพลาดในการลบข้อมูล');
        }
      }
    });
  });
}

async function deleteJob(docId) {
  try {
    const jobRef = doc(db, "jobs", docId);
    await deleteDoc(jobRef);
    return true;
  } catch (error) {
    console.error("Error deleting document: ", error);
    throw error;
  }
}

loadJobs();