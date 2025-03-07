import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import backgroundImage from "../assets/background.webp";
import logo from "../assets/svg.svg";
import { useUser } from "../context/UserContext";

function Start() {
  const { currentUser } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser && !currentUser.email) {
      navigate("/update-profile");
    }
  }, [currentUser, navigate]);

  const isWalletConnected = !!currentUser; // True if currentUser exists

  return (
    <div
      className="min-h-[92vh] bg-cover bg-center bg-no-repeat flex items-center justify-center"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="w-[800px] h-[500px] lg:border lg:border-[#494848] p-8 rounded-3xl shadow-lg text-center flex flex-col justify-center items-center bg-black/50 backdrop-blur-md">
        <img src={logo} alt="" className="w-[100px]" />
        <h2 className="text-5xl font-semibold mb-6 text-white">Valet</h2>
        <Link to="/createagent">
          <button
            className={`w-[250px] py-2 rounded-full text-lg font-medium transition-colors duration-300 ease-in-out border-2 border-[#6894f3] ${
              isWalletConnected
                ? "bg-[#6894f3] hover:bg-black hover:text-[#6894f3] cursor-pointer"
                : "bg-gray-500 text-gray-300 cursor-not-allowed"
            }`}
            disabled={!isWalletConnected} // Disable button if no wallet connected
          >
            Get Started
          </button>
        </Link>
      </div>
    </div>
  );
}

export default Start;