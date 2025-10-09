const API_URL = "https://script.google.com/macros/s/AKfycbziJt0ipRwluqw7w2MvFnmROYZdSNAj3deDbAF7f0EWefdxAXp0UyiG1M7SfzfeWLAM/exec"; // <-- PASTE YOUR URL HERE

const loggedInUser = sessionStorage.getItem('stockUser');
if (!loggedInUser) window.location.href = 'index.html';

let productList = [];

async function callApi(action, payload = {}) {
  // ... (same as before) ...
}

function populateProducts(products) {
  // ... (same as before) ...
}

document.getElementById('productSearch').addEventListener('input', function(e) {
  // ... (same as before) ...
});


document.getElementById('stockForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const submitButton = document.getElementById('submitButton');
  submitButton.setAttribute('aria-busy', 'true');
  
  const formData = {
    productName: document.getElementById('productSearch').value,
    productID: document.getElementById('productID').value,
    lot: document.getElementById('lot').value,
    expDate: document.getElementById('expDate').value, // <-- Get the new date value
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
  } catch (error) {
    alert('เกิดข้อผิดพลาด: ' + error.message);
  } finally {
    submitButton.removeAttribute('aria-busy');
  }
});

window.addEventListener('load', async () => {
  // ... (same as before) ...
});
