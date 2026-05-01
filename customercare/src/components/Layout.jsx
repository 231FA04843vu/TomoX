import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}
