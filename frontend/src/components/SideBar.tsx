import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaBars,
  FaCog,
  FaHome,
  FaTimes,
  FaUpload,
  FaUser,
  FaVideo,
} from "react-icons/fa";
import { IoIosLogOut } from "react-icons/io";
import { fetchUserDetails, logOutUser } from "../reducers/auth/authReducer";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../reducers/auth/store";

const SideBar = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    dispatch(fetchUserDetails());
  }, []);

  return (
    <>
      <div
        className={`fixed top-0 left-0 z-40 w-64 h-screen bg-black text-white lg:bg-bgOne lg:text-textOne shadow-lg transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="p-4 text-2xl font-semibold border-b border-gray-300 hidden md:block">
          VideoBoard
        </div>
        <nav className="mt-10 md:mt-7">
          <ul className="space-y-2">
            <li>
              <NavLink
                to="/"
                className="flex items-center p-3 hover:bg-gray-200 hover:text-black rounded-md transition-colors duration-200"
                onClick={toggleSidebar}
              >
                <FaHome size={20} className="mr-3" />
                <span>Home</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/user/dashboard"
                className="flex items-center p-3 hover:bg-gray-200 hover:text-black rounded-md transition-colors duration-200"
                onClick={toggleSidebar}
              >
                <FaUser className="mr-3" />
                <span>Dashboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/user/upload-video"
                className="flex items-center p-3 hover:bg-gray-200 hover:text-black rounded-md transition-colors duration-200"
                onClick={toggleSidebar}
              >
                <FaUpload className="mr-3" />
                <span>Upload Video</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/user/edit/my-videos"
                className="flex items-center p-3 hover:bg-gray-200 hover:text-black rounded-md transition-colors duration-200"
                onClick={toggleSidebar}
              >
                <FaVideo className="mr-3" />
                <span>My Videos</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/user/profile"
                className="flex items-center p-3 hover:bg-gray-200 hover:text-black rounded-md transition-colors duration-200"
                onClick={toggleSidebar}
              >
                <FaCog className="mr-3" />
                <span>User profile</span>
              </NavLink>
            </li>
            <li>
              <div
                className="flex items-center p-3 hover:bg-gray-200 hover:text-black rounded-md cursor-pointer transition-colors duration-200"
                onClick={() => {
                  dispatch(logOutUser());
                  navigate("/sign-in");
                }}
              >
                <IoIosLogOut size={20} className="mr-3" />
                <span>Log out</span>
              </div>
            </li>
          </ul>
        </nav>
      </div>

      <div className="fixed top-0 left-0 right-0 bg-black lg:hidden text-white h-12 flex items-center px-4 shadow-md z-50">
        <button
          onClick={toggleSidebar}
          className="lg:hidden text-white text-2xl"
        >
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>

        <div className="w-full flex items-center justify-center">
          <NavLink to="/" className="text-lg font-semibold">
            VideoBoard
          </NavLink>
        </div>
      </div>
    </>
  );
};

export default SideBar;
