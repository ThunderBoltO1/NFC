// travel-timer.js - Functionality for the travel timer page
import { db } from './database.js';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  orderBy,
  limit
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// Global variables
let timerInterval;
let startTime;
let vehicleNumber = Math.floor(Math.random() * 9000) + 1000; // Random 4-digit number
let locationOptions = [

];

// Initialize the page
document.addEventListener('DOMContentLoaded', async function() {
  await initializePage();
});

async function initializePage() {
  document.getElementById('vehicleNumber').value = vehicleNumber;
  populateLocationDropdown();
  await getLastEndLocation();
  setupEventListeners();
  updateStartButtonText();
}

function updateStartButtonText() {
  const startButton = document.getElementById('startButton');
  startButton.innerHTML = `
    <i class="fas fa-play mr-2" aria-hidden="true"></i>
    <span>เริ่มจับเวลา</span>
  `;
}

// Populate the endLocation dropdown with options
async function populateLocationDropdown() {
  const endLocationSelect = document.getElementById('endLocation');
  
  // ล้างตัวเลือกเดิมยกเว้นตัวแรก
  while (endLocationSelect.options.length > 1) {
    endLocationSelect.remove(1);
  }

  try {
    // เพิ่ม placeholder option
    const placeholderOption = document.createElement('option');
    placeholderOption.value = '';
    placeholderOption.textContent = '-- เลือกสถานที่ --';
    placeholderOption.selected = true;
    placeholderOption.disabled = true;
    endLocationSelect.appendChild(placeholderOption);

    // ดึงข้อมูลสถานที่จาก Firebase และเรียงตามชื่อ
    const querySnapshot = await getDocs(query(collection(db, "location"), orderBy("name")));
    
    querySnapshot.forEach(doc => {
      const locationData = doc.data();
      const option = document.createElement('option');
      option.value = doc.id;
      option.textContent = locationData.name;
      option.dataset.locationData = JSON.stringify(locationData);
      endLocationSelect.appendChild(option);
    });
  } catch (error) {
    console.error("❌ ดึงข้อมูลสถานที่ล้มเหลว:", error);
    // แสดง error message ให้ user เห็น
    const locationError = document.getElementById('locationError');
    showError(locationError, 'ไม่สามารถดึงข้อมูลสถานที่ได้ กรุณาลองใหม่อีกครั้ง');
  }
}

// Get the last endLocation from Firebase to use as startLocation
async function getLastEndLocation() {
  try {
    // Get the most recent job entry
    const q = query(
      collection(db, "jobs"),
      orderBy("timestamp", "desc"),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const lastJob = querySnapshot.docs[0].data();
      
      // Set the startLocation to the last endLocation
      if (lastJob.endLocation) {
        document.getElementById('startLocation').value = lastJob.endLocation;
      }
    }
  } catch (error) {
    console.error("❌ ดึงข้อมูลตำแหน่งล่าสุดล้มเหลว:", error);
  }
}

// Set up all event listeners
function setupEventListeners() {
  // Employee ID input
  document.getElementById('employeeId').addEventListener('blur', fetchEmployeeData);
  
  // Start button
  document.getElementById('startButton').addEventListener('click', startTimer);
  
  // Destination button
  document.getElementById('destinationButton').addEventListener('click', endTimer);
  
  // Cancel button
  document.getElementById('cancelButton').addEventListener('click', cancelTimer);
  
  // Close success modal button
  document.getElementById('closeSuccessModal').addEventListener('click', closeSuccessModal);
}

