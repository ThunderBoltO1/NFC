import { db } from './database.js';
import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// DOM elements
const startButton = document.getElementById('startButton');
const timeSpan = document.getElementById('time');
const timerDiv = document.getElementById('timer');
const cancelButton = document.getElementById('cancelButton');

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
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการบันทึก: ", error);
      alert("บันทึกไม่สำเร็จ");
    }
  }
});