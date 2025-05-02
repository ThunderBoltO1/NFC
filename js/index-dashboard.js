// index-dashboard.js - Enhanced dashboard functionality for the main page
import { db } from './database.js';
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  deleteDoc,
  where,
  Timestamp
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// Global variables for pagination
let currentPage = 1;
let pageSize = 10;
let totalPages = 1;
let allData = [];
let filteredData = [];
let currentDocId = null;

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', async function() {
  // Load all data
  await loadAllData();
  
  // Set up event listeners
  setupEventListeners();
  
  // Initialize charts
  initializeCharts();
});

// Load all data from Firebase
async function loadAllData() {
  try {
    const q = query(collection(db, "jobs"), orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);
    
    allData = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      data.id = doc.id;
      allData.push(data);
    });
    
    // Update filtered data with all data initially
    filteredData = [...allData];
    
    // Update dashboard stats
    updateDashboardStats();
    
    // Update table with first page of data
    updateTable();
    
  } catch (error) {
    console.error("❌ โหลดข้อมูลล้มเหลว:", error);
    showError("ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
  }
}

// Set up all event listeners
function setupEventListeners() {
  // Search input
  document.getElementById('searchInput').addEventListener('input', handleSearch);
  
  // Filter select
  document.getElementById('filterSelect').addEventListener('change', handleFilter);
  
  // Export button
  document.getElementById('exportButton').addEventListener('click', exportData);
  
  // Page size select
  document.getElementById('pageSize').addEventListener('change', function() {
    pageSize = parseInt(this.value);
    currentPage = 1;
    updateTable();
  });
  
  // Pagination buttons
  document.getElementById('prevPage').addEventListener('click', function() {
    if (currentPage > 1) {
      currentPage--;
      updateTable();
    }
  });
  
  document.getElementById('nextPage').addEventListener('click', function() {
    if (currentPage < totalPages) {
      currentPage++;
      updateTable();
    }
  });
  
  // Modal buttons
  document.getElementById('cancelDelete').addEventListener('click', function() {
    hideModal();
  });
  
  document.getElementById('confirmDelete').addEventListener('click', async function() {
    if (currentDocId) {
      try {
        await deleteJob(currentDocId);
        hideModal();
        await loadAllData(); // Reload all data
        showSuccess("ลบข้อมูลสำเร็จ");
      } catch (error) {
        console.error("❌ ลบข้อมูลล้มเหลว:", error);
        showError("เกิดข้อผิดพลาดในการลบข้อมูล");
      }
    }
  });
}

// Handle search input
function handleSearch() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  
  if (searchTerm === '') {
    // If search is empty, reset to current filter
    handleFilter();
    return;
  }
  
  // Filter the data based on search term
  filteredData = allData.filter(item => {
    return (
      (item.employeeId && item.employeeId.toLowerCase().includes(searchTerm)) ||
      (item.firstName && item.firstName.toLowerCase().includes(searchTerm)) ||
      (item.lastName && item.lastName.toLowerCase().includes(searchTerm)) ||
      (item.startLocation && item.startLocation.toLowerCase().includes(searchTerm)) ||
      (item.endLocation && item.endLocation.toLowerCase().includes(searchTerm))
    );
  });
  
  // Reset to first page and update table
  currentPage = 1;
  updateTable();
  updateDashboardStats();
}

