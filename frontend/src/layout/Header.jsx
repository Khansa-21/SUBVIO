import React from "react";
import { DollarSign, Moon } from "lucide-react";

const Header = () => {
  return (
    <div>
      <nav className="flex items-center justify-between p-4 bg-gray-100 shadow-md h-14">
        <div className="flex items-center space-x-3">
          <DollarSign className="text-white bg-purple-600 p-1 rounded-full ml-3" />
          <h1 className="text-2xl font-bold font-serif">Subvio</h1>
        </div>
        <ul className="flex items-center space-x-10">
          <li>
            <button
              href="/"
              className="text-gray-500 hover:text-fuchsia-500 hover:text-shadow-md cursor-pointer font-semibold"
            >
              Features
            </button>
          </li>
          <li>
            <button
              href="/subscriptions"
              className="text-gray-500 hover:text-fuchsia-500 hover:text-shadow-md cursor-pointer font-semibold"
            >
              Pricing
            </button>
          </li>
          <li>
            <button
              href="/about"
              className="text-gray-500 hover:text-fuchsia-500 hover:text-shadow-md cursor-pointer font-semibold"
            >
              <Moon className="mt-1" />
            </button>
          </li>
          <li>
            <button
              href="/reports"
              className="text-gray-500 hover:text-fuchsia-500 hover:text-shadow-md cursor-pointer font-semibold"
            >
              Login
            </button>
          </li>
          <li>
            <button className="btn-primary">Sign Up</button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Header;
