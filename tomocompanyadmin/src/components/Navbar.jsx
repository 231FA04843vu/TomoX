import { logout } from "../utils/auth";

const Navbar = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <nav className="navbar">
      <span>Welcome, {user?.name}</span>
      <button onClick={logout}>Logout</button>
    </nav>
  );
};

export default Navbar;
