'use client'
import dynamic from "next/dynamic";
import { getAccountType } from "./utils/jwt";
import AdminDashboardWrapper from "./admin_dashboard/page";

export default function Home() {

  const AuctionDashboardWrapper = dynamic(() => import("./auction_dashboard/page"), { ssr: false });
  const LoginPage = dynamic(() => import("./login/page"), { ssr: false });
  const Search = dynamic(() => import("./search/page"), { ssr: false });

  const checkUserStatus = () => {
    let accountType = getAccountType();
    if (accountType && accountType == "buyer") {
      return <Search />
    } else if (accountType && accountType == "seller") {
      return <AuctionDashboardWrapper />
    } else if (accountType && accountType == "admin") {
      return <AdminDashboardWrapper />
    } else {
      return <LoginPage />
    }
  }

  return (

    <div>
      {checkUserStatus()}
    </div>
  );
}