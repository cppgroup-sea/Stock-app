document.addEventListener("DOMContentLoaded", function() {
  const user = sessionStorage.getItem('stockUser');
  const role = sessionStorage.getItem('stockUserRole');
  if (!user) return;
  const navbarHTML = `
    <nav class="navbar container-fluid">
      <ul><li><strong>Stock System</strong></li></ul>
      <ul>
        ${role === 'Admin' ? `
          <li><a href="main.html">Main</a></li>
          <li><a href="onhand.html">On Hand</a></li>
          <li><a href="history.html">History</a></li>
        ` : `
          <li><a href="onhand.html">On Hand</a></li>
        `}
      </ul>
      <ul>
        <li>ยินดีต้อนรับ, ${user}</li>
        <li><a href="#" id="logoutButtonNav" role="button" class="secondary">ออกจากระบบ</a></li>
      </ul>
    </nav>
  `;
  document.body.insertAdjacentHTML('afterbegin', navbarHTML);
  document.getElementById('logoutButtonNav').addEventListener('click', (e) => {
    e.preventDefault();
    sessionStorage.clear();
    window.location.href = 'index.html';
  });
});
