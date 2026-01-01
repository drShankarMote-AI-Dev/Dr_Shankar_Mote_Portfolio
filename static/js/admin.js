document.addEventListener('DOMContentLoaded', function () {
    // --- Cache Refresh ---
    const links = document.querySelectorAll('link[rel="stylesheet"]');
    links.forEach(link => {
        if (link.href.indexOf('?') === -1) {
            link.href += '?v=' + Date.now();
        }
    });

    // --- Flash Messages Auto-hide ---
    const alerts = document.querySelectorAll('.flash-messages-container .alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            alert.classList.add('hide');
            alert.addEventListener('transitionend', () => alert.remove());
        }, 5000); // 5 seconds
    });

    // --- Sidebar Active State ---
    const currentPath = window.location.pathname + window.location.search;
    const sidebarLinks = document.querySelectorAll('.admin-sidebar a');
    sidebarLinks.forEach(link => {
        if (link.href === currentPath) {
            link.classList.add('active');
        }
    });

    // --- Drawer Logic ---
    const drawerToggle = document.getElementById('drawer-toggle');
    const drawer = document.getElementById('drawer');
    const drawerOverlay = document.getElementById('drawer-overlay');
    const drawerClose = document.getElementById('drawer-close');

    function adjustMainContentPadding() {
        const adminHeader = document.querySelector('.admin-header');
        const mainContent = document.getElementById('main-content');
        if (adminHeader && mainContent) {
            mainContent.style.paddingTop = adminHeader.offsetHeight + 30 + 'px';
        }
    }

    adjustMainContentPadding();
    window.addEventListener('resize', adjustMainContentPadding);

    if (drawerToggle) {
        drawerToggle.addEventListener('click', function () {
            drawer.classList.add('active');
            drawerOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            drawer.querySelector('a').focus();
        });
    }

    function closeDrawer() {
        if (drawer) drawer.classList.remove('active');
        if (drawerOverlay) drawerOverlay.classList.remove('active');
        document.body.style.overflow = '';
        if (drawerToggle) drawerToggle.focus();
    }

    if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
    if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

    document.addEventListener('keydown', function (e) {
        if (drawer && drawer.classList.contains('active') && (e.key === 'Escape' || e.key === 'Esc')) {
            closeDrawer();
        }
    });

    // --- Profile Picture Validation ---
    const profileForm = document.getElementById('profilePicForm');
    const profileInput = document.getElementById('profile_pic');
    const profileError = document.getElementById('profilePicError');
    if (profileForm && profileInput) {
        profileForm.addEventListener('submit', function (e) {
            if (profileError) profileError.style.display = 'none';
            const file = profileInput.files[0];
            if (file) {
                const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
                if (!allowedTypes.includes(file.type)) {
                    if (profileError) {
                        profileError.textContent = 'Only JPG, PNG, or GIF images are allowed.';
                        profileError.style.display = 'block';
                    }
                    e.preventDefault();
                    return false;
                }
                if (file.size > 2 * 1024 * 1024) { // 2MB
                    if (profileError) {
                        profileError.textContent = 'File size must be less than 2MB.';
                        profileError.style.display = 'block';
                    }
                    e.preventDefault();
                    return false;
                }
            }
        });
    }

    // --- Drag-and-Drop for Skills ---
    setupDragAndDrop('skills-table', 'saveSkillsOrderBtn', 'reorder_skills');

    // --- Drag-and-Drop for Projects ---
    setupDragAndDrop('projects-table', 'saveProjectsOrderBtn', 'reorder_projects');
});

