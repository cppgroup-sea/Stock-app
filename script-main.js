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

function populateProducts(products) {
  const select2Data = products.map(product => ({
    id: product.id,
    text: `${product.id} - ${product.name}`,
    unit: product.unit
  }));

  const $productSelect = $('#productName');
  $productSelect.select2({
    placeholder: '-- กรุณาเลือกสินค้า --',
    allowClear: true, // Optional: Adds a small 'x' to clear the selection
    data: select2Data
  });

  // ** THE FIX IS HERE **
  // This line clears the initial auto-selection and forces the placeholder to show.
  $productSelect.val(null).trigger('change');

  $productSelect.on('select2:select', function (e) {
    const data = e.params.data;
    if (data) {
      $('#productID').val(data.id || '');
      $('#unit').val(data.unit || '');
    }
  });

  $productSelect.on('select2:unselect', function (e) {
    $('#productID').val('');
    $('#unit').val('');
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
    type: $('input[name="type"]:checked').val(),
    remarks: $('#remarks').val()
  };
  
  try {
    const result = await callApi('recordTransaction', formData);
    alert(result.message);
    $('#stockForm')[0].reset();
    $('#productName').val(null).trigger('change');
    $('#productID').val('');
    $('#unit').val('');
  } catch (error) {
    alert('เกิดข้อผิดพลาด: ' + error.message);
  } finally {
    submitButton.text('บันทึกรายการ');
    submitButton.prop('disabled', false);
  }
});

$(document).ready(async () => {
  try {
    const products = await callApi('getProducts');
    populateProducts(products);
  } catch (error) {
    console.error('Failed to load products:', error);
    alert('ไม่สามารถโหลดรายการสินค้าได้');
  }
});
