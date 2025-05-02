// employee-list.js
import { db } from './database.js';
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  deleteDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// DOM elements for the edit modal
const editModal = document.getElementById('editModal');
const editEmployeeId = document.getElementById('editEmployeeId');
const editFirstName = document.getElementById('editFirstName');
const editLastName = document.getElementById('editLastName');
const editDocId = document.getElementById('editDocId');
const saveEditButton = document.getElementById('saveEditButton');
const cancelEditButton = document.getElementById('cancelEditButton');

// Function to load all employees from Firestore
async function loadEmployees() {
  const tableBody = document.getElementById("employeeTableBody");
  tableBody.innerHTML = "";

  try {
    // Query the employee collection, ordered by timestamp (newest first)
    const q = query(collection(db, "employee"), orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" class="p-4 text-center text-gray-500">ไม่พบข้อมูลพนักงาน</td>
        </tr>
      `;
      return;
    }

    // Loop through each document and create a table row
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const date = data.timestamp?.toDate().toLocaleString('th-TH') || '-';
      
      const row = `
        <tr class="hover:bg-gray-100">
          <td class="p-2 border">${data.employeeId || '-'}</td>
          <td class="p-2 border">${data.firstName || '-'}</td>
          <td class="p-2 border">${data.lastName || '-'}</td>
          <td class="p-2 border">${date}</td>
          <td class="p-2 border">
            <button 
              class="edit-employee-btn bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 mr-1" 
              data-id="${doc.id}"
              data-employee-id="${data.employeeId}"
              data-first-name="${data.firstName}"
              data-last-name="${data.lastName}">
              แก้ไข
            </button>
            <button 
              class="delete-employee-btn bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600" 
              data-id="${doc.id}">
              ลบ
            </button>
          </td>
        </tr>
      `;
      tableBody.innerHTML += row;
    });

    // Add event listeners to buttons
    addDeleteEventListeners();
    addEditEventListeners();
  } catch (error) {
    console.error("❌ โหลดข้อมูลพนักงานล้มเหลว:", error);
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" class="p-4 text-center text-red-500">เกิดข้อผิดพลาดในการโหลดข้อมูล</td>
      </tr>
    `;
  }
}

// Function to add event listeners to delete buttons
function addDeleteEventListeners() {
  const deleteButtons = document.querySelectorAll('.delete-employee-btn');
  deleteButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
      const docId = e.target.getAttribute('data-id');
      
      if (confirm('คุณต้องการลบข้อมูลพนักงานนี้ใช่หรือไม่? การลบข้อมูลนี้จะไม่สามารถกู้คืนได้')) {
        try {
          await deleteEmployee(docId);
          alert('ลบข้อมูลพนักงานสำเร็จ');
          loadEmployees(); // Reload the employee list
        } catch (error) {
          console.error("❌ ลบข้อมูลพนักงานล้มเหลว:", error);
          alert('เกิดข้อผิดพลาดในการลบข้อมูลพนักงาน');
        }
      }
    });
  });
}

// Function to add event listeners to edit buttons
function addEditEventListeners() {
  const editButtons = document.querySelectorAll('.edit-employee-btn');
  editButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const docId = e.target.getAttribute('data-id');
      const employeeId = e.target.getAttribute('data-employee-id');
      const firstName = e.target.getAttribute('data-first-name');
      const lastName = e.target.getAttribute('data-last-name');
      
      // Populate the edit modal with employee data
      editDocId.value = docId;
      editEmployeeId.value = employeeId;
      editFirstName.value = firstName;
      editLastName.value = lastName;
      
      // Show the modal
      editModal.classList.remove('hidden');
    });
  });
}

// Function to delete an employee document from Firestore
async function deleteEmployee(docId) {
  try {
    const employeeRef = doc(db, "employee", docId);
    await deleteDoc(employeeRef);
    return true;
  } catch (error) {
    console.error("Error deleting employee document: ", error);
    throw error;
  }
}

// Function to update an employee document in Firestore
async function updateEmployee(docId, updatedData) {
  try {
    const employeeRef = doc(db, "employee", docId);
    await updateDoc(employeeRef, updatedData);
    return true;
  } catch (error) {
    console.error("Error updating employee document: ", error);
    throw error;
  }
}

// Event listener for save edit button
saveEditButton?.addEventListener('click', async () => {
  const docId = editDocId.value;
  const updatedData = {
    firstName: editFirstName.value,
    lastName: editLastName.value
  };
  
  try {
    await updateEmployee(docId, updatedData);
    alert('อัปเดตข้อมูลพนักงานสำเร็จ');
    editModal.classList.add('hidden');
    loadEmployees(); // Reload the employee list
  } catch (error) {
    console.error("❌ อัปเดตข้อมูลพนักงานล้มเหลว:", error);
    alert('เกิดข้อผิดพลาดในการอัปเดตข้อมูลพนักงาน');
  }
});

// Event listener for cancel edit button
cancelEditButton?.addEventListener('click', () => {
  editModal.classList.add('hidden');
});

// Close modal when clicking outside of it
editModal?.addEventListener('click', (e) => {
  if (e.target === editModal) {
    editModal.classList.add('hidden');
  }
});

// Load employees when the page loads
document.addEventListener('DOMContentLoaded', loadEmployees);
