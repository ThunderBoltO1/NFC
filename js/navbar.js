// navbar.js - Component for consistent navigation across pages
document.addEventListener('DOMContentLoaded', function() {
  const navbarContainer = document.getElementById('navbar-container');
  
  if (navbarContainer) {
    // Get current page path to highlight active link
    const currentPath = window.location.pathname;
    const pageName = currentPath.split('/').pop();
    
    // Create navbar HTML with improved styling
    const navbarHTML = `
      <nav class="bg-gradient-to-r from-blue-700 to-blue-500 shadow-lg">
        <div class="max-w-6xl mx-auto px-4">
          <div class="flex justify-between">
            <div class="flex space-x-4">
              <!-- Logo -->
              <div class="flex items-center py-4 px-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mr-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span class="font-bold text-white text-xl tracking-tight">ระบบจัดการข้อมูล</span>
              </div>
              
              <!-- Primary Nav -->
              <div class="hidden md:flex items-center space-x-2">
                <a href="index.html" class="py-4 px-3 rounded-md transition duration-300 ease-in-out transform hover:scale-105 ${pageName === 'index.html' || pageName === '' ? 'text-white font-bold border-b-2 border-yellow-300' : 'text-blue-100 hover:text-white hover:bg-blue-600'}">
                  <div class="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    หน้าหลัก
                  </div>
                </a>
                <a href="travel-timer.html" class="py-4 px-3 rounded-md transition duration-300 ease-in-out transform hover:scale-105 ${pageName === 'travel-timer.html' ? 'text-white font-bold border-b-2 border-yellow-300' : 'text-blue-100 hover:text-white hover:bg-blue-600'}">
                  <div class="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    จับเวลาเดินทาง
                  </div>
                </a>
                <a href="add-employee.html" class="py-4 px-3 rounded-md transition duration-300 ease-in-out transform hover:scale-105 ${pageName === 'add-employee.html' ? 'text-white font-bold border-b-2 border-yellow-300' : 'text-blue-100 hover:text-white hover:bg-blue-600'}">
                  <div class="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    เพิ่มพนักงานใหม่
                  </div>
                </a>
                <a href="employee-list.html" class="py-4 px-3 rounded-md transition duration-300 ease-in-out transform hover:scale-105 ${pageName === 'employee-list.html' ? 'text-white font-bold border-b-2 border-yellow-300' : 'text-blue-100 hover:text-white hover:bg-blue-600'}">
                  <div class="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    รายชื่อพนักงาน
                  </div>
                </a>
              </div>
            </div>
            
            <!-- Mobile menu button -->
            <div class="md:hidden flex items-center">
              <button id="mobile-menu-button" class="mobile-menu-button p-2 text-blue-100 hover:text-white focus:outline-none transition duration-300 ease-in-out transform hover:scale-110">
                <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Mobile Menu -->
        <div id="mobile-menu" class="mobile-menu hidden md:hidden">
          <a href="index.html" class="block py-3 px-4 text-sm ${pageName === 'index.html' || pageName === '' ? 'bg-blue-600 text-white font-bold' : 'text-blue-100 hover:bg-blue-600 hover:text-white'} transition duration-300 border-b border-blue-600">
            <div class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              หน้าหลัก
            </div>
          </a>
          <a href="travel-timer.html" class="block py-3 px-4 text-sm ${pageName === 'travel-timer.html' ? 'bg-blue-600 text-white font-bold' : 'text-blue-100 hover:bg-blue-600 hover:text-white'} transition duration-300 border-b border-blue-600">
            <div class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              จับเวลาเดินทาง
            </div>
          </a>
          <a href="add-employee.html" class="block py-3 px-4 text-sm ${pageName === 'add-employee.html' ? 'bg-blue-600 text-white font-bold' : 'text-blue-100 hover:bg-blue-600 hover:text-white'} transition duration-300 border-b border-blue-600">
            <div class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              เพิ่มพนักงานใหม่
            </div>
          </a>
          <a href="employee-list.html" class="block py-3 px-4 text-sm ${pageName === 'employee-list.html' ? 'bg-blue-600 text-white font-bold' : 'text-blue-100 hover:bg-blue-600 hover:text-white'} transition duration-300 border-b border-blue-600">
            <div class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              รายชื่อพนักงาน
            </div>
          </a>
        </div>
      </nav>
    `;
    
    // Insert navbar into container
    navbarContainer.innerHTML = navbarHTML;
    
    // Add mobile menu toggle functionality with animation
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
      mobileMenuButton.addEventListener('click', function() {
        // Toggle mobile menu with animation
        if (mobileMenu.classList.contains('hidden')) {
          mobileMenu.classList.remove('hidden');
          mobileMenu.classList.add('animate-fadeIn');
          
          // Rotate menu button
          this.classList.add('rotate-90');
          this.classList.add('transition-transform');
          this.classList.add('duration-300');
        } else {
          mobileMenu.classList.add('hidden');
          mobileMenu.classList.remove('animate-fadeIn');
          
          // Reset menu button rotation
          this.classList.remove('rotate-90');
        }
      });
    }
  }
  
  // Add custom animation to style tag
  const styleTag = document.createElement('style');
  styleTag.innerHTML = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn {
      animation: fadeIn 0.3s ease-in-out forwards;
    }
  `;
  document.head.appendChild(styleTag);
});
