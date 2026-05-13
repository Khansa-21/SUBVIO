import React from "react";
import { DollarSign } from "lucide-react";

const Footer = () => {
  return (
    <div>
      <div className="flex items-center justify-between p-4 bg-gray-100 h-14 border-t border-gray-300">
        <div className="flex items-center space-x-3">
          <DollarSign className="text-white bg-purple-600 p-1 rounded-full ml-3" />
          <h1 className="text-2xl font-bold font-serif">Subvio</h1>
        </div>
        <p className="text-gray-500">
          &copy; 2025 SubTrack. All rights reserved.
        </p>
        <ul className="flex items-center space-x-10">
          <li>
            <button
              href="/"
              className="text-gray-500 hover:text-fuchsia-500 hover:text-shadow-md cursor-pointer font-semibold"
            >
              Privacy
            </button>
          </li>
          <li>
            <button
              href="/subscriptions"
              className="text-gray-500 hover:text-fuchsia-500 hover:text-shadow-md cursor-pointer font-semibold"
            >
              Terms
            </button>
          </li>
          <li>
            <button
              href="/reports"
              className="text-gray-500 hover:text-fuchsia-500 hover:text-shadow-md cursor-pointer font-semibold"
            >
              Support
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Footer;
