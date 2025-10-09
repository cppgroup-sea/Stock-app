const API_URL = "https://script.google.com/macros/s/AKfycbwfpl1zo1rKf7-4pszn1Y4trQY1UV1Vj5Hr6Lj2u7M0ZzXqVWrqEAce8gp5NqikhS8Rwg/exec"; // <-- PASTE YOUR URL HERE

const loggedInUser = sessionStorage.getItem('stockUser');
if (!loggedInUser) window.location.href = 'index.html';

// Store products in a global variable for easy access
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
  productList = products; // Save the product list
  const dataList = document.getElementById('productList');
  dataList.innerHTML = ''; // Clear previous options

  products.forEach(product => {
    const option = document.createElement('option');
    option.value = `${product.id} - ${product.name}`;
    dataList.appendChild(option);
  });
}

// Event listener for the new input field
document.getElementById('productSearch').addEventListener('input', function(e) {
  const inputValue = e.target.value;
  const productIDInput = document.getElementById('productID');
  const unitInput = document.getElementById('unit');

  // Find the selected product from our global list
  const selectedProduct = productList.find(p => `${p.id} - ${p.name}` === inputValue);

  if (selectedProduct) {
    productIDInput.value = selectedProduct.id;
    unitInput.value = selectedProduct.unit;
  } else {
    // Clear if the input doesn't match any full product name
    productIDInput.value = '';
    unitInput.value = '';
  }
});


document.getElementById('stockForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const submitButton = document.getElementById('submitButton');
  submitButton.setAttribute('aria-busy', 'true');
  
  const formData = {
    productName: document.getElementById('productSearch').value,
    productID: document.getElementById('productID').value,
    lot: document.getElementById('lot').value,
    quantity: document.getElementById('quantity').value,
    unit: document.getElementById('unit').value,
    type: document.querySelector('input[name="type"]:checked').value,
    remarks: document.getElementById('remarks').value
  };

  // Simple validation
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
