import React from "react";
import { Link, useLocation } from "react-router-dom";
import { House, Users, UserPlus, FileText } from "lucide-react";

const Sidebar = () => {
  const location = useLocation();
  const active = location.pathname;

  const menuItems = [
    { name: "Home", path: "/", icon: <House className="text-2xl" /> },
    {
      name: "Your Agents",
      path: "/youragent",
      icon: <Users className="text-2xl" />,
    },
    {
      name: "Create Agents",
      path: "/createagent",
      icon: <UserPlus className="text-2xl" />,
    },
    {
      name: "Documentation",
      path: "",
      icon: <FileText className="text-2xl" />,
      isAnchor: true,
    },
  ];

  return (
    <div className="hidden lg:block w-72 bg-black text-white h-screen fixed border-r border-[#494848] flex flex-col justify-between">
      <div className="p-4">
        <div className="mt-6 space-y-6">
          <div>
            <p className="uppercase text-gray-400 text-sm mb-3 ml-2">
              Terminal
            </p>
            <ul>
              {menuItems.map((item) => (
                <React.Fragment key={item.path}>
                  <li className="mb-4">
                    {item.isAnchor ? (
                      <a
                        target="_blank"
                        href="https://x.com/home"
                        className={`flex items-center gap-3 p-2 rounded-r-full shadow-md transition-all w-full text-left cursor-pointer text-gray-400 ${
                          active === item.path
                            ? "bg-[#222128] text-gray-400"
                            : "hover:bg-[#222128] text-gray-400"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-9 h-9 rounded-full ${
                            active === item.path
                              ? "bg-transparent text-white"
                              : "bg-transparent text-gray-400"
                          }`}
                        >
                          {item.icon}
                        </div>
                        <span className="text-xl">{item.name}</span>
                      </a>
                    ) : (
                      <Link
                        to={item.path}
                        className={`flex items-center gap-3 p-2 rounded-r-full shadow-md transition-all w-full text-left cursor-pointer ${
                          active === item.path
                            ? "bg-[#222128] text-white"
                            : "hover:bg-[#222128] text-gray-400"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-9 h-9 rounded-full ${
                            active === item.path
                              ? "bg-transparent"
                              : "bg-transparent"
                          }`}
                        >
                          {item.icon}
                        </div>
                        <span className="text-xl">{item.name}</span>
                      </Link>
                    )}
                  </li>
                </React.Fragment>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
