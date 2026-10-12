/**
 * PataFurniture - Partner Portal script
 * Handles local auth, listing creation, list manager and sync to localstorage
 */

document.addEventListener('DOMContentLoaded', () => {
  // Global States
  let currentPartner = null;
  let customListings = [];

  // DOM Elements - Auth Section
  const authSection = document.getElementById('authSection');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const tabLogin = document.getElementById('tabLogin');
  const tabRegister = document.getElementById('tabRegister');

  // DOM Elements - Dashboard Section
  const dashboardSection = document.getElementById('dashboardSection');
  const dashboardBusinessName = document.getElementById('dashboardBusinessName');
  const logoutBtn = document.getElementById('logoutBtn');
  const catalogTableBody = document.getElementById('catalogTableBody');

  // DOM Elements - Modals
  const postModal = document.getElementById('postModal');
  const openPostModalBtn = document.getElementById('openPostModalBtn');
  const postModalClose = document.getElementById('postModalClose');
  const cancelPostBtn = document.getElementById('cancelPostBtn');
  const postForm = document.getElementById('postForm');

  // DOM Elements - Form File upload simulator
  const postImage = document.getElementById('postImage');
  const uploadBtn = document.getElementById('uploadBtn');
  const photoSelectWrapper = document.getElementById('photoSelectWrapper');
  const photoFileName = document.getElementById('photoFileName');

  // DOM Elements - Stats
  const statListingsCount = document.getElementById('statListingsCount');
  const statViews = document.getElementById('statViews');
  const statBrokerages = document.getElementById('statBrokerages');
  const statRevenue = document.getElementById('statRevenue');

  // Base64 image variable
  let uploadedImageBase64 = '';

  // Category fallback images matching index.html assets
  const categoryFallbackImages = {
    living: 'images/hero-living-room.jpg',
    bedroom: 'images/portfolio-bedroom.jpg',
    dining: 'images/portfolio-dining.jpg',
    office: 'images/portfolio-office.jpg',
    outdoor: 'images/portfolio-outdoor.jpg'
  };

  // Seed default partner and listings for testing
  seedDefaultData();

  // Check login state on page load
  checkLoginState();

  function seedDefaultData() {
    // Seed default partner
    let partners = [];
    try {
      partners = JSON.parse(localStorage.getItem('pata_partners')) || [];
    } catch (e) {
      partners = [];
    }
    
    const partnerExists = partners.some(p => p.email === 'partner@patafurniture.com');
    if (!partnerExists) {
      partners.push({
        id: 'p-default-1',
        businessName: 'Nairobi Artisans Ltd',
        ownerName: 'Jane Koech',
        email: 'partner@patafurniture.com',
        phone: '0712345678',
        businessType: 'Registered LTD Company',
        location: 'Nairobi',
        kraPin: 'A009876543Z',
        businessRegNo: 'PVT-LTD-9876',
        address: 'Ngong Road, Nairobi',
        password: 'password123',
        subscriptionPaid: true,
        nextBillingDate: '15/09/2026'
      });
      localStorage.setItem('pata_partners', JSON.stringify(partners));
    }

    // Seed default items
    let listings = [];
    try {
      listings = JSON.parse(localStorage.getItem('pata_furniture_items')) || [];
    } catch (e) {
      listings = [];
    }

    if (listings.length === 0) {
      const defaultListings = [
        {
          id: 'c-default-1',
          title: 'Chunky Mahogany Bed frame',
          category: 'bedroom',
          price: 'KES 85,000',
          priceNumeric: 85000,
          materials: 'Solid Mahogany Wood',
          dimensions: '6ft x 6ft',
          description: 'Handcrafted king-sized solid mahogany bed frame with a warm glossy varnish. Exceptional durability.',
          image: 'images/portfolio-bedroom.jpg',
          location: 'Nairobi',
          maker: 'Nairobi Artisans Ltd',
          makerId: 'p-default-1',
          status: 'active',
          dateAdded: new Date().toLocaleDateString('en-GB')
        },
        {
          id: 'c-default-2',
          title: 'Minimalist Teak Desk',
          category: 'office',
          price: 'KES 42,000',
          priceNumeric: 42000,
          materials: 'Teak Wood, Steel',
          dimensions: '1.2m x 0.6m',
          description: 'Elegant home office desk featuring double drawer storage and sturdy powder-coated black steel legs.',
          image: 'images/portfolio-office.jpg',
          location: 'Nairobi',
          maker: 'Nairobi Artisans Ltd',
          makerId: 'p-default-1',
          status: 'pending',
          dateAdded: new Date().toLocaleDateString('en-GB')
        },
        {
          id: 'c-default-3',
          title: 'Rustic 6-Seater Dining Set',
          category: 'dining',
          price: 'KES 115,000',
          priceNumeric: 115000,
          materials: 'Cypress Wood',
          dimensions: '2.0m x 0.9m',
          description: 'Beautifully distressed cypress wood dining table complete with six upholstered dining chairs.',
          image: 'images/portfolio-dining.jpg',
          location: 'Nairobi',
          maker: 'Nairobi Artisans Ltd',
          makerId: 'p-default-1',
          status: 'sold',
          dateAdded: new Date().toLocaleDateString('en-GB')
        }
      ];
      localStorage.setItem('pata_furniture_items', JSON.stringify(defaultListings));
    }
  }

  // ===== AUTHENTICATION SWITCHING =====
  if (tabLogin && tabRegister) {
    tabLogin.addEventListener('click', () => {
      tabLogin.classList.add('active');
      tabRegister.classList.remove('active');
      loginForm.classList.add('active');
      registerForm.classList.remove('active');
    });

    tabRegister.addEventListener('click', () => {
      tabRegister.classList.add('active');
      tabLogin.classList.remove('active');
      registerForm.classList.add('active');
      loginForm.classList.add('active');
    });
  }

  // ===== USER AUTHENTICATION SIMULATOR & M-PESA PAYMENT =====
  let tempPartnerDetails = null;

  const paymentModal = document.getElementById('paymentModal');
  const paymentForm = document.getElementById('paymentForm');
  const paymentPhone = document.getElementById('paymentPhone');
  const cancelPaymentBtn = document.getElementById('cancelPaymentBtn');
  const paymentModalClose = document.getElementById('paymentModalClose');
  const confirmPaymentBtn = document.getElementById('confirmPaymentBtn');

  function openPaymentModal(partnerDetails) {
    tempPartnerDetails = partnerDetails;
    if (paymentPhone) {
      paymentPhone.value = partnerDetails.phone;
    }
    if (paymentModal) {
      paymentModal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closePaymentModal() {
    if (paymentModal) {
      paymentModal.classList.remove('open');
      document.body.style.overflow = '';
    }
    tempPartnerDetails = null;
  }

  if (paymentModalClose) paymentModalClose.addEventListener('click', closePaymentModal);
  if (cancelPaymentBtn) cancelPaymentBtn.addEventListener('click', closePaymentModal);

  // STK Push submit simulation
  if (paymentForm) {
    paymentForm.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!tempPartnerDetails) return;

      const originalBtnText = confirmPaymentBtn.innerHTML;
      confirmPaymentBtn.innerHTML = 'Sending push prompt... 📲';
      confirmPaymentBtn.disabled = true;

      // Simulate network request delay (STK Push receipt)
      setTimeout(() => {
        const pin = prompt('PataFurniture Subscription Activation:\n\nEnter your M-Pesa PIN on your phone to complete Ksh. 12,500 payment (Simulation):');
        
        if (pin !== null && pin.trim() !== '') {
          // Complete Registration
          let partners = getStoredPartners();
          tempPartnerDetails.subscriptionPaid = true;
          tempPartnerDetails.nextBillingDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB');

          partners.push(tempPartnerDetails);
          localStorage.setItem('pata_partners', JSON.stringify(partners));

          // Log in the user
          setSession(tempPartnerDetails);
          registerForm.reset();
          closePaymentModal();
          alert('✅ Payment verified! Your PataFurniture partner profile is now active.');
        } else {
          alert('❌ Payment cancelled or invalid PIN entered. Profile could not be activated.');
          confirmPaymentBtn.innerHTML = originalBtnText;
          confirmPaymentBtn.disabled = false;
        }
      }, 1500);
    });
  }

  // Register Handle
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const businessName = document.getElementById('regBusinessName').value.trim();
      const ownerName = document.getElementById('regOwnerName').value.trim();
      const email = document.getElementById('regEmail').value.trim().toLowerCase();
      const phone = document.getElementById('regPhone').value.trim();
      const businessType = document.getElementById('regBusinessType').value;
      const location = document.getElementById('regLocation').value;
      const kraPin = document.getElementById('regKraPin').value.trim().toUpperCase();
      const businessRegNo = document.getElementById('regBusinessRegNo').value.trim();
      const address = document.getElementById('regAddress').value.trim();
      const password = document.getElementById('regPassword').value;

      // Validate email uniqueness
      let partners = getStoredPartners();
      if (partners.some(p => p.email === email)) {
        alert('An account with this email already exists!');
        return;
      }

      // Store temp details and initiate checkout
      const newPartner = {
        id: 'p-' + Date.now(),
        businessName,
        ownerName,
        email,
        phone,
        businessType,
        location,
        kraPin,
        businessRegNo,
        address,
        password
      };

      openPaymentModal(newPartner);
    });
  }

  // Login Handle
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const email = document.getElementById('loginEmail').value.trim().toLowerCase();
      const password = document.getElementById('loginPassword').value;

      const partners = getStoredPartners();
      const partner = partners.find(p => p.email === email && p.password === password);

      if (partner) {
        setSession(partner);
        loginForm.reset();
      } else {
        alert('Invalid email or password. Please try again.');
      }
    });
  }

  // Logout Handle
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('pata_partner_session');
      currentPartner = null;
      checkLoginState();
    });
  }

  function getStoredPartners() {
    try {
      return JSON.parse(localStorage.getItem('pata_partners')) || [];
    } catch (e) {
      return [];
    }
  }

  function setSession(partner) {
    localStorage.setItem('pata_partner_session', JSON.stringify(partner));
    checkLoginState();
  }

  function checkLoginState() {
    try {
      currentPartner = JSON.parse(localStorage.getItem('pata_partner_session'));
    } catch (e) {
      currentPartner = null;
    }

    if (currentPartner) {
      // Show Dashboard
      authSection.style.display = 'none';
      dashboardSection.style.display = 'block';
      logoutBtn.style.display = 'block';
      dashboardBusinessName.textContent = currentPartner.businessName;
      
      // Populate Legal details
      document.getElementById('profileKra').textContent = currentPartner.kraPin || 'N/A';
      document.getElementById('profileRegNo').textContent = currentPartner.businessRegNo || 'N/A';
      document.getElementById('profileAddress').textContent = currentPartner.address || 'N/A';
      document.getElementById('profileType').textContent = currentPartner.businessType || 'N/A';

      const billingStatusEl = document.getElementById('statBillingStatus');
      if (billingStatusEl) {
        billingStatusEl.innerHTML = `Active<br><span style="font-size: 10px; opacity: 0.7;">Renewal: ${currentPartner.nextBillingDate || 'N/A'}</span>`;
      }

      // Load current partner catalog
      loadPartnerCatalog();
    } else {
      // Show Login Card
      authSection.style.display = 'flex';
      dashboardSection.style.display = 'none';
      logoutBtn.style.display = 'none';
    }
  }


  // ===== PORTAL MODAL ACTIONS =====
  if (openPostModalBtn) {
    openPostModalBtn.addEventListener('click', () => {
      postModal.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  }

  function closeModal() {
    postModal.classList.remove('open');
    document.body.style.overflow = '';
    postForm.reset();
    photoFileName.textContent = 'Choose photo or upload file';
    uploadedImageBase64 = '';
  }

  if (postModalClose) postModalClose.addEventListener('click', closeModal);
  if (cancelPostBtn) cancelPostBtn.addEventListener('click', closeModal);
  
  if (postModal) {
    postModal.addEventListener('click', (e) => {
      if (e.target === postModal) {
        closeModal();
      }
    });
  }


  // ===== PHOTO UPLOADER SIMULATION =====
  if (photoSelectWrapper) {
    photoSelectWrapper.addEventListener('click', () => {
      postImage.click();
    });
  }
  if (uploadBtn) {
    uploadBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // prevent duplicate trigger
      postImage.click();
    });
  }

  if (postImage) {
    postImage.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        photoFileName.textContent = file.name;
        
        // Convert to Base64 for localStorage persistence
        const reader = new FileReader();
        reader.onload = function(event) {
          uploadedImageBase64 = event.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }


  // ===== PRODUCT LISTING LOGIC =====
  if (postForm) {
    postForm.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!currentPartner) return;

      const title = document.getElementById('postTitle').value.trim();
      const category = document.getElementById('postCategory').value;
      const priceVal = parseInt(document.getElementById('postPrice').value);
      const materials = document.getElementById('postMaterials').value.trim();
      const dimensions = document.getElementById('postDimensions').value.trim();
      const description = document.getElementById('postDescription').value.trim();

      // Check if custom file uploaded, otherwise assign nice category placeholder
      const image = uploadedImageBase64 || categoryFallbackImages[category] || 'images/hero-living-room.jpg';
      const formattedPrice = `KES ${priceVal.toLocaleString()}`;

      const newListing = {
        id: 'c-' + Date.now(),
        title,
        category,
        price: formattedPrice,
        priceNumeric: priceVal,
        materials,
        dimensions,
        description,
        image,
        location: currentPartner.location,
        maker: currentPartner.businessName,
        makerId: currentPartner.id,
        status: 'pending', // pending, active, sold
        dateAdded: new Date().toLocaleDateString('en-GB')
      };

      // Add to localStorage listings list
      let listings = getAllListings();
      listings.unshift(newListing);
      localStorage.setItem('pata_furniture_items', JSON.stringify(listings));

      // Reload Table
      loadPartnerCatalog();
      closeModal();
      alert('Listing submitted successfully! PataFurniture will review details and publish it.');
    });
  }

  function getAllListings() {
    try {
      return JSON.parse(localStorage.getItem('pata_furniture_items')) || [];
    } catch (e) {
      return [];
    }
  }

  function loadPartnerCatalog() {
    if (!currentPartner) return;

    const allListings = getAllListings();
    // Filter to only show current partner items
    const partnerListings = allListings.filter(item => item.makerId === currentPartner.id);

    // Update Stats Card
    statListingsCount.textContent = partnerListings.length;
    
    // Dynamic counts
    const soldListings = partnerListings.filter(item => item.status === 'sold');
    const revenueVal = soldListings.reduce((sum, item) => sum + (item.priceNumeric || 0), 0);
    
    statRevenue.textContent = revenueVal > 0 ? revenueVal.toLocaleString() : '0';
    statBrokerages.textContent = partnerListings.filter(item => item.status === 'pending').length;
    statViews.textContent = (partnerListings.length * 48) + 120; // Simulated views tracker

    // Clear Catalog Table
    catalogTableBody.innerHTML = '';

    if (partnerListings.length === 0) {
      catalogTableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: var(--space-2xl); opacity: 0.5;">
            No active listings. Click "Post New Furniture" to list your first item.
          </td>
        </tr>
      `;
      return;
    }

    partnerListings.forEach(item => {
      const row = document.createElement('tr');

      // Status pill builder
      let statusClass = 'pending';
      let statusText = 'Reviewing';
      if (item.status === 'active') {
        statusClass = 'active';
        statusText = 'Published';
      } else if (item.status === 'sold') {
        statusClass = 'sold';
        statusText = 'Sold';
      }

      row.innerHTML = `
        <td>
          <div class="product-cell">
            <img src="${item.image}" alt="${item.title}" class="product-img">
            <span class="product-name">${item.title}</span>
          </div>
        </td>
        <td style="text-transform: capitalize;">${item.category}</td>
        <td>${item.materials}</td>
        <td>${item.dimensions}</td>
        <td><strong style="color: var(--color-accent);">${item.price}</strong></td>
        <td><span class="status-pill ${statusClass}">${statusText}</span></td>
        <td>
          <button class="delete-btn" data-id="${item.id}" aria-label="Delete listing" title="Delete listing">&times;</button>
        </td>
      `;

      // Bind delete button
      row.querySelector('.delete-btn').addEventListener('click', () => {
        if (confirm(`Are you sure you want to delete "${item.title}" listing?`)) {
          deleteListing(item.id);
        }
      });

      catalogTableBody.appendChild(row);
    });
  }

  function deleteListing(id) {
    let listings = getAllListings();
    listings = listings.filter(item => item.id !== id);
    localStorage.setItem('pata_furniture_items', JSON.stringify(listings));
    loadPartnerCatalog();
  }
});
