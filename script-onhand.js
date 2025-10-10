const API_URL = "https://script.google.com/macros/s/AKfycbz57qMCQRvQ7cvbkW4OiGFcCTP1lhJXxu0H_v8gadyycRnKoeRfN121CiVWHO5OMw5TPA/exec"; // <-- PASTE YOUR URL HERE

const loggedInUser = sessionStorage.getItem('stockUser');
if (!loggedInUser) window.location.href = 'index.html';

let allStockData = []; // Cache all stock data globally

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

// Function to render the table based on provided data
function renderTable(dataToRender) {
  const tableBody = document.getElementById('tableBody');
  tableBody.innerHTML = ''; // Clear the table

  if (dataToRender.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 7;
    td.textContent = 'ไม่พบข้อมูลสินค้า';
    td.style.textAlign = 'center';
    tr.appendChild(td);
    tableBody.appendChild(tr);
    return;
  }

  dataToRender.forEach(row => {
    const tr = document.createElement('tr');
    const expDate = row[3] ? new Date(row[3]).toLocaleDateString('th-TH') : 'N/A';
    const lastUpdated = new Date(row[6]).toLocaleString('th-TH');

    tr.innerHTML = `
      <td>${row[0]}</td>
      <td>${row[1]}</td>
      <td>${row[2]}</td>
      <td>${expDate}</td>
      <td>${row[4]}</td>
      <td>${row[5]}</td>
      <td>${lastUpdated}</td>
    `;
    tableBody.appendChild(tr);
  });
}

// Event listener for the search input
document.getElementById('searchStock').addEventListener('input', function(e) {
  const searchTerm = e.target.value.toLowerCase();
  
  if (!searchTerm) {
    renderTable(allStockData); // If search is empty, show all data
    return;
  }
  
  const filteredData = allStockData.filter(row => {
    const productId = row[0].toLowerCase();
    const productName = row[1].toLowerCase();
    return productId.includes(searchTerm) || productName.includes(searchTerm);
  });
  
  renderTable(filteredData);
});

// Main function on page load
window.addEventListener('load', async () => {
  const loadingIndicator = document.getElementById('loading');
  
  try {
    let stockData = await callApi('getStockSummaryData');
    
    // --- Sorting logic from previous version ---
    stockData.sort((a, b) => {
        const timeA = a[3] && !isNaN(new Date(a[3]).getTime()) ? new Date(a[3]).getTime() : Infinity;
        const timeB = b[3] && !isNaN(new Date(b[3]).getTime()) ? new Date(b[3]).getTime() : Infinity;
        return timeA - timeB;
    });
    
    allStockData = stockData; // Cache the data
    renderTable(allStockData); // Initial render
    
    loadingIndicator.style.display = 'none';
    
  } catch (error) {
    console.error('Failed to load stock data:', error);
    loadingIndicator.textContent = 'ไม่สามารถโหลดข้อมูลได้: ' + error.message;
    loadingIndicator.removeAttribute('aria-busy');
  }
});
