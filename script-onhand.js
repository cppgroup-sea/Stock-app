const API_URL = "https://script.google.com/macros/s/AKfycbzhTHL-q3UASl1rxCa_U2ODmlfp2Wh53RbHIpmn5ceIS30Hi3XM9EAnowrBB2Kue71nzg/exec"; // <-- PASTE YOUR URL HERE

const loggedInUser = sessionStorage.getItem('stockUser');
if (!loggedInUser) window.location.href = 'index.html';

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

window.addEventListener('load', async () => {
  const tableBody = document.getElementById('tableBody');
  const loadingIndicator = document.getElementById('loading');
  
  try {
    let stockData = await callApi('getStockSummaryData');
    
    if (stockData.length === 0) {
      loadingIndicator.textContent = 'ไม่พบข้อมูลสต๊อก';
      loadingIndicator.removeAttribute('aria-busy');
      return;
    }
    
    // --- NEW: Sorting is now done here in the frontend ---
    stockData.sort((a, b) => {
        const timeA = a[3] && !isNaN(new Date(a[3]).getTime()) ? new Date(a[3]).getTime() : Infinity;
        const timeB = b[3] && !isNaN(new Date(b[3]).getTime()) ? new Date(b[3]).getTime() : Infinity;
        return timeA - timeB;
    });
    // --------------------------------------------------------

    tableBody.innerHTML = ''; 
    stockData.forEach(row => {
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
    loadingIndicator.style.display = 'none';
    
  } catch (error) {
    console.error('Failed to load stock data:', error);
    loadingIndicator.textContent = 'ไม่สามารถโหลดข้อมูลได้: ' + error.message;
    loadingIndicator.removeAttribute('aria-busy');
  }
});
