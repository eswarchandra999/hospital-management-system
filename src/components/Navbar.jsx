function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-title">
        <h1>Hospital Management System</h1>
      </div>

      <div className="navbar-user">
        <div className="user-avatar">A</div>

        <div className="user-info">
          <span className="user-name">Admin User</span>
          <span className="user-role">Administrator</span>
        </div>
      </div>
    </header>
  );
}

export default Navbar;