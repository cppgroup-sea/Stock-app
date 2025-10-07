// !================== PASTE YOUR APPS SCRIPT URL HERE ==================!
const API_URL = "https://script.google.com/macros/s/AKfycbyE7MPF1Xei1ixIbb_tdOKPOMenFUt_27OqMEtN5SXSMCqF8sH6KPfVxchQU12AjnvE0A/exec";
// !=====================================================================!

const loggedInUser = sessionStorage.getItem('stockUser');

// If not logged in, redirect to login page
if (!loggedInUser) {
  window.location.href = 'index.html';
}

// Generic function to call our API
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
  // Prepare data for Select2
  const select2Data = products.map(product => ({
    id: product.id, // Select2 uses 'id' for the value
    text: `${product.id} - ${product.name}`, // Select2 uses 'text' for the label
    unit: product.unit // We add our custom data here
  }));

  // Initialize Select2
  const $productSelect = $('#productName');
  
  $productSelect.select2({
    placeholder: '-- กรุณาเลือกสินค้า --',
    data: select2Data
  });

  // Attach the Select2 event listener
  $productSelect.on('select2:select', function (e) {
    const data = e.params.data;
    if (data) {
      document.getElementById('productID').value = data.id || '';
      document.getElementById('unit').value = data.unit || '';
    }
  });

  // Handle clearing the selection
  $productSelect.on('select2:unselect', function (e) {
    document.getElementById('productID').value = '';
    document.getElementById('unit').value = '';
  });
}

$('#stockForm').on('submit', async (e) => {
  e.preventDefault();
  const submitButton = $('#submitButton');
  submitButton.text('กำลังบันทึก...');
  submitButton.prop('disabled', true);
  
  const formData = {
    productName: $('#productName').select2('data')[0] ? $('#productName').select2('data')[0].text : '',
    productID: $('#productID').val(),
    lot: $('#lot').val(),
    quantity: $('#quantity').val(),
    unit: $('#unit').val(),
    type: $('input[name="type"]:checked').val()
  };
  
  try {
    const result = await callApi('recordTransaction', formData);
    alert(result.message);
    $('#stockForm')[0].reset();
    $('#productName').val(null).trigger('change'); // Clear Select2
    $('#productID').val('');
    $('#unit').val('');
  } catch (error) {
    alert('เกิดข้อผิดพลาด: ' + error.message);
  } finally {
    submitButton.text('บันทึกรายการ');
    submitButton.prop('disabled', false);
  }
});

$('#logoutButton').on('click', () => {
  sessionStorage.removeItem('stockUser');
  window.location.href = 'index.html';
});

$(document).ready(async () => {
  $('#welcomeMessage').text(`ยินดีต้อนรับ, ${loggedInUser}`);
  try {
    const products = await callApi('getProducts');
    populateProducts(products);
  } catch (error) {
    console.error('Failed to load products:', error);
    alert('ไม่สามารถโหลดรายการสินค้าได้ กรุณาลองอีกครั้ง');
  }
});
