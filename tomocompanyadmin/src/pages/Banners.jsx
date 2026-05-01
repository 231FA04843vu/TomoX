import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { API_URL } from "../config";

const Banners = () => {
  const [announcement, setAnnouncement] = useState("");
  const [banner, setBanner] = useState("");

  const submitAnnouncement = async () => {
    await fetch(`${API_URL}/announcements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: announcement }),
    });
    alert("Announcement updated");
  };

  const submitBanner = async () => {
    await fetch(`${API_URL}/banners`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: banner }),
    });
    alert("Banner added");
  };

  return (
    <>
      <Navbar />
      <h2>Manage Banners & Announcements</h2>
      <div>
        <h4>Announcement</h4>
        <input value={announcement} onChange={(e) => setAnnouncement(e.target.value)} />
        <button onClick={submitAnnouncement}>Submit</button>
      </div>
      <div>
        <h4>New Banner Image URL</h4>
        <input value={banner} onChange={(e) => setBanner(e.target.value)} />
        <button onClick={submitBanner}>Submit</button>
      </div>
    </>
  );
};

export default Banners;
