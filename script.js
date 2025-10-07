// !================== PASTE YOUR APPS SCRIPT URL HERE ==================!
const API_URL = "https://script.google.com/macros/s/AKfycbyE7MPF1Xei1ixIbb_tdOKPOMenFUt_27OqMEtN5SXSMCqF8sH6KPfVxchQU12AjnvE0A/exec";
// !=====================================================================!

const loggedInUser = sessionStorage.getItem('stockUser');
let productChoices;

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
  const selectElement = document.getElementById('productName');
  
  productChoices = new Choices(selectElement, {
      searchEnabled: true,
      itemSelectText: 'กดเพื่อเลือก',
      removeItemButton: false,
      placeholder: true,
      placeholderValue: '-- กรุณาเลือกสินค้า --'
  });

  // Attach the event listener here to ensure it's set up correctly
  selectElement.addEventListener('choice', function(event) {
    if (event.detail.choice && event.detail.choice.customProperties) {
        const props = event.detail.choice.customProperties;
        document.getElementById('productID').value = props.id || '';
        document.getElementById('unit').value = props.unit || '';
    } else {
        document.getElementById('productID').value = '';
        document.getElementById('unit').value = '';
    }
  }, false);
  
  const choicesData = products.map(product => ({
      value: product.name,
      label: `${product.id} - ${product.name}`,
      customProperties: {
          id: product.id,
          unit: product.unit
      }
  }));

  productChoices.setChoices(choicesData, 'value', 'label', true);
}

document.getElementById('stockForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const submitButton = document.getElementById('submitButton');
  submitButton.setAttribute('aria-busy', 'true');
  submitButton.textContent = 'กำลังบันทึก...';
  
  const formData = {
    productName: document.getElementById('productName').value,
    productID: document.getElementById('productID').value,
    lot: document.getElementById('lot').value,
    quantity: document.getElementById('quantity').value,
    unit: document.getElementById('unit').value,
    type: document.querySelector('input[name="type"]:checked').value
  };
  
  try {
    const result = await callApi('recordTransaction', formData);
    alert(result.message);
    document.getElementById('stockForm').reset();
    document.getElementById('productID').value = '';
    document.getElementById('unit').value = '';
    productChoices.clearStore();
    productChoices.setChoiceByValue('');
  } catch (error) {
    alert('เกิดข้อผิดพลาด: ' + error.message);
  } finally {
    submitButton.removeAttribute('aria-busy');
    submitButton.textContent = 'บันทึกรายการ';
  }
});

document.getElementById('logoutButton').addEventListener('click', () => {
  sessionStorage.removeItem('stockUser');
  window.location.href = 'index.html';
});

window.addEventListener('load', async () => {
  document.getElementById('welcomeMessage').textContent = `ยินดีต้อนรับ, ${loggedInUser}`;
  try {
    const products = await callApi('getProducts');
    populateProducts(products);
  } catch (error) {
    console.error('Failed to load products:', error);
    alert('ไม่สามารถโหลดรายการสินค้าได้ กรุณาลองอีกครั้ง');
  }
});
