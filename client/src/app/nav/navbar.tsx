import { useState } from "react";
import { BsChevronDoubleLeft, BsChevronDoubleRight, BsHousesFill, BsStarFill } from "react-icons/bs";
import { FaUserCircle, FaUsers, FaUserTie } from "react-icons/fa";
import { IoMdSettings } from "react-icons/io";
import { Link, Outlet } from "react-router-dom";
import { useUserRole } from "../../hooks/useUserRole";

const iconSize = "1.8rem";

const links = [
  {
    to: "/my-projects",
    label: "My Projects",
    icon: <BsStarFill size={iconSize} />,
    roles: ["USER", "ADMIN", "SUPER_ADMIN"],
  },
  {
    to: "/projects",
    label: "Projects",
    icon: <BsHousesFill size={iconSize} />,
    roles: ["USER", "ADMIN", "SUPER_ADMIN"],
  },
  {
    to: "/clients",
    label: "Clients",
    icon: <FaUserTie size={iconSize} />,
    roles: ["USER", "ADMIN", "SUPER_ADMIN"],
  },
  {
    to: "/profile",
    label: "Profile",
    icon: <FaUserCircle size={iconSize} />,
    roles: ["USER", "ADMIN", "SUPER_ADMIN"],
  },
  {
    to: "/users",
    label: "Users",
    icon: <FaUsers size={iconSize} />,
    roles: ["ADMIN", "SUPER_ADMIN"],
  },
  {
    to: "/settings",
    label: "Settings",
    icon: <IoMdSettings size={iconSize} />,
    roles: ["ADMIN", "SUPER_ADMIN"],
  },
];

function NavBar() {
  // const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Function to handle window resize
  // const handleResize = () => {
  //   setWindowWidth(window.innerWidth);
  // };

  // Set up event listener for window resize
  // useEffect(() => {
  //   window.addEventListener("resize", handleResize);

  //   // Cleanup event listener on component unmount
  //   return () => {
  //     window.removeEventListener("resize", handleResize);
  //   };
  // }, []);

  return <LargeScreenNavBar />;

  // if (windowWidth > 768) {
  // } else {
  //   return <SmallScreenNavBar />;
  // }
}

function LargeScreenNavBar() {
  const [isOpen, setIsOpen] = useState(true);
  const userRole = useUserRole();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Filter links based on user role
  const filteredLinks = links.filter(link => 
    link.roles.includes(userRole || 'USER')
  );

  return (
    <div className="flex flex-row justify-start h-screen relative bg-sims-beige">
      <div className="flex flex-col bg-white shadow-sm border-r-gray-300 border-r">
        <div
          className={`
            pt-3
            ${isOpen ? "w-32" : "w-12"} transition-all duration-300`}
        >
          <div className="flex flex-start flex-col items-center">
            <div className={isOpen ? "p-3" : "p-1"}>
              <img
                src="/assets/sims-logo-w-name-vertical.png"
                alt="Sims Logo"
                // style={{ height: "2.5rem", width: "2.5rem" }}
             />
            </div>
          </div>
        </div>
        <nav>
          <ul>
            {filteredLinks.map((link, index) => {
              return (
                <div key={`nav-list-${index}`}>
                  <hr className="mx-2" />
                  <li key={index}>
                    <Link to={link.to}>
                      <div
                        className={`
                      pl-1 pr-2 py-3
                      flex flex-row 
                      group
                      hover:bg-slate-100 ${
                        isOpen ? "justify-between" : "justify-center"
                      }`}
                      >
                        <div
                          className={`${
                            isOpen ? "" : "flex justify-center"
                          } transition-all duration-300 group-hover:text-gray-700`}
                        >
                          {link.icon}
                        </div>
                        <div
                          className={`${
                            isOpen ? "block" : "hidden"
                          } transition-all duration-300`}
                        >
                          {link.label}
                        </div>
                      </div>
                    </Link>
                  </li>
                </div>
              );
            })}
            <div>
              <hr className="mx-2" />
              <li onClick={toggleSidebar}>
                <div
                  className={`
                      pl-1 pr-2 py-3
                      flex flex-row 
                      group
                      hover:bg-slate-200 justify-center
                      `}
                >
                  <div
                    className={`flex flex-row justify-center items-center transition-all duration-300 group-hover:text-gray-700`}
                  >
                    {isOpen ? (
                      <BsChevronDoubleLeft />
                    ) : (
                      <BsChevronDoubleRight />
                    )}
                  </div>
                </div>
              </li>
            </div>
          </ul>
        </nav>
      </div>
      <div className="w-full h-full">
        <Outlet />
      </div>
    </div>
  );
}

// function SmallScreenNavBar() {
//   return (
//     <div className="flex flex-col">
//       <div className="h-full bg-slate-200">
//         <Outlet />
//         <div className="h-16"></div>
//       </div>
//       <div className="pb-2 pt-1 px-2 border-t-2 shadow-sm fixed bottom-0 bg-slate-50">
//         <nav className="w-screen p-1">
//           <ul className="flex flex-row justify-around items-end">
//             {links.map((link, index) => {
//               return (
//                 <li key={index}>
//                   <Link to={link.to}>
//                     <div className="group-hover:text-gray-700">{link.icon}</div>
//                   </Link>
//                 </li>
//               );
//             })}
//           </ul>
//         </nav>
//       </div>
//     </div>
//   );
// }

export default NavBar;
