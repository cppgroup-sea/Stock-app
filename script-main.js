const API_URL = "https://script.google.com/macros/s/AKfycbwl6h0gb6Qv3vFcCwZoKYJCdA5is-dlq94hL9zEHJzzD2sOnWqLMNTdC51oExgAJft0rg/exec"; // <-- PASTE YOUR URL HERE

const loggedInUser = sessionStorage.getItem('stockUser');
if (!loggedInUser) window.location.href = 'index.html';

let productList = [];
let stockSummary = []; // Cache for stock data

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

// Function to find EXP date automatically
function findExpDate() {
  const selectedProduct = productList.find(p => `${p.id} - ${p.name}` === document.getElementById('productSearch').value);
  const lotValue = document.getElementById('lot').value;
  const typeValue = document.querySelector('input[name="type"]:checked').value;
  const expDateInput = document.getElementById('expDate');

  if (typeValue === 'ตัดออก' && selectedProduct && lotValue && stockSummary.length > 0) {
    const matchingLots = stockSummary
      .filter(row => row[0] === selectedProduct.id && row[2] === lotValue)
      .sort((a, b) => {
        const timeA = (a[3] && !isNaN(new Date(a[3]).getTime())) ? new Date(a[3]).getTime() : Infinity;
        const timeB = (b[3] && !isNaN(new Date(b[3]).getTime())) ? new Date(b[3]).getTime() : Infinity;
        return timeA - timeB;
      });

    if (matchingLots.length > 0) {
      const targetExpDate = matchingLots[0][3];
      if (targetExpDate) {
        try {
          const dateObj = new Date(targetExpDate);
          // Format date to YYYY-MM-DD for the input[type=date] field
          expDateInput.value = dateObj.toISOString().split('T')[0];
        } catch (e) {
          expDateInput.value = ''; // Clear if date is invalid
        }
      } else {
        expDateInput.value = ''; // Clear if the found lot has no EXP date (N/A)
      }
    }
  } else if (typeValue === 'รับเข้า') {
      // Clear the date field when switching back to "Receive"
      expDateInput.value = '';
  }
}

document.getElementById('productSearch').addEventListener('input', function(e) {
  const inputValue = e.target.value;
  const productIDInput = document.getElementById('productID');
  const unitInput = document.getElementById('unit');
  const selectedProduct = productList.find(p => `${p.id} - ${p.name}` === inputValue);

  if (selectedProduct) {
    productIDInput.value = selectedProduct.id;
    unitInput.value = selectedProduct.unit;
  } else {
    productIDInput.value = '';
    unitInput.value = '';
  }
  findExpDate();
});

document.getElementById('lot').addEventListener('input', findExpDate);

document.querySelectorAll('input[name="type"]').forEach(radio => {
  radio.addEventListener('change', findExpDate);
});

document.getElementById('stockForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const submitButton = document.getElementById('submitButton');
  submitButton.setAttribute('aria-busy', 'true');
  
  const formData = {
    productName: document.getElementById('productSearch').value,
    productID: document.getElementById('productID').value,
    lot: document.getElementById('lot').value,
    expDate: document.getElementById('expDate').value,
    quantity: document.getElementById('quantity').value,
    unit: document.getElementById('unit').value,
    type: document.querySelector('input[name="type"]:checked').value,
    remarks: document.getElementById('remarks').value
  };

  if (!formData.productID) {
      alert("กรุณาเลือกรายการสินค้าที่ถูกต้องจากรายการ");
      submitButton.removeAttribute('aria-busy');
      return;
  }
  
  try {
    const result = await callApi('recordTransaction', formData);
    alert(result.message);
    document.getElementById('stockForm').reset();
    // Refresh summary data cache after a transaction
    stockSummary = await callApi('getStockSummaryData'); 
  } catch (error) {
    alert('เกิดข้อผิดพลาด: ' + error.message);
  } finally {
    submitButton.removeAttribute('aria-busy');
  }
});

window.addEventListener('load', async () => {
  try {
    // Fetch both products and stock summary on page load
    const [products, summary] = await Promise.all([
      callApi('getProducts'),
      callApi('getStockSummaryData')
    ]);
    productList = products;
    stockSummary = summary; // Cache the summary data
    populateProducts(products);
  } catch (error) {
    console.error('Failed to load initial data:', error);
    alert('ไม่สามารถโหลดข้อมูลเริ่มต้นได้');
  }
});
