const API_URL = "https://script.google.com/macros/s/AKfycbwRUVh2fhmvRa4jGEbLMNnQaVnO88MRSrUAa_TZ8le0uG2ZueRiIP6R6f4iUAjTAkKEvQ/exec";

const loggedInUser = sessionStorage.getItem('stockUser');
if (!loggedInUser) window.location.href = 'index.html';

let productList = [];

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
  if (!dataList) return;
  dataList.innerHTML = '';
  products.forEach(product => {
    const option = document.createElement('option');
    option.value = `${product.id} - ${product.name}`;
    dataList.appendChild(option);
  });
}

document.getElementById('productSearch')?.addEventListener('input', function(e) {
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
});

document.getElementById('stockForm')?.addEventListener('submit', async (e) => {
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
  } catch (error) {
    alert('เกิดข้อผิดพลาด: ' + error.message);
  } finally {
    submitButton.removeAttribute('aria-busy');
  }
});

window.addEventListener('load', async () => {
  try {
    const products = await callApi('getProducts');
    populateProducts(products);
  } catch (error) {
    console.error('Failed to load products:', error);
    alert('ไม่สามารถโหลดรายการสินค้าได้');
  }
});
