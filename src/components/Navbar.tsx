import React, { useState } from "react";
import logo from "../assets/logo.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button, Drawer, Menu, message } from "antd";

import { MenuOutlined } from "@ant-design/icons";

import { useDispatch } from "react-redux";
import { useGetUserInfoQuery } from "../services/postApi";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const dispatch = useDispatch();
  const { data: user, isLoading: isUserLoading } =
    useGetUserInfoQuery(undefined);
  const userData = user?.data;

  const is_admin = userData?.is_admin;

  // Determine the active menu item based on the current path
  const activeKey = location.pathname.startsWith("/posts")
    ? "posts"
    : location.pathname.startsWith("/users")
    ? "users"
    : location.pathname.startsWith("/comments")
    ? "comments"
    : location.pathname.startsWith("/replies")
    ? "replies"
    : location.pathname.startsWith("/ads")
    ? "ads"
    : location.pathname.startsWith("/setting")
    ? "setting"
    : "posts";

  const menuItems = [
    { key: "posts", label: "Posts", path: "/" },
    { key: "users", label: "Users", path: "/users" },
    { key: "comments", label: "Comments", path: "/comments" },
    { key: "ads", label: "Ads", path: "/ads" },
    { key: "replies", label: "Replies", path: "/replies" },
  ];

  if (is_admin) {
    menuItems.push({ key: "setting", label: "Setting", path: "/setting" });
  }

  return (
    <div
      className="navbar-container flex justify-between items-center py-4 bg-[#141414] mb-16"
      style={{ position: "sticky", top: 0, zIndex: 1000 }}
    >
      {/* Logo */}
      <Link to={"/"}>
        <img src={logo} className="w-[150px] h-[40px]" alt="Logo" />
      </Link>

      {/* Navigation Menu (Desktop) */}
      <Menu
        mode="horizontal"
        selectedKeys={[activeKey]}
        className="flex-1 justify-center bg-[#141414] border-none max-md:hidden"
      >
        {menuItems.map((item) => (
          <Menu.Item key={item.key}>
            <Link to={item.path}>{item.label}</Link>
          </Menu.Item>
        ))}
      </Menu>

      {/* Logout Button (Desktop) */}
      <Button
        type="primary"
        className="logout-btn max-md:hidden"
        onClick={() => {
          localStorage.removeItem("token");
          message.success("Logout Successful");

          navigate("/login");
        }}
      >
        Logout
      </Button>

      {/* Hamburger Menu (Mobile) */}
      <div className="md:hidden">
        <MenuOutlined
          className="text-white text-2xl cursor-pointer"
          onClick={() => setDrawerVisible(true)}
        />
        <Drawer
          title=""
          placement="right"
          onClose={() => setDrawerVisible(false)}
          visible={drawerVisible}
          className="mobile-drawer"
        >
          {/* Drawer Menu */}
          <div className="flex flex-col gap-4">
            {menuItems.map((item) => (
              <Link
                key={item.key}
                to={item.path}
                className={`text-lg ${
                  activeKey === item.key
                    ? "text-[#FF8415] font-bold"
                    : "text-gray-300"
                }`}
                onClick={() => setDrawerVisible(false)}
              >
                {item.label}
              </Link>
            ))}
            <Button
              type="primary"
              onClick={() => {
                localStorage.removeItem("token");
                message.success("Logout Successful");
                navigate("/login");
              }}
            >
              Logout
            </Button>
          </div>
        </Drawer>
      </div>
    </div>
  );
};

export default Navbar;
