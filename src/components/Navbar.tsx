// import React from "react";
// import logo from "../assets/logo.png";
// import { Button, message } from "antd";
// import { Link, useNavigate } from "react-router-dom";

// const Navbar = ({ status }) => {
//   const navigate = useNavigate();
//   return (
//     <div className="mb-16 mt-5 flex justify-between items-center max-sm:flex-col max-sm:items-start">
//       <Link to={"/"}>
//         <img src={logo} className="w-[150px] h-[40px]" />
//       </Link>

//       <div className="flex gap-5 max-sm:gap-3 items-center max-sm:mt-6">
//         {status ? (
//           <Link to={"/"} className="text-white gap-2 user_link">
//             <span>Go to Post table</span>

//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               width="14"
//               height="14"
//               viewBox="0 0 14 14"
//               fill="none"
//             >
//               <path
//                 d="M13.5839 1.16655L13.5839 10.7125C13.5839 10.9115 13.5048 11.1024 13.3641 11.2431C13.2234 11.3838 13.0325 11.4629 12.8335 11.4629C12.6344 11.4629 12.4436 11.3838 12.3028 11.2431C12.1621 11.1024 12.083 10.9115 12.083 10.7125L12.0837 2.97696L1.69653 13.3641C1.55588 13.5048 1.36511 13.5838 1.1662 13.5838C0.967289 13.5838 0.776523 13.5048 0.635871 13.3641C0.495218 13.2235 0.416201 13.0327 0.416201 12.8338C0.416201 12.6349 0.495219 12.4441 0.635871 12.3035L11.023 1.9163L3.28752 1.91697C3.0885 1.91697 2.89763 1.83791 2.7569 1.69718C2.61617 1.55645 2.5371 1.36557 2.5371 1.16655C2.5371 0.967528 2.61617 0.776656 2.7569 0.635926C2.89763 0.495195 3.0885 0.416134 3.28752 0.416133L12.8335 0.416134C12.932 0.416079 13.0296 0.435451 13.1207 0.473144C13.2118 0.510837 13.2945 0.56611 13.3642 0.635804C13.4339 0.705497 13.4892 0.788244 13.5269 0.879313C13.5646 0.970383 13.5839 1.06799 13.5839 1.16655Z"
//                 fill="white"
//                 stroke="white"
//                 stroke-width="0.5"
//               />
//             </svg>
//           </Link>
//         ) : (
//           <Link to={"/users"} className="text-white gap-2 user_link">
//             <span>Go to User table</span>

//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               width="14"
//               height="14"
//               viewBox="0 0 14 14"
//               fill="none"
//             >
//               <path
//                 d="M13.5839 1.16655L13.5839 10.7125C13.5839 10.9115 13.5048 11.1024 13.3641 11.2431C13.2234 11.3838 13.0325 11.4629 12.8335 11.4629C12.6344 11.4629 12.4436 11.3838 12.3028 11.2431C12.1621 11.1024 12.083 10.9115 12.083 10.7125L12.0837 2.97696L1.69653 13.3641C1.55588 13.5048 1.36511 13.5838 1.1662 13.5838C0.967289 13.5838 0.776523 13.5048 0.635871 13.3641C0.495218 13.2235 0.416201 13.0327 0.416201 12.8338C0.416201 12.6349 0.495219 12.4441 0.635871 12.3035L11.023 1.9163L3.28752 1.91697C3.0885 1.91697 2.89763 1.83791 2.7569 1.69718C2.61617 1.55645 2.5371 1.36557 2.5371 1.16655C2.5371 0.967528 2.61617 0.776656 2.7569 0.635926C2.89763 0.495195 3.0885 0.416134 3.28752 0.416133L12.8335 0.416134C12.932 0.416079 13.0296 0.435451 13.1207 0.473144C13.2118 0.510837 13.2945 0.56611 13.3642 0.635804C13.4339 0.705497 13.4892 0.788244 13.5269 0.879313C13.5646 0.970383 13.5839 1.06799 13.5839 1.16655Z"
//                 fill="white"
//                 stroke="white"
//                 stroke-width="0.5"
//               />
//             </svg>
//           </Link>
//         )}

//         <Button
//           type="primary"
//           className="logout-btn"
//           onClick={() => {
//             localStorage.removeItem("token");
//             message.success("Logout Successful");
//             navigate("/login");
//           }}
//           style={{ marginRight: 20 }}
//         >
//           Logout
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default Navbar;

