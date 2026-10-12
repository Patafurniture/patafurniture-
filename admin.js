/**
 * PataFurniture - Broker Admin Operations script
 * Handles admin auth, listing approval/rejection, partner directory, and client lead management.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Global States
  let isAdminLoggedIn = false;

  // DOM Elements - Auth Section
  const adminAuthSection = document.getElementById('adminAuthSection');
  const adminLoginForm = document.getElementById('adminLoginForm');
  const adminLogoutBtn = document.getElementById('adminLogoutBtn');

  // DOM Elements - Dashboard Section
  const adminDashboardSection = document.getElementById('adminDashboardSection');
  const resetDemoDataBtn = document.getElementById('resetDemoDataBtn');

  // DOM Elements - Stats
  const adminStatPartners = document.getElementById('adminStatPartners');
  const adminStatPending = document.getElementById('adminStatPending');
  const adminStatActive = document.getElementById('adminStatActive');
  const adminStatMessages = document.getElementById('adminStatMessages');
  const adminStatRevenue = document.getElementById('adminStatRevenue');
  const badgePendingCount = document.getElementById('badgePendingCount');

  // DOM Elements - Tables
  const approvalsTableBody = document.getElementById('approvalsTableBody');
  const catalogTableBody = document.getElementById('catalogTableBody');
  const partnersTableBody = document.getElementById('partnersTableBody');
  const enquiriesTableBody = document.getElementById('enquiriesTableBody');

  // DOM Elements - Enquiry Modal
  const enquiryModal = document.getElementById('enquiryModal');
  const closeEnquiryModal = document.getElementById('closeEnquiryModal');
  const modalClientName = document.getElementById('modalClientName');
  const modalClientMeta = document.getElementById('modalClientMeta');
  const modalClientEmail = document.getElementById('modalClientEmail');
  const modalClientPhone = document.getElementById('modalClientPhone');
  const modalClientDate = document.getElementById('modalClientDate');
  const modalClientMessage = document.getElementById('modalClientMessage');
  const modalWhatsAppBtn = document.getElementById('modalWhatsAppBtn');

  // Ensure default demo data is populated
  seedAdminDemoData();

  // Check login state on load
  checkAdminLoginState();

  // ===== AUTHENTICATION =====
  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('adminEmail').value.trim().toLowerCase();
      const password = document.getElementById('adminPassword').value;

      if (email === 'admin@patafurniture.com' && password === 'adminpassword123') {
        localStorage.setItem('pata_admin_session', JSON.stringify({ email, role: 'broker_admin', loggedInAt: Date.now() }));
        checkAdminLoginState();
      } else {
        alert('❌ Invalid Broker Admin credentials. Please use admin@patafurniture.com / adminpassword123');
      }
    });
  }

  if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('pata_admin_session');
      checkAdminLoginState();
    });
  }

  function checkAdminLoginState() {
    try {
      const session = JSON.parse(localStorage.getItem('pata_admin_session'));
      isAdminLoggedIn = !!session;
    } catch (e) {
      isAdminLoggedIn = false;
    }

    if (isAdminLoggedIn) {
      adminAuthSection.style.display = 'none';
      adminDashboardSection.style.display = 'block';
      adminLogoutBtn.style.display = 'block';
      refreshAdminDashboard();
    } else {
      adminAuthSection.style.display = 'flex';
      adminDashboardSection.style.display = 'none';
      adminLogoutBtn.style.display = 'none';
    }
  }

  // ===== TAB SWITCHING =====
  const tabBtns = document.querySelectorAll('.admin-tab-btn');
  const tabContents = document.querySelectorAll('.admin-tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTabId = btn.getAttribute('data-tab');

      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const targetContent = document.getElementById(targetTabId);
      if (targetContent) targetContent.classList.add('active');
    });
  });

  // ===== DASHBOARD REFRESH =====
  function refreshAdminDashboard() {
    const listings = getListings();
    const partners = getPartners();
    const enquiries = getEnquiries();

    // Stats calculations
    const pendingListings = listings.filter(item => item.status === 'pending');
    const activeListings = listings.filter(item => item.status === 'active');
    const soldListings = listings.filter(item => item.status === 'sold');
    const revenueVal = soldListings.reduce((sum, item) => sum + (item.priceNumeric || 0), 0);

    adminStatPartners.textContent = partners.length;
    adminStatPending.textContent = pendingListings.length;
    adminStatActive.textContent = activeListings.length;
    adminStatMessages.textContent = enquiries.length;
    adminStatRevenue.textContent = 'KES ' + (revenueVal > 0 ? revenueVal.toLocaleString() : '0');
    badgePendingCount.textContent = pendingListings.length;

    renderApprovalsTable(pendingListings);
    renderCatalogTable(listings);
    renderPartnersTable(partners);
    renderEnquiriesTable(enquiries);
  }

  // ===== RENDER TAB 1: APPROVALS QUEUE =====
  function renderApprovalsTable(pendingListings) {
    approvalsTableBody.innerHTML = '';

    if (pendingListings.length === 0) {
      approvalsTableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: var(--space-3xl); opacity: 0.6;">
            ✅ All caught up! No pending furniture listings requiring review.
          </td>
        </tr>
      `;
      return;
    }

    pendingListings.forEach(item => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>
          <div class="product-cell">
            <img src="${item.image}" alt="${item.title}" class="product-img">
            <div>
              <span class="product-name">${item.title}</span><br>
              <span style="font-size: 11px; opacity: 0.6;">${item.materials || ''}</span>
            </div>
          </div>
        </td>
        <td><strong>${item.maker || 'Artisan Partner'}</strong></td>
        <td style="text-transform: capitalize;">${item.category}</td>
        <td><strong style="color: var(--color-accent);">${item.price}</strong></td>
        <td>${item.location || 'Nairobi'}</td>
        <td>
          <div class="btn-action-group">
            <button class="btn-sm-action btn-approve" data-id="${item.id}">Approve (Publish)</button>
            <button class="btn-sm-action btn-reject" data-id="${item.id}">Reject</button>
          </div>
        </td>
      `;

      // Event listeners
      row.querySelector('.btn-approve').addEventListener('click', () => {
        updateListingStatus(item.id, 'active');
      });
      row.querySelector('.btn-reject').addEventListener('click', () => {
        if (confirm(`Reject and remove "${item.title}" submission?`)) {
          deleteListing(item.id);
        }
      });

      approvalsTableBody.appendChild(row);
    });
  }

  // ===== RENDER TAB 2: ALL CATALOG =====
  function renderCatalogTable(listings) {
    catalogTableBody.innerHTML = '';

    if (listings.length === 0) {
      catalogTableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: var(--space-2xl); opacity: 0.5;">
            No listings found in catalog.
          </td>
        </tr>
      `;
      return;
    }

    listings.forEach(item => {
      const row = document.createElement('tr');

      let badgeClass = 'badge-pending';
      let statusLabel = 'Reviewing';
      if (item.status === 'active') {
        badgeClass = 'badge-active';
        statusLabel = 'Live / Published';
      } else if (item.status === 'sold') {
        badgeClass = 'badge-sold';
        statusLabel = 'Sold';
      }

      row.innerHTML = `
        <td>
          <div class="product-cell">
            <img src="${item.image}" alt="${item.title}" class="product-img">
            <span class="product-name">${item.title}</span>
          </div>
        </td>
        <td style="text-transform: capitalize;">${item.category}</td>
        <td>${item.maker || 'Artisan Partner'}</td>
        <td><strong style="color: var(--color-accent);">${item.price}</strong></td>
        <td><span class="badge-status ${badgeClass}">${statusLabel}</span></td>
        <td>
          <div class="btn-action-group">
            ${item.status !== 'active' ? `<button class="btn-sm-action btn-approve" data-id="${item.id}" title="Publish to Main Website">Publish</button>` : ''}
            ${item.status !== 'sold' ? `<button class="btn-sm-action btn-sold" data-id="${item.id}" title="Mark as Sold">Mark Sold</button>` : ''}
            <button class="btn-sm-action btn-reject" data-id="${item.id}" title="Delete Listing">Delete</button>
          </div>
        </td>
      `;

      // Action Handlers
      const publishBtn = row.querySelector('.btn-approve');
      if (publishBtn) {
        publishBtn.addEventListener('click', () => updateListingStatus(item.id, 'active'));
      }

      const soldBtn = row.querySelector('.btn-sold');
      if (soldBtn) {
        soldBtn.addEventListener('click', () => updateListingStatus(item.id, 'sold'));
      }

      const deleteBtn = row.querySelector('.btn-reject');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
          if (confirm(`Delete "${item.title}" from catalog?`)) {
            deleteListing(item.id);
          }
        });
      }

      catalogTableBody.appendChild(row);
    });
  }

  // ===== RENDER TAB 3: PARTNERS DIRECTORY =====
  function renderPartnersTable(partners) {
    partnersTableBody.innerHTML = '';

    if (partners.length === 0) {
      partnersTableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: var(--space-2xl); opacity: 0.5;">
            No registered partners found.
          </td>
        </tr>
      `;
      return;
    }

    partners.forEach(partner => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>
          <strong style="color: var(--color-white);">${partner.businessName}</strong><br>
          <span style="font-size: 11px; opacity: 0.7;">${partner.businessType}</span>
        </td>
        <td>${partner.ownerName}</td>
        <td>
          <a href="mailto:${partner.email}" style="color: var(--color-accent);">${partner.email}</a><br>
          <span style="font-size: 12px;">📞 ${partner.phone}</span>
        </td>
        <td>${partner.location}<br><span style="font-size: 11px; opacity: 0.6;">${partner.address || ''}</span></td>
        <td>
          <code>${partner.kraPin || 'N/A'}</code><br>
          <span style="font-size: 11px; opacity: 0.7;">${partner.businessRegNo || 'N/A'}</span>
        </td>
        <td>
          <span class="badge-status badge-active">Active</span><br>
          <span style="font-size: 10px; opacity: 0.6;">Next: ${partner.nextBillingDate || 'Active'}</span>
        </td>
      `;
      partnersTableBody.appendChild(row);
    });
  }

  // ===== RENDER TAB 4: CLIENT ENQUIRIES =====
  function renderEnquiriesTable(enquiries) {
    enquiriesTableBody.innerHTML = '';

    if (enquiries.length === 0) {
      enquiriesTableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: var(--space-2xl); opacity: 0.5;">
            No client enquiries submitted yet.
          </td>
        </tr>
      `;
      return;
    }

    enquiries.forEach(sub => {
      const row = document.createElement('tr');
      const snippet = sub.message && sub.message.length > 50 ? sub.message.substring(0, 50) + '...' : (sub.message || 'No description');

      row.innerHTML = `
        <td style="font-size: 12px; white-space: nowrap;">${sub.date || 'Recent'}</td>
        <td><strong>${sub.firstName} ${sub.lastName}</strong></td>
        <td>
          <a href="tel:${sub.phone}" style="color: var(--color-accent); font-size: 12px;">📞 ${sub.phone}</a><br>
          <span style="font-size: 11px; opacity: 0.7;">${sub.email}</span>
        </td>
        <td style="text-transform: capitalize;"><span class="badge-status badge-pending">${sub.service || 'Full Service'}</span></td>
        <td style="font-size: 12px; opacity: 0.85;">${snippet}</td>
        <td>
          <div class="btn-action-group">
            <button class="btn-sm-action btn-sold view-enquiry-btn">Read Full</button>
            <button class="btn-sm-action btn-reject delete-enquiry-btn">&times;</button>
          </div>
        </td>
      `;

      row.querySelector('.view-enquiry-btn').addEventListener('click', () => openEnquiryModal(sub));
      row.querySelector('.delete-enquiry-btn').addEventListener('click', () => {
        if (confirm(`Remove enquiry from ${sub.firstName} ${sub.lastName}?`)) {
          deleteEnquiry(sub.id);
        }
      });

      enquiriesTableBody.appendChild(row);
    });
  }

  // ===== MODAL ACTIONS =====
  function openEnquiryModal(sub) {
    modalClientName.textContent = `${sub.firstName} ${sub.lastName}`;
    modalClientMeta.textContent = `Service: ${sub.service || 'General Brokerage'}`;
    modalClientEmail.textContent = sub.email;
    modalClientPhone.textContent = sub.phone;
    modalClientDate.textContent = sub.date || 'Recent';
    modalClientMessage.textContent = sub.message || 'No additional message provided.';

    const replyText = encodeURIComponent(`Hi ${sub.firstName}, this is PataFurniture Brokerage following up on your request regarding "${sub.service}". How can we assist you with your space?`);
    modalWhatsAppBtn.href = `https://wa.me/${sub.phone.replace(/[^0-9]/g, '')}?text=${replyText}`;

    enquiryModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeEnquiryModalFn() {
    enquiryModal.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (closeEnquiryModal) closeEnquiryModal.addEventListener('click', closeEnquiryModalFn);
  if (enquiryModal) {
    enquiryModal.addEventListener('click', (e) => {
      if (e.target === enquiryModal) closeEnquiryModalFn();
    });
  }

  // ===== LISTING & ENQUIRY CRUD HELPERS =====
  function updateListingStatus(id, newStatus) {
    let listings = getListings();
    listings = listings.map(item => {
      if (item.id === id) {
        return { ...item, status: newStatus };
      }
      return item;
    });
    localStorage.setItem('pata_furniture_items', JSON.stringify(listings));
    refreshAdminDashboard();
  }

  function deleteListing(id) {
    let listings = getListings();
    listings = listings.filter(item => item.id !== id);
    localStorage.setItem('pata_furniture_items', JSON.stringify(listings));
    refreshAdminDashboard();
  }

  function deleteEnquiry(id) {
    let enquiries = getEnquiries();
    enquiries = enquiries.filter(sub => sub.id !== id);
    localStorage.setItem('pata_contact_submissions', JSON.stringify(enquiries));
    refreshAdminDashboard();
  }

  function getListings() {
    try {
      return JSON.parse(localStorage.getItem('pata_furniture_items')) || [];
    } catch (e) {
      return [];
    }
  }

  function getPartners() {
    try {
      return JSON.parse(localStorage.getItem('pata_partners')) || [];
    } catch (e) {
      return [];
    }
  }

  function getEnquiries() {
    try {
      return JSON.parse(localStorage.getItem('pata_contact_submissions')) || [];
    } catch (e) {
      return [];
    }
  }

  // ===== RESET DEMO DATA ACTION =====
  if (resetDemoDataBtn) {
    resetDemoDataBtn.addEventListener('click', () => {
      if (confirm('Reset demo partners, catalog listings, and enquiries to default sample data?')) {
        localStorage.removeItem('pata_partners');
        localStorage.removeItem('pata_furniture_items');
        localStorage.removeItem('pata_contact_submissions');
        seedAdminDemoData();
        refreshAdminDashboard();
        alert('✅ Demo data has been restored to default state.');
      }
    });
  }

  // ===== SEED INITIAL DATA =====
  function seedAdminDemoData() {
    // Seed default partner
    let partners = getPartners();
    if (partners.length === 0) {
      partners = [
        {
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
        },
        {
          id: 'p-default-2',
          businessName: 'Coastline Teak & Joinery',
          ownerName: 'Hassan Omar',
          email: 'hassan@coastlineteak.co.ke',
          phone: '0722998877',
          businessType: 'Individual Carpenter / Artisan',
          location: 'Mombasa',
          kraPin: 'A004455667X',
          businessRegNo: 'CPR/2026/04912',
          address: 'Nyali Workshop Row, Mombasa',
          password: 'password123',
          subscriptionPaid: true,
          nextBillingDate: '28/09/2026'
        }
      ];
      localStorage.setItem('pata_partners', JSON.stringify(partners));
    }

    // Seed default items
    let listings = getListings();
    if (listings.length === 0) {
      listings = [
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
        },
        {
          id: 'c-default-4',
          title: 'Coastal Swahili Carved Daybed',
          category: 'living',
          price: 'KES 98,000',
          priceNumeric: 98000,
          materials: 'Mvule Hardwood, Brass Accents',
          dimensions: '2.1m x 1.0m',
          description: 'Traditional handcrafted Lamu-style daybed with brass floral studs and high-density foam mattress.',
          image: 'images/hero-living-room.jpg',
          location: 'Mombasa',
          maker: 'Coastline Teak & Joinery',
          makerId: 'p-default-2',
          status: 'pending',
          dateAdded: new Date().toLocaleDateString('en-GB')
        }
      ];
      localStorage.setItem('pata_furniture_items', JSON.stringify(listings));
    }

    // Seed default contact submissions
    let enquiries = getEnquiries();
    if (enquiries.length === 0) {
      enquiries = [
        {
          id: 'sub-1',
          firstName: 'Mercy',
          lastName: 'Wambui',
          email: 'mercy.wambui@gmail.com',
          phone: '+254711223344',
          service: 'full',
          message: 'Looking to furnish a 3-bedroom apartment in Lavington. Need living room and master bedroom sets by next month.',
          date: '14/08/2026 14:30'
        },
        {
          id: 'sub-2',
          firstName: 'Brian',
          lastName: 'Otieno',
          email: 'brian.otieno@techcorp.co.ke',
          phone: '+254799887766',
          service: 'sourcing',
          message: 'Searching for 4 executive ergonomic wood and leather desks for our new startup office in Westlands.',
          date: '15/08/2026 09:15'
        }
      ];
      localStorage.setItem('pata_contact_submissions', JSON.stringify(enquiries));
    }
  }
});
