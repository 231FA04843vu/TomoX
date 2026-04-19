import React from "react";

function AnnouncementBar({ messages }) {
  return (
    <div className="bg-yellow-100 text-yellow-800 text-sm py-2 px-4">
      <marquee behavior="scroll" direction="left" scrollamount="5">
        {messages.join(" • ")}
      </marquee>
    </div>
  );
}

export default AnnouncementBar;
