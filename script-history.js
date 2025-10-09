const API_URL = "https://script.google.com/macros/s/AKfycbxGAzJMX4gO5SZfT53JvdOx5ZEkrxKUZ1ADnysf7Q7iPCXXvJBu9Q4CpKywhBLJNJOx4A/exec"; // <-- PASTE YOUR URL HERE

const loggedInUser = sessionStorage.getItem('stockUser');
if (!loggedInUser) window.location.href = 'index.html';

let productList = []; // Store products globally

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

function populateProductFilter(products) {
  productList = products; 
  const dataList = document.getElementById('productList');
  dataList.innerHTML = ''; 

  // Add an "All" option to the input field's placeholder or logic
  document.getElementById('productSearch').placeholder = 'พิมพ์เพื่อค้นหา หรือเว้นว่างเพื่อดูทั้งหมด';

  products.forEach(product => {
    const option = document.createElement('option');
    option.value = `${product.id} - ${product.name}`;
    dataList.appendChild(option);
  });
}

document.getElementById('filterForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const tableBody = document.getElementById('tableBody');
  const loading = document.getElementById('loading');
  const noResults = document.getElementById('noResults');
  const resultsCard = document.getElementById('resultsCard');

  resultsCard.style.display = 'block';
  loading.style.display = 'block';
  noResults.style.display = 'none';
  tableBody.innerHTML = '';

  const productSearchValue = document.getElementById('productSearch').value;
  const selectedProduct = productList.find(p => `${p.id} - ${p.name}` === productSearchValue);
  
  const filters = {
    productId: selectedProduct ? selectedProduct.id : null,
    startDate: document.getElementById('startDate').value,
    endDate: document.getElementById('endDate').value
  };
  
  if (!productSearchValue) {
    filters.productId = 'all';
  }

  try {
    const historyData = await callApi('getTransactionHistory', filters);
    
    if (historyData.length === 0) {
      noResults.style.display = 'block';
    } else {
      historyData.forEach(row => {
        const tr = document.createElement('tr');
        const timestamp = new Date(row[0]).toLocaleString('th-TH');
        
        // ** THE FIX IS HERE: Correctly map all 10 columns **
        // ExpDate is at index 4, Type is at index 5, etc.
        const expDate = row[4] ? new Date(row[4]).toLocaleDateString('th-TH') : 'N/A';

        tr.innerHTML = `
          <td>${timestamp}</td>
          <td>${row[1]}</td>
          <td>${row[2]}</td>
          <td>${row[3]}</td>
          <td>${expDate}</td>
          <td>${row[5]}</td>
          <td>${row[6]}</td>
          <td>${row[7]}</td>
          <td>${row[8]}</td>
          <td>${row[9] || ''}</td>
        `;
        tableBody.appendChild(tr);
      });
    }
  } catch (error) {
    console.error('Failed to get history:', error);
    noResults.textContent = 'เกิดข้อผิดพลาดในการค้นหา';
    noResults.style.display = 'block';
  } finally {
    loading.style.display = 'none';
  }
});

window.addEventListener('load', async () => {
  try {
    const products = await callApi('getProducts');
    populateProductFilter(products);
  } catch (error) {
    console.error('Failed to load products for filter:', error);
    alert('ไม่สามารถโหลดรายการสินค้าสำหรับค้นหาได้');
  }
});