// --- Helper for Drag and Drop ---
function setupDragAndDrop(tableId, saveBtnId, actionName) {
    const table = document.getElementById(tableId);
    const saveBtn = document.getElementById(saveBtnId);
    let dragSrcRow = null;

    if (table) {
        table.addEventListener('dragstart', function (e) {
            dragSrcRow = e.target.closest('tr');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', dragSrcRow.outerHTML);
            dragSrcRow.classList.add('dragging');
        });

        table.addEventListener('dragover', function (e) {
            e.preventDefault();
            const targetRow = e.target.closest('tr');
            if (targetRow && targetRow !== dragSrcRow) {
                const tbody = table.querySelector('tbody');
                const rows = Array.from(tbody.children);
                const dragIndex = rows.indexOf(dragSrcRow);
                const targetIndex = rows.indexOf(targetRow);
                if (dragIndex < targetIndex) {
                    tbody.insertBefore(dragSrcRow, targetRow.nextSibling);
                } else {
                    tbody.insertBefore(dragSrcRow, targetRow);
                }
                if (saveBtn) saveBtn.style.display = 'inline-block';
            }
        });

        table.addEventListener('dragend', function (e) {
            if (dragSrcRow) dragSrcRow.classList.remove('dragging');
        });
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', function () {
            const rows = table.querySelectorAll('tbody tr');
            const newOrder = Array.from(rows).map(row => row.getAttribute('data-id'));

            // Get CSRF token from meta tag or input
            let csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            if (!csrfToken) {
                csrfToken = document.querySelector('input[name="csrf_token"]')?.value;
            }

            // Get current URL for POST request
            const currentUrl = window.location.href;

            fetch(currentUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify({ action: actionName, order: newOrder })
            }).then(res => res.json()).then(data => {
                if (data.success) {
                    saveBtn.style.display = 'none';
                    location.reload();
                } else {
                    alert('Failed to save order.');
                }
            }).catch(err => {
                console.error('Error:', err);
                alert('An error occurred while saving.');
            });
        });
    }
}

// --- Modal Functions (Global Scope) ---
function showDuplicateModal(portfolioId, portfolioName) {
    const modal = document.getElementById('duplicateModal');
    if (modal) {
        document.getElementById('duplicatePortfolioId').value = portfolioId;
        document.getElementById('newName').value = portfolioName + ' (Copy)';
        modal.style.display = 'block';
    }
}

function closeDuplicateModal() {
    const modal = document.getElementById('duplicateModal');
    if (modal) modal.style.display = 'none';
}

function showConfirmModal({ action, id, buttonIndex, category }) {
    const modal = document.getElementById('confirmModal');
    if (modal) {
        document.getElementById('confirmDeleteAction').value = action;
        document.getElementById('confirmDeleteId').value = id || '';
        document.getElementById('confirmDeleteButtonIndex').value = buttonIndex || '';
        document.getElementById('confirmDeleteCategory').value = category || '';
        modal.style.display = 'block';
        modal.focus();
        trapFocus(modal);
    }
}

function closeConfirmModal() {
    const modal = document.getElementById('confirmModal');
    if (modal) {
        modal.style.display = 'none';
        releaseFocus();
    }
}

// --- Focus Trap ---
let lastFocusedElement;
function trapFocus(modal) {
    lastFocusedElement = document.activeElement;
    const focusableEls = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusableEls.length === 0) return;

    const firstFocusableEl = focusableEls[0];
    const lastFocusableEl = focusableEls[focusableEls.length - 1];

    modal.addEventListener('keydown', function (e) {
        if (e.key === 'Tab') {
            if (e.shiftKey) { // shift + tab
                if (document.activeElement === firstFocusableEl) {
                    e.preventDefault();
                    lastFocusableEl.focus();
                }
            } else { // tab
                if (document.activeElement === lastFocusableEl) {
                    e.preventDefault();
                    firstFocusableEl.focus();
                }
            }
        } else if (e.key === 'Escape') {
            closeConfirmModal();
            closeDuplicateModal();
        }
    });
    setTimeout(() => firstFocusableEl.focus(), 100);
}

function releaseFocus() {
    if (lastFocusedElement) lastFocusedElement.focus();
}

// Close modals when clicking outside
window.onclick = function (event) {
    const dupModal = document.getElementById('duplicateModal');
    const confModal = document.getElementById('confirmModal');
    if (event.target === dupModal) closeDuplicateModal();
    if (event.target === confModal) closeConfirmModal();
}
