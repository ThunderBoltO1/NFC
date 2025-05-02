// travel-timer.js - Functionality for the travel timer page
import { db } from './database.js';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// Global variables
let timerInterval;
let startTime;
let vehicleNumber = Math.floor(Math.random() * 9000) + 1000; // Random 4-digit number

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
  // Set random vehicle number
  document.getElementById('vehicleNumber').value = vehicleNumber;
  
  // Set up event listeners
  setupEventListeners();
});

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
  
  if (!employeeId) {
    resetEmployeeFields();
    return;
  }
  
  try {
    const q = query(collection(db, "employee"), where("employeeId", "==", employeeId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      resetEmployeeFields();
      return;
    }
    
    // Get the first matching employee
    const employeeData = querySnapshot.docs[0].data();
    
    // Update the form fields
    document.getElementById('firstName').value = employeeData.firstName || '';
    document.getElementById('lastName').value = employeeData.lastName || '';
    
    // Add visual indicator that data was loaded
    const firstNameInput = document.getElementById('firstName');
    const lastNameInput = document.getElementById('lastName');
    
    // Flash animation to show data was loaded
    [firstNameInput, lastNameInput].forEach(input => {
      input.classList.add('bg-green-50');
      setTimeout(() => {
        input.classList.remove('bg-green-50');
        input.classList.add('bg-gray-100');
      }, 500);
    });
    
  } catch (error) {
    console.error("❌ ดึงข้อมูลพนักงานล้มเหลว:", error);
    resetEmployeeFields();
  }
}

// Reset employee fields
function resetEmployeeFields() {
  document.getElementById('firstName').value = '';
  document.getElementById('lastName').value = '';
}

// Start the timer
function startTimer() {
  // Validate inputs
  const employeeId = document.getElementById('employeeId').value.trim();
  const firstName = document.getElementById('firstName').value.trim();
  const lastName = document.getElementById('lastName').value.trim();
  const startLocation = document.getElementById('startLocation').value.trim();
  const endLocation = document.getElementById('endLocation').value.trim();
  
  if (!employeeId || !firstName || !lastName) {
    alert('กรุณากรอกรหัสพนักงานที่ถูกต้อง');
    return;
  }
  
  if (!startLocation) {
    alert('กรุณากรอกสถานที่เริ่มต้น');
    return;
  }
  
  if (!endLocation) {
    alert('กรุณากรอกสถานที่ปลายทาง');
    return;
  }
  
  // Disable inputs
  document.getElementById('employeeId').disabled = true;
  document.getElementById('startLocation').disabled = true;
  document.getElementById('endLocation').disabled = true;
  
  // Hide start button, show destination and cancel buttons
  document.getElementById('startButton').classList.add('hidden');
  document.getElementById('destinationButton').classList.remove('hidden');
  document.getElementById('cancelButton').classList.remove('hidden');
  
  // Show timer
  document.getElementById('timer').classList.remove('hidden');
  
  // Set start time
  startTime = new Date();
  
  // Start timer interval
  timerInterval = setInterval(updateTimer, 1000);
  
  // Update timer immediately
  updateTimer();
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
  const endLocation = document.getElementById('endLocation').value.trim();
  
  // Save to Firebase
  try {
    await addDoc(collection(db, "jobs"), {
      employeeId,
      firstName,
      lastName,
      vehicleNumber,
      startLocation,
      endLocation,
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
  document.getElementById('successModal').classList.add('hidden');
  resetUI();
}

// Reset UI to initial state
function resetUI() {
  // Clear intervals
  clearInterval(timerInterval);
  
  // Reset timer display
  document.getElementById('hours').textContent = '00';
  document.getElementById('minutes').textContent = '00';
  document.getElementById('seconds').textContent = '00';
  
  // Hide timer
  document.getElementById('timer').classList.add('hidden');
  
  // Enable inputs
  document.getElementById('employeeId').disabled = false;
  document.getElementById('startLocation').disabled = false;
  document.getElementById('endLocation').disabled = false;
  
  // Clear location fields
  document.getElementById('startLocation').value = '';
  document.getElementById('endLocation').value = '';
  
  // Show start button, hide destination and cancel buttons
  document.getElementById('startButton').classList.remove('hidden');
  document.getElementById('destinationButton').classList.add('hidden');
  document.getElementById('cancelButton').classList.add('hidden');
  
  // Generate new vehicle number
  vehicleNumber = Math.floor(Math.random() * 9000) + 1000;
  document.getElementById('vehicleNumber').value = vehicleNumber;
}
