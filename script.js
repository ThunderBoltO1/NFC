// script.js
import { db } from './database.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

let timer;
let seconds = 0;

const startButton = document.getElementById('startButton');
const cancelButton = document.getElementById('cancelButton');
const timerDiv = document.getElementById('timer');
const timeSpan = document.getElementById('time');

function resetUI() {
  startButton.textContent = 'เริ่ม';
  startButton.classList.remove('bg-blue-500', 'hover:bg-blue-600');
  startButton.classList.add('bg-green-500', 'hover:bg-green-600');
  timerDiv?.classList.add('hidden');
  cancelButton?.classList.add('hidden');
  seconds = 0;
  timeSpan.textContent = seconds;
  clearInterval(timer);
  startButton.disabled = false;
}

startButton?.addEventListener('click', async function () {
  if (startButton.textContent === 'เริ่ม') {
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
  } else {
    clearInterval(timer);
    startButton.disabled = true;

    const data = {
      employeeId: document.getElementById("employeeId").value,
      firstName: document.getElementById("firstName").value,
      lastName: document.getElementById("lastName").value,
      vehicleNumber: document.getElementById("vehicleNumber").value,
      startLocation: document.getElementById("startLocation").value,
      endLocation: document.getElementById("endLocation").value,
      travelTimeSeconds: seconds,
      timestamp: serverTimestamp()
    };

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

cancelButton?.addEventListener('click', resetUI);
resetUI();