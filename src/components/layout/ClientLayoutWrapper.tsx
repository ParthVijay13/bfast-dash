"use client";
import AppSidebar from "../../layout/AppSidebar";
import AppHeader from "../../layout/AppHeader";
import Backdrop from "../../layout/Backdrop";

interface ClientLayoutWrapperProps {
  children: React.ReactNode;
}

const ClientLayoutWrapper: React.FC<ClientLayoutWrapperProps> = ({ children }) => {
  return (
    <div className="relative">
      <AppSidebar />
      <div className="lg:ml-[90px] xl:ml-[290px]">
        <AppHeader />
        <main className="mt-16 lg:mt-0">
          {children}
        </main>
      </div>
      <Backdrop />
    </div>
  );
};

export default ClientLayoutWrapper;