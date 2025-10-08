const API_URL = "https://script.google.com/macros/s/AKfycbwfpl1zo1rKf7-4pszn1Y4trQY1UV1Vj5Hr6Lj2u7M0ZzXqVWrqEAce8gp5NqikhS8Rwg/exec"; // <-- PASTE YOUR URL HERE

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

function populateProductFilter(products) {
  const select2Data = products.map(product => ({
    id: product.id,
    text: `${product.id} - ${product.name}`
  }));
  select2Data.unshift({ id: 'all', text: 'สินค้าทั้งหมด' });

  $('#productId').select2({
    placeholder: 'เลือกสินค้า',
    data: select2Data
  });
}

$('#filterForm').on('submit', async (e) => {
  e.preventDefault();
  const tableBody = $('#tableBody');
  const loading = $('#loading');
  const noResults = $('#noResults');
  const resultsCard = $('#resultsCard');

  resultsCard.show();
  loading.show();
  noResults.hide();
  tableBody.html('');

  const filters = {
    productId: $('#productId').val(),
    startDate: $('#startDate').val(),
    endDate: $('#endDate').val()
  };

  try {
    const historyData = await callApi('getTransactionHistory', filters);
    
    if (historyData.length === 0) {
      noResults.show();
    } else {
      historyData.forEach(row => {
        const tr = $('<tr>');
        const timestamp = new Date(row[0]).toLocaleString('th-TH');
        tr.html(`
          <td>${timestamp}</td>
          <td>${row[1]}</td>
          <td>${row[2]}</td>
          <td>${row[3]}</td>
          <td>${row[4]}</td>
          <td>${row[5]}</td>
          <td>${row[6]}</td>
          <td>${row[7]}</td>
          <td>${row[8] || ''}</td>
        `);
        tableBody.append(tr);
      });
    }
  } catch (error) {
    console.error('Failed to get history:', error);
    noResults.text('เกิดข้อผิดพลาดในการค้นหา').show();
  } finally {
    loading.hide();
  }
});

$(document).ready(async () => {
  try {
    const products = await callApi('getProducts');
    populateProductFilter(products);
  } catch (error) {
    console.error('Failed to load products:', error);
    alert('ไม่สามารถโหลดรายการสินค้าสำหรับค้นหาได้');
  }
});
