import { db } from './database.js';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// DOM elements
const startButton = document.getElementById('startButton');
const timeSpan = document.getElementById('time');
const timerDiv = document.getElementById('timer');
const cancelButton = document.getElementById('cancelButton');
const employeeIdInput = document.getElementById('employeeId');
const firstNameInput = document.getElementById('firstName');
const lastNameInput = document.getElementById('lastName');

// Variables
let seconds = 0;
let timer;

// Function to reset UI to initial state
function resetUI() {
  clearInterval(timer);
  seconds = 0;
  timeSpan.textContent = seconds;
  timerDiv?.classList.add('hidden');
  startButton.textContent = 'เริ่ม';
  startButton.classList.remove('bg-blue-500', 'hover:bg-blue-600');
  startButton.classList.add('bg-green-500', 'hover:bg-green-600');
  startButton.disabled = false;
  cancelButton?.classList.add('hidden');
}

// Function to fetch employee data based on employee ID
async function fetchEmployeeData(employeeId) {
  if (!employeeId) return;
  
  try {
    const q = query(collection(db, "employee"), where("employeeId", "==", employeeId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      // Get the first matching document
      const employeeData = querySnapshot.docs[0].data();
      
      // Update the form fields
      firstNameInput.value = employeeData.firstName || '';
      lastNameInput.value = employeeData.lastName || '';
      
      // Make name fields read-only
      firstNameInput.readOnly = true;
      lastNameInput.readOnly = true;
      
      // Add visual indication that these fields are auto-filled
      firstNameInput.classList.add('bg-gray-100');
      lastNameInput.classList.add('bg-gray-100');
    } else {
      console.log("ไม่พบข้อมูลพนักงานสำหรับรหัส:", employeeId);
      // Reset name fields if no employee found
      firstNameInput.value = '';
      lastNameInput.value = '';
      firstNameInput.readOnly = false;
      lastNameInput.readOnly = false;
      firstNameInput.classList.remove('bg-gray-100');
      lastNameInput.classList.remove('bg-gray-100');
    }
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการดึงข้อมูลพนักงาน:", error);
  }
}

// Add event listener to employee ID input
employeeIdInput?.addEventListener('blur', function() {
  fetchEmployeeData(this.value);
});

// Also fetch when user presses Enter in the employee ID field
employeeIdInput?.addEventListener('keyup', function(event) {
  if (event.key === 'Enter') {
    fetchEmployeeData(this.value);
  }
});

// Cancel button event listener
cancelButton?.addEventListener('click', function() {
  resetUI();
});

startButton?.addEventListener('click', async function () {
  console.log('startButton clicked, current text:', startButton.textContent);
  if (startButton.textContent === 'เริ่ม') {
    // เริ่มนับเวลา
    seconds = 0;
    timeSpan.textContent = seconds;
    timerDiv?.classList.remove('hidden');
    startButton.textContent = 'ถึงที่หมาย';
    startButton.classList.remove('bg-green-500', 'hover:bg-green-600');
    startButton.classList.add('bg-blue-500', 'hover:bg-blue-600');
    cancelButton?.classList.remove('hidden');
    timer = setInterval(() => {
      seconds++;
      timeSpan.textContent = seconds;
    }, 1000);
    console.log('Timer started');
  } else {
    // กดปุ่มถึงที่หมาย
    clearInterval(timer);
    startButton.disabled = true;
    console.log('Timer stopped, preparing to save data');
    
    // เก็บข้อมูลการเดินทางตอนถึงที่หมาย
    const data = {
      employeeId: document.getElementById("employeeId").value,
      firstName: document.getElementById("firstName").value,
      lastName: document.getElementById("lastName").value,
      vehicleNumber: document.getElementById("vehicleNumber").value,
      startLocation: document.getElementById("startLocation").value,
      endLocation: document.getElementById("endLocation").value,
      travelTimeSeconds: seconds, // บันทึกเวลาที่ใช้เดินทาง
      timestamp: serverTimestamp() // เวลาที่บันทึก
    };

    // บันทึกข้อมูลลง Firestore
    try {
      await addDoc(collection(db, "jobs"), data);
      alert("บันทึกข้อมูลสำเร็จ");
      resetUI();
      document.querySelectorAll("input").forEach(input => input.value = "");
      // Reset the read-only and styling on name fields
      firstNameInput.readOnly = false;
      lastNameInput.readOnly = false;
      firstNameInput.classList.remove('bg-gray-100');
      lastNameInput.classList.remove('bg-gray-100');
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการบันทึก: ", error);
      alert("บันทึกไม่สำเร็จ");
    }
  }
});