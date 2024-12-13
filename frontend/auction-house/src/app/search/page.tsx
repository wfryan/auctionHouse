"use client";
import { useState, useRef, useEffect } from "react";
import AuctionItemClickable from "@/app/components/AuctionItemClickable";
import { useRouter } from "next/navigation";
import BuyerInfo from "../components/BuyerInfo";
import SignOutButton from "../components/SignoutButton";
import { getToken } from "../utils/cookie";
import LoginButton from "../components/LoginButton";
import { instance } from "../utils/auctionHouseApi";

export interface AuctionItem {
  auction_item_id: number;
  item_name: string;
  status: string;
  information: string;
  starting_bid: string;
  amount: number;
  end_time: string;
  start_time: string;
  picture?: string;
}

export default function Search() {
  const [isMounted, setIsMounted] = useState(false);

  const router = useRouter();
  const [auctions, setAuctions] = useState<AuctionItem[]>([]);
  const [dispError, setDispError] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [sortOption, setSortOption] = useState<string>("default");
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const searchFunc = async () => {
    setIsButtonDisabled(true);
    try {
      if (input.current == null) {
        throw new Error("error");
      }
      const body = {
        search: input.current.value,
      };

      const response = await instance.post(
        "/items/searchItems",
        JSON.stringify(body)
      );
      setAuctions(response.data.body.items);
    } catch (error) {
      setDispError(true);
      console.log(error);
    }
  };

  useEffect(() => {
    // Set a timeout to re-enable the button after 2 seconds
    if (isButtonDisabled) {
      const timer = setTimeout(() => {
        setIsButtonDisabled(false);
      }, 2000); // 2000 milliseconds = 2 seconds

      // Cleanup the timer on component unmount or when isButtonDisabled changes
      return () => clearTimeout(timer);
    }
  }, [isButtonDisabled]);

  useEffect(() => {
    window.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !isButtonDisabled) {
        searchFunc();
      }
    });
  });

  if (!isMounted) {
    return null;
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value);
  };

  const sortAuctions = (items: AuctionItem[]): AuctionItem[] => {
    if (sortOption === "amount") {
      return [...items].sort((a, b) => b.amount - a.amount);
    } else if (sortOption === "recent") {
      const now = new Date();
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      return [...items]
        .filter((item) => new Date(item.end_time) >= last24Hours)
        .sort(
          (a, b) =>
            new Date(b.end_time).getTime() - new Date(a.end_time).getTime()
        );
    } else if (sortOption === "endingSoon") {
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      return [...items]
        .filter(
          (item) =>
            new Date(item.end_time) <= tomorrow && item.status == "active"
        )
        .sort(
          (a, b) =>
            new Date(b.end_time).getTime() - new Date(a.end_time).getTime()
        );
    } else if (sortOption === "startedRecently") {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      return [...items]
        .filter(
          (item) =>
            new Date(item.start_time) <= yesterday && item.status == "active"
        )
        .sort(
          (a, b) =>
            new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
        );
    } else {
      return items; // Default order
    }
  };

  const setStorage = async (itemId: number) => {
    localStorage.setItem("id", itemId.toString());
    router.push("/auction_page");
  };

  function displayItem(item: AuctionItem): boolean {
    if (item.status == "active") {
      return true;
    }

    if (getToken() != null) {
      if (
        item.status == "bought" ||
        item.status == "archived" /*further time checks required */
      ) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  return (
    <div className="min-h-screen py-8 px-4">
      {/* Conditionally render BuyerInfo, LoginButton, and SignOutButton */}
      <div>{isMounted && getToken() != null && <BuyerInfo />}</div>
      <div>{isMounted && <LoginButton />}</div>
      <div>{isMounted && <SignOutButton />}</div>

      {/* Search bar section */}
      <div className="mt-6 px-4 flex flex-col sm:flex-row items-center gap-4 justify-between">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <input
            placeholder="Search for auction items..."
            ref={input}
            id="srchbar"
            className="px-4 py-2 rounded-md border border-gray-300 focus:ring-2 text-black focus:ring-blue-500 focus:outline-none w-full sm:w-80"
          />
          <button
            onClick={() => searchFunc()}
            disabled={isButtonDisabled}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            Search Items
          </button>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <select
            onChange={handleSortChange}
            value={sortOption}
            className="px-4 py-2 bg-white border-2 border-black rounded-md hover:bg-blue-50 text-black"
          >
            <option value="default">Sort None</option>
            <option value="amount">Price</option>
            <option value="startedRecently">Recently Started</option>
            <option value="endingSoon">Ending Soon</option>
            {isMounted && getToken() != null && (
              <option value="recent">Recently Sold</option>
            )}
          </select>
        </div>
      </div>

      {/* Auctions section */}
      <div className="mt-6 px-5">
        <div className="max-w-md">
          {auctions.length > 0 &&
            sortAuctions(auctions)
              .filter((item) => displayItem(item))
              .map((item) => (
                <div
                  key={item.auction_item_id}
                  className="mb-6 bg-gray-100 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
                >
                  <div
                    className="p-4"
                    onClick={() => setStorage(item.auction_item_id)}
                  >
                    <AuctionItemClickable aucItem={item} />
                  </div>
                </div>
              ))}
          {auctions.length == 0 && (
            <div>
              <label>No auctions found</label>
            </div>
          )}
        </div>
      </div>

      {/* Error message */}
      {dispError && (
        <p className="mt-4 text-red-600 font-semibold">
          There was an error retrieving the auction items.
        </p>
      )}
    </div>
  );
}
