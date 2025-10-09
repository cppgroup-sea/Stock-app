const API_URL = "https://script.google.com/macros/s/AKfycbwF6yJr37m-sbqN1dNZOjnkDZ1OQsOpR29R_VrV0CrE2Dv_zym5Aelxe6qySqG3cy_Z3Q/exec"; // <-- PASTE YOUR URL HERE

const loggedInUser = sessionStorage.getItem('stockUser');
if (!loggedInUser) window.location.href = 'index.html';

async function callApi(action, payload = {}) { /* ... same as before ... */ }

window.addEventListener('load', async () => {
  const tableBody = document.getElementById('tableBody');
  const loadingIndicator = document.getElementById('loading');
  
  try {
    const stockData = await callApi('getStockSummaryData');
    
    if (stockData.length === 0) { /* ... same as before ... */ }

    tableBody.innerHTML = ''; 
    stockData.forEach(row => {
      const tr = document.createElement('tr');
      
      // Format dates for better readability
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
    loadingIndicator.style.display = 'none';
    
  } catch (error) { /* ... same as before ... */ }
});