// import React, { useState } from "react";
// import logo from "../assets/logo.png";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import { Button, Drawer, Menu, message } from "antd";

// import { MenuOutlined } from "@ant-design/icons";

// const Navbar = ({ status }) => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [drawerVisible, setDrawerVisible] = useState(false);

//   // Determine the active menu item based on the current path
//   const activeKey = location.pathname.startsWith("/posts")
//     ? "posts"
//     : location.pathname.startsWith("/users")
//     ? "users"
//     : location.pathname.startsWith("/comments")
//     ? "comments"
//     : location.pathname.startsWith("/replies")
//     ? "replies"
//     : "posts";

//   const menuItems = [
//     { key: "posts", label: "Posts", path: "/" },
//     { key: "users", label: "Users", path: "/users" },
//     { key: "comments", label: "Comments", path: "/comments" },
//     { key: "replies", label: "Replies", path: "/replies" },
//   ];

//   return (
//     <div
//       className="navbar-container flex justify-between items-center py-4 bg-[#141414] mb-16"
//       style={{ position: "sticky", top: 0, zIndex: 1000 }}
//     >
//       <Link to={"/"}>
//         <img src={logo} className="w-[150px] h-[40px]" alt="Logo" />
//       </Link>

//       {/* <div className="hidden md:flex"> */}
//       {/* Logo */}

//       {/* Navigation Menu */}
//       <Menu
//         mode="horizontal"
//         selectedKeys={[activeKey]}
//         className="flex-1 justify-center bg-[#141414] border-none max-md:hidden"
//       >
//         <Menu.Item key="posts">
//           <Link to="/">Posts</Link>
//         </Menu.Item>
//         <Menu.Item key="users">
//           <Link to="/users">Users</Link>
//         </Menu.Item>
//         <Menu.Item key="comments">
//           <Link to="/comments">Comments</Link>
//         </Menu.Item>
//         <Menu.Item key="replies">
//           <Link to="/replies">Replies</Link>
//         </Menu.Item>
//       </Menu>

//       {/* Logout Button */}
//       <Button
//         type="primary"
//         className="logout-btn max-md:hidden"
//         onClick={() => {
//           localStorage.removeItem("token");
//           message.success("Logout Successful");
//           navigate("/login");
//         }}
//       >
//         Logout
//       </Button>
//       {/* </div> */}

//       <div className="md:hidden">
//         <MenuOutlined
//           className="text-white text-2xl cursor-pointer"
//           onClick={() => setDrawerVisible(true)}
//         />
//         <Drawer
//           title=""
//           placement="right"
//           onClose={() => setDrawerVisible(false)}
//           visible={drawerVisible}
//           className="mobile-drawer"
//         >
//           <div className="flex flex-col gap-4">
//             {menuItems.map((item) => (
//               <Link
//                 key={item.key}
//                 to={item.path}
//                 className={`text-lg ${
//                   activeKey === item.key ? "text-[#FF8415]" : "text-gray-800"
//                 }`}
//                 onClick={() => setDrawerVisible(false)}
//               >
//                 {item.label}
//               </Link>
//             ))}
//             <Button
//               type="primary"
//               onClick={() => {
//                 localStorage.removeItem("token");
//                 message.success("Logout Successful");
//                 navigate("/login");
//               }}
//             >
//               Logout
//             </Button>
//           </div>
//         </Drawer>
//       </div>
//     </div>
//   );
// };

// export default Navbar;

import React, { useState } from "react";
import logo from "../assets/logo.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button, Drawer, Menu, message } from "antd";

import { MenuOutlined } from "@ant-design/icons";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerVisible, setDrawerVisible] = useState(false);

  // Determine the active menu item based on the current path
  const activeKey = location.pathname.startsWith("/posts")
    ? "posts"
    : location.pathname.startsWith("/users")
    ? "users"
    : location.pathname.startsWith("/comments")
    ? "comments"
    : location.pathname.startsWith("/replies")
    ? "replies"
    : "posts";

  const menuItems = [
    { key: "posts", label: "Posts", path: "/" },
    { key: "users", label: "Users", path: "/users" },
    { key: "comments", label: "Comments", path: "/comments" },
    { key: "replies", label: "Replies", path: "/replies" },
  ];

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
