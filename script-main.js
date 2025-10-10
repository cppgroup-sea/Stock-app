const API_URL = "https://script.google.com/macros/s/AKfycbyzX4FgBqzzgtUJrM57xfJbmMRw-dIVj9sQONHmbDNWYv8DefzzjKa4pckxWxnWY_0xHA/exec"; // <-- PASTE YOUR URL HERE

const loggedInUser = sessionStorage.getItem('stockUser');
if (!loggedInUser) window.location.href = 'index.html';

let productList = [];
let stockSummary = []; 

async function callApi(action, payload = {}) {
  const response = await fetch(API_URL, {
      method: 'POST',
      headers: {'Content-Type': 'text/plain;charset=utf-8'},
      body: JSON.stringify({ action, payload, user: loggedInUser })
  });
  const result = await response.json();
  if (result.status === 'error') throw new Error(result.message);
  return result.data;
}

function populateProducts(products) {
  productList = products; 
  const dataList = document.getElementById('productList');
  dataList.innerHTML = ''; 

  products.forEach(product => {
    const option = document.createElement('option');
    option.value = `${product.id} - ${product.name}`;
    dataList.appendChild(option);
  });
}

function findExpDate() {
  console.log("findExpDate function called."); // DEBUG
  const selectedProduct = productList.find(p => `${p.id} - ${p.name}` === document.getElementById('productSearch').value);
  const lotValue = document.getElementById('lot').value;
  const typeValue = document.querySelector('input[name="type"]:checked').value;
  
  console.log("Selected Product:", selectedProduct); // DEBUG
  console.log("Lot Value:", lotValue); // DEBUG
  console.log("Type:", typeValue); // DEBUG
  console.log("Cached Stock Summary:", stockSummary); // DEBUG

  if (typeValue === 'ตัดออก' && selectedProduct && lotValue && stockSummary.length > 0) {
    const matchingLots = stockSummary
      .filter(row => row[0] === selectedProduct.id && row[2] === lotValue);

    console.log("Matching Lots Found:", matchingLots); // DEBUG

    if (matchingLots.length > 0) {
      // Sort to find the one expiring soonest
      matchingLots.sort((a, b) => {
        const timeA = (a[3] && !isNaN(new Date(a[3]).getTime())) ? new Date(a[3]).getTime() : Infinity;
        const timeB = (b[3] && !isNaN(new Date(b[3]).getTime())) ? new Date(b[3]).getTime() : Infinity;
        return timeA - timeB;
      });
      
      const targetExpDate = matchingLots[0][3];
      console.log("Target Expiry Date Found:", targetExpDate); // DEBUG
      
      const expDateInput = document.getElementById('expDate');
      if (targetExpDate) {
        try {
          const dateObj = new Date(targetExpDate);
          expDateInput.value = dateObj.toISOString().split('T')[0];
        } catch (e) {
          expDateInput.value = '';
        }
      } else {
        expDateInput.value = '';
      }
    }
  }
}

document.getElementById('productSearch').addEventListener('input', function(e) { /* ... same as before ... */ });
document.getElementById('lot').addEventListener('input', findExpDate);
document.querySelectorAll('input[name="type"]').forEach(radio => { /* ... same as before ... */ });
document.getElementById('stockForm').addEventListener('submit', async (e) => { /* ... same as before ... */ });

window.addEventListener('load', async () => {
  try {
    const [products, summary] = await Promise.all([
      callApi('getProducts'),
      callApi('getStockSummaryData')
    ]);
    productList = products;
    stockSummary = summary;
    populateProducts(products);
    console.log("Initial data loaded successfully."); // DEBUG
    console.log("Initial Stock Summary:", stockSummary); // DEBUG
  } catch (error) {
    console.error('Failed to load initial data:', error);
    alert('ไม่สามารถโหลดข้อมูลเริ่มต้นได้');
  }
});
