const API_URL = "https://script.google.com/macros/s/AKfycbyzX4FgBqzzgtUJrM57xfJbmMRw-dIVj9sQONHmbDNWYv8DefzzjKa4pckxWxnWY_0xHA/exec"; // <-- PASTE YOUR URL HERE

const loggedInUser = sessionStorage.getItem('stockUser');
if (!loggedInUser) window.location.href = 'index.html';

let productList = [];
let stockSummary = []; // Cache for stock data

async function callApi(action, payload = {}) { /* ... same as before ... */ }
function populateProducts(products) { /* ... same as before ... */ }
document.getElementById('stockForm').addEventListener('submit', async (e) => { /* ... same as before ... */ });

// --- NEW AND UPDATED EVENT LISTENERS ---

// When product or lot is changed, try to find the EXP date
async function findExpDate() {
  const selectedProduct = productList.find(p => `${p.id} - ${p.name}` === document.getElementById('productSearch').value);
  const lotValue = document.getElementById('lot').value;
  const typeValue = document.querySelector('input[name="type"]:checked').value;
  const expDateInput = document.getElementById('expDate');

  if (typeValue === 'ตัดออก' && selectedProduct && lotValue) {
    // Find the soonest expiring item from the cached stock summary
    const matchingLots = stockSummary
      .filter(row => row[0] === selectedProduct.id && row[2] === lotValue)
      .sort((a, b) => {
        const timeA = a[3] instanceof Date ? a[3].getTime() : Infinity;
        const timeB = b[3] instanceof Date ? b[3].getTime() : Infinity;
        return timeA - timeB;
      });

    if (matchingLots.length > 0) {
      const targetExpDate = matchingLots[0][3]; // Get the date from the first (soonest) result
      if (targetExpDate instanceof Date) {
        // Format date to YYYY-MM-DD for the input field
        expDateInput.value = targetExpDate.toISOString().split('T')[0];
      } else {
        expDateInput.value = ''; // If no EXP date (N/A), clear the field
      }
    }
  }
}

document.getElementById('productSearch').addEventListener('input', function(e) {
  // ... (same as before) ...
  findExpDate();
});

document.getElementById('lot').addEventListener('input', findExpDate);

// Also check when user switches to "ตัดออก"
document.querySelectorAll('input[name="type"]').forEach(radio => {
  radio.addEventListener('change', findExpDate);
});


window.addEventListener('load', async () => {
  try {
    // Fetch both products and stock summary on load
    const [products, summary] = await Promise.all([
      callApi('getProducts'),
      callApi('getStockSummaryData')
    ]);
    stockSummary = summary; // Cache the summary data
    populateProducts(products);
  } catch (error) {
    console.error('Failed to load initial data:', error);
    alert('ไม่สามารถโหลดข้อมูลเริ่มต้นได้');
  }
});