// Fetch employee data when employee ID is entered
async function fetchEmployeeData() {
  const employeeId = document.getElementById('employeeId').value.trim();
  const invalidFeedback = document.querySelector('.invalid-feedback');
  
  if (!employeeId) {
    resetEmployeeFields();
    showError(invalidFeedback, 'กรุณากรอกรหัสพนักงาน');
    return;
  }

  try {
    const q = query(collection(db, "employee"), where("employeeId", "==", employeeId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      resetEmployeeFields();
      showError(invalidFeedback, 'ไม่พบข้อมูลพนักงาน');
      return;
    }

    invalidFeedback.classList.add('hidden');
    const employeeData = querySnapshot.docs[0].data();
    updateEmployeeFields(employeeData);
    
  } catch (error) {
    console.error("❌ ดึงข้อมูลพนักงานล้มเหลว:", error);
    resetEmployeeFields();
    showError(invalidFeedback, 'เกิดข้อผิดพลาดในการดึงข้อมูล');
  }
}

function showError(element, message) {
  element.textContent = message;
  element.classList.remove('hidden');
}

function updateEmployeeFields(data) {
  const fields = ['firstName', 'lastName'];
  fields.forEach(field => {
    const input = document.getElementById(field);
    input.value = data[field] || '';
    flashInputSuccess(input);
  });
}

function flashInputSuccess(input) {
  input.classList.add('bg-green-50');
  setTimeout(() => {
    input.classList.remove('bg-green-50');
    input.classList.add('bg-gray-100');
  }, 500);
}

// Reset employee fields
function resetEmployeeFields() {
  document.getElementById('firstName').value = '';
  document.getElementById('lastName').value = '';
}

// Start timer with validation
function startTimer(event) {
  event.preventDefault();
  
  const startButton = document.getElementById('startButton');
  
  if (!validateForm()) {
    return;
  }

  startButton.disabled = true;
  startButton.dataset.loading = 'true';

  try {
    disableFormInputs();
    showTimer();
    initializeTimer();
    updateButtonsVisibility();
  } catch (error) {
    console.error("❌ เริ่มจับเวลาล้มเหลว:", error);
    startButton.disabled = false;
    startButton.dataset.loading = 'false';
  }
}

function validateForm() {
  const invalidFeedback = document.querySelector('.invalid-feedback');
  const locationError = document.getElementById('locationError');
  const fields = getFormFields();
  
  let isValid = true;

  if (!fields.employeeId || !fields.firstName || !fields.lastName) {
    showError(invalidFeedback, 'กรุณากรอกข้อมูลพนักงานให้ครบถ้วน');
    isValid = false;
  }

  if (!fields.startLocation || !fields.endLocation) {
    showError(locationError, 'กรุณาเลือกสถานที่ให้ครบถ้วน');
    isValid = false;
  }

  if (fields.startLocation === fields.endLocation) {
    showError(locationError, 'สถานที่เริ่มต้นและปลายทางต้องไม่เหมือนกัน');
    isValid = false;
  }

  return isValid;
}

function getFormFields() {
  const endLocationSelect = document.getElementById('endLocation');
  const selectedOption = endLocationSelect.options[endLocationSelect.selectedIndex];
  const locationData = selectedOption ? JSON.parse(selectedOption.dataset.locationData) : null;

  return {
    employeeId: document.getElementById('employeeId').value.trim(),
    firstName: document.getElementById('firstName').value.trim(),
    lastName: document.getElementById('lastName').value.trim(),
    startLocation: document.getElementById('startLocation').value.trim(),
    endLocation: locationData ? locationData.name : '',
    endLocationId: selectedOption ? selectedOption.value : '' // Store location ID
  };
}

function disableFormInputs() {
  document.getElementById('employeeId').disabled = true;
  document.getElementById('endLocation').disabled = true;
}

function showTimer() {
  document.getElementById('timer').classList.remove('hidden');
}

function initializeTimer() {
  startTime = new Date();
  timerInterval = setInterval(updateTimer, 1000);
  updateTimer();
}

function updateButtonsVisibility() {
  document.getElementById('startButton').classList.add('hidden');
  document.getElementById('destinationButton').classList.remove('hidden');
  document.getElementById('cancelButton').classList.remove('hidden');
}

// Update the timer display
function updateTimer() {
  const currentTime = new Date();
  const elapsedTime = Math.floor((currentTime - startTime) / 1000); // in seconds
  
  // Calculate hours, minutes, seconds
  const hours = Math.floor(elapsedTime / 3600);
  const minutes = Math.floor((elapsedTime % 3600) / 60);
  const seconds = elapsedTime % 60;
  
  // Update display
  document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
  document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
  document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
}

// End the timer and save data
async function endTimer() {
  // Stop the timer
  clearInterval(timerInterval);
  
  // Calculate elapsed time
  const currentTime = new Date();
  const travelTimeSeconds = Math.floor((currentTime - startTime) / 1000);
  
  // Get form values
  const employeeId = document.getElementById('employeeId').value.trim();
  const firstName = document.getElementById('firstName').value.trim();
  const lastName = document.getElementById('lastName').value.trim();
  const startLocation = document.getElementById('startLocation').value.trim();
  const endLocation = document.getElementById('endLocation').value;
  const fields = getFormFields();
  
  try {
    await addDoc(collection(db, "jobs"), {
      employeeId,
      firstName,
      lastName,
      vehicleNumber,
      startLocation,
      endLocation: fields.endLocation,
      endLocationId: fields.endLocationId, // Save location ID
      travelTimeSeconds,
      timestamp: serverTimestamp()
    });
    
    // Show success modal
    document.getElementById('successModal').classList.remove('hidden');
    
  } catch (error) {
    console.error("❌ บันทึกข้อมูลล้มเหลว:", error);
    alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง');
    
    // Reset UI
    resetUI();
  }
}

// Cancel the timer
function cancelTimer() {
  if (confirm('คุณต้องการยกเลิกการจับเวลาใช่หรือไม่?')) {
    // Stop the timer
    clearInterval(timerInterval);
    
    // Reset UI
    resetUI();
  }
}

// Close success modal and reset UI
function closeSuccessModal() {
  // Hide success modal
  document.getElementById('successModal').classList.add('hidden');
  
  // Reset UI
  resetUI();
  
  // Get last endLocation to use as startLocation for next trip
  getLastEndLocation();
}

// Reset UI to initial state
function resetUI() {
  clearTimerInterval();
  resetTimerDisplay();
  resetFormFields();
  resetErrorMessages();
  updateButtonStates();
  generateNewVehicleNumber();
}

function clearTimerInterval() {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
}

function resetTimerDisplay() {
  document.getElementById('hours').textContent = '00';
  document.getElementById('minutes').textContent = '00';
  document.getElementById('seconds').textContent = '00';
  document.getElementById('timer').classList.add('hidden');
}

function resetFormFields() {
  document.getElementById('employeeId').disabled = false;
  document.getElementById('endLocation').disabled = false;
  document.getElementById('employeeId').value = '';
  document.getElementById('firstName').value = '';
  document.getElementById('lastName').value = '';
  document.getElementById('endLocation').value = '';
  resetEmployeeFields();
}

function resetErrorMessages() {
  document.querySelector('.invalid-feedback').classList.add('hidden');
  document.getElementById('locationError').classList.add('hidden');
}

function updateButtonStates() {
  const startButton = document.getElementById('startButton');
  const destinationButton = document.getElementById('destinationButton');
  const cancelButton = document.getElementById('cancelButton');
  
  startButton.disabled = false;
  startButton.dataset.loading = 'false';
  startButton.classList.remove('hidden');
  destinationButton.classList.add('hidden');
  cancelButton.classList.add('hidden');
  
  updateStartButtonText();
}

function generateNewVehicleNumber() {
  vehicleNumber = Math.floor(Math.random() * 9000) + 1000;
  document.getElementById('vehicleNumber').value = vehicleNumber;
}
