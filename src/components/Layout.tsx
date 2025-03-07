import Sidebar from "./Sidebar.tsx";

interface LayoutProps {
  children: React.ReactNode; 
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 lg:ml-72 p-4">
          {children}
        </div>
      </div>
    </>
  );
};

export default Layout;
