'use client'
import dynamic from "next/dynamic";
import { getAccountType } from "./utils/jwt";

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