// Handle filter selection
function handleFilter() {
  const filterValue = document.getElementById('filterSelect').value;
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  
  // First apply date filter
  if (filterValue === 'all') {
    filteredData = [...allData];
  } else {
    const now = new Date();
    let startDate;
    
    if (filterValue === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (filterValue === 'week') {
      const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust for starting week on Monday
      startDate = new Date(now.getFullYear(), now.getMonth(), diff);
    } else if (filterValue === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    
    const startTimestamp = Timestamp.fromDate(startDate);
    
    filteredData = allData.filter(item => {
      return item.timestamp && item.timestamp >= startTimestamp;
    });
  }
  
  // Then apply search filter if search term exists
  if (searchTerm !== '') {
    filteredData = filteredData.filter(item => {
      return (
        (item.employeeId && item.employeeId.toLowerCase().includes(searchTerm)) ||
        (item.firstName && item.firstName.toLowerCase().includes(searchTerm)) ||
        (item.lastName && item.lastName.toLowerCase().includes(searchTerm)) ||
        (item.startLocation && item.startLocation.toLowerCase().includes(searchTerm)) ||
        (item.endLocation && item.endLocation.toLowerCase().includes(searchTerm))
      );
    });
  }
  
  // Reset to first page and update table
  currentPage = 1;
  updateTable();
  updateDashboardStats();
}

// Update the data table with current page data
function updateTable() {
  const tableBody = document.getElementById('dataBody');
  tableBody.innerHTML = '';
  
  // Calculate pagination
  totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredData.length);
  
  // Update table info
  document.getElementById('tableInfo').textContent = 
    `แสดง ${startIndex + 1} ถึง ${endIndex} จากทั้งหมด ${filteredData.length} รายการ`;
  
  // Update page buttons
  updatePagination();
  
  // Enable/disable prev/next buttons
  document.getElementById('prevPage').disabled = currentPage === 1;
  document.getElementById('nextPage').disabled = currentPage === totalPages || totalPages === 0;
  
  // If no data, show message
  if (filteredData.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" class="px-3 py-4 text-center text-gray-500">ไม่พบข้อมูล</td>
      </tr>
    `;
    return;
  }
  
  // Add rows for current page
  for (let i = startIndex; i < endIndex; i++) {
    const data = filteredData[i];
    const date = data.timestamp?.toDate().toLocaleString('th-TH') || '-';
    
    const row = document.createElement('tr');
    row.className = 'hover:bg-blue-50 transition-colors duration-150';
    
    row.innerHTML = `
      <td class="px-3 py-3 border">${data.employeeId || '-'}</td>
      <td class="px-3 py-3 border">${(data.firstName || '-')} ${(data.lastName || '')}</td>
      <td class="px-3 py-3 border">${data.vehicleNumber || '-'}</td>
      <td class="px-3 py-3 border">
        <span class="text-blue-600"><i class="fas fa-map-marker-alt mr-1"></i>${data.startLocation || '-'}</span>
        <span class="mx-2">→</span>
        <span class="text-green-600"><i class="fas fa-flag-checkered mr-1"></i>${data.endLocation || '-'}</span>
      </td>
      <td class="px-3 py-3 border text-center font-medium ${getTimeColorClass(data.travelTimeSeconds)}">${data.travelTimeSeconds || 0}</td>
      <td class="px-3 py-3 border text-center">${date}</td>
      <td class="px-3 py-3 border text-center">
        <div class="flex justify-center space-x-2">
          <button class="view-btn bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600" data-id="${data.id}" title="ดูรายละเอียด">
            <i class="fas fa-eye"></i>
          </button>
          <button class="delete-btn bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded transition duration-200" data-id="${data.id}" title="ลบข้อมูล">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      </td>
    `;
    
    tableBody.appendChild(row);
  }
  
  // Add event listeners to buttons
  addTableButtonListeners();
}

// Get color class based on travel time
function getTimeColorClass(seconds) {
  if (!seconds) return '';
  if (seconds < 300) return 'text-green-600'; // Less than 5 minutes
  if (seconds < 600) return 'text-blue-600'; // Less than 10 minutes
  if (seconds < 1800) return 'text-yellow-600'; // Less than 30 minutes
  return 'text-red-600'; // More than 30 minutes
}

// Update pagination buttons
function updatePagination() {
  const pageNumbers = document.getElementById('pageNumbers');
  pageNumbers.innerHTML = '';
  
  // Show max 5 page numbers
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + 4);
  
  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    const pageButton = document.createElement('button');
    pageButton.className = `px-3 py-1 border rounded ${i === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'} transition duration-200`;
    pageButton.textContent = i;
    pageButton.addEventListener('click', function() {
      currentPage = i;
      updateTable();
      updatePagination();
    });
    pageNumbers.appendChild(pageButton);
  }
}

// Add event listeners to table buttons
function addTableButtonListeners() {
  // Delete buttons
  document.querySelectorAll('.delete-btn').forEach(button => {
    button.addEventListener('click', function() {
      currentDocId = this.getAttribute('data-id');
      showModal();
    });
  });
  
  // View buttons
  document.querySelectorAll('.view-btn').forEach(button => {
    button.addEventListener('click', function() {
      const docId = this.getAttribute('data-id');
      const data = filteredData.find(item => item.id === docId);
      if (data) {
        showDetailModal(data);
      }
    });
  });
}

// Show delete confirmation modal
function showModal() {
  document.getElementById('deleteModal').classList.remove('hidden');
}

// Hide delete confirmation modal
function hideModal() {
  document.getElementById('deleteModal').classList.add('hidden');
  currentDocId = null;
}

// Show detail modal (to be implemented)
function showDetailModal(data) {
  // For now, just show an alert with the data
  alert(`รายละเอียดการเดินทาง:
รหัสพนักงาน: ${data.employeeId || '-'}
ชื่อ-นามสกุล: ${data.firstName || '-'} ${data.lastName || ''}
หมายเลขรถ: ${data.vehicleNumber || '-'}
เส้นทาง: ${data.startLocation || '-'} → ${data.endLocation || '-'}
เวลาที่ใช้: ${data.travelTimeSeconds || 0} วินาที
วันที่: ${data.timestamp?.toDate().toLocaleString('th-TH') || '-'}`);
}

// Delete job from Firebase
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

// Update dashboard statistics
function updateDashboardStats() {
  // Total trips
  document.getElementById('totalTrips').textContent = filteredData.length;
  
  // Average time
  const totalTime = filteredData.reduce((sum, item) => sum + (item.travelTimeSeconds || 0), 0);
  const avgTime = filteredData.length > 0 ? Math.round(totalTime / filteredData.length) : 0;
  document.getElementById('avgTime').textContent = `${avgTime} วินาที`;
  
  // Top employee
  const employeeCounts = {};
  filteredData.forEach(item => {
    if (item.employeeId) {
      employeeCounts[item.employeeId] = (employeeCounts[item.employeeId] || 0) + 1;
    }
  });
  
  let topEmployeeId = '-';
  let topCount = 0;
  
  for (const [employeeId, count] of Object.entries(employeeCounts)) {
    if (count > topCount) {
      topEmployeeId = employeeId;
      topCount = count;
    }
  }
  
  // Find employee name
  const topEmployee = filteredData.find(item => item.employeeId === topEmployeeId);
  const topEmployeeName = topEmployee ? 
    `${topEmployee.firstName || ''} ${topEmployee.lastName || ''}` : 
    '-';
  
  document.getElementById('topEmployee').textContent = topEmployeeName !== ' ' ? topEmployeeName : topEmployeeId;
  
  // Today's trips
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTimestamp = Timestamp.fromDate(today);
  
  const todayTrips = filteredData.filter(item => 
    item.timestamp && item.timestamp.toDate() >= today
  ).length;
  
  document.getElementById('todayTrips').textContent = todayTrips;
}

// Initialize charts
function initializeCharts() {
  initializeTripsChart();
  initializeEmployeeChart();
}

// Initialize trips by day chart
function initializeTripsChart() {
  const ctx = document.getElementById('tripsChart').getContext('2d');
  
  // Get data for last 7 days
  const dates = [];
  const counts = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    
    const dateTimestamp = Timestamp.fromDate(date);
    const nextDateTimestamp = Timestamp.fromDate(nextDate);
    
    const count = allData.filter(item => 
      item.timestamp && 
      item.timestamp >= dateTimestamp && 
      item.timestamp < nextDateTimestamp
    ).length;
    
    // Format date as day/month
    const formattedDate = `${date.getDate()}/${date.getMonth() + 1}`;
    
    dates.push(formattedDate);
    counts.push(count);
  }
  
  // Create chart
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: dates,
      datasets: [{
        label: 'จำนวนการเดินทาง',
        data: counts,
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderColor: 'rgb(37, 99, 235)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      }
    }
  });
}

// Initialize employee distribution chart
function initializeEmployeeChart() {
  const ctx = document.getElementById('employeeChart').getContext('2d');
  
  // Count trips by employee
  const employeeCounts = {};
  allData.forEach(item => {
    if (item.employeeId) {
      const name = item.firstName && item.lastName ? 
        `${item.firstName} ${item.lastName}` : 
        item.employeeId;
      
      employeeCounts[name] = (employeeCounts[name] || 0) + 1;
    }
  });
  
  // Sort by count and take top 5
  const sortedEmployees = Object.entries(employeeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  // Calculate others
  const totalCount = Object.values(employeeCounts).reduce((sum, count) => sum + count, 0);
  const topCount = sortedEmployees.reduce((sum, [_, count]) => sum + count, 0);
  const othersCount = totalCount - topCount;
  
  // Prepare data
  const labels = sortedEmployees.map(([name, _]) => name);
  const data = sortedEmployees.map(([_, count]) => count);
  
  if (othersCount > 0) {
    labels.push('อื่นๆ');
    data.push(othersCount);
  }
  
  // Colors
  const colors = [
    'rgba(99, 102, 241, 0.7)',
    'rgba(139, 92, 246, 0.7)',
    'rgba(236, 72, 153, 0.7)',
    'rgba(248, 113, 113, 0.7)',
    'rgba(251, 146, 60, 0.7)',
    'rgba(161, 161, 170, 0.7)'
  ];
  
  // Create chart
  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors,
        borderColor: 'white',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right'
        }
      }
    }
  });
}

// Export data to CSV
function exportData() {
  // Create CSV content
  let csvContent = "data:text/csv;charset=utf-8,";
  
  // Add headers
  csvContent += "รหัสพนักงาน,ชื่อ,นามสกุล,หมายเลขรถ,สถานที่เริ่มต้น,สถานที่ปลายทาง,เวลา (วินาที),วันที่\n";
  
  // Add data rows
  filteredData.forEach(item => {
    const date = item.timestamp?.toDate().toLocaleString('th-TH') || '-';
    const row = [
      item.employeeId || '',
      item.firstName || '',
      item.lastName || '',
      item.vehicleNumber || '',
      item.startLocation || '',
      item.endLocation || '',
      item.travelTimeSeconds || 0,
      date
    ].map(value => `"${value}"`).join(',');
    
    csvContent += row + "\n";
  });
  
  // Create download link
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "ข้อมูลการเดินทาง.csv");
  document.body.appendChild(link);
  
  // Trigger download
  link.click();
  document.body.removeChild(link);
}

// Show success message
function showSuccess(message) {
  alert(message);
}

// Show error message
function showError(message) {
  alert("ข้อผิดพลาด: " + message);
}
