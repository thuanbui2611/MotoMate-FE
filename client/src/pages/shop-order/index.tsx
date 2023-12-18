import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/store/ConfigureStore";
import Loading from "../../app/components/Loading";
import { MouseEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import Pagination from "../../app/components/Pagination";
import {
  getShopOrdersAsync,
  setShopOrdersParams,
  shopOrderSelectors,
} from "./ShopOrderSlice";
import LoaderButton from "../../app/components/LoaderButton";

export default function Orders() {
  const [searchParams, setSearchParams] = useSearchParams({});
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { userDetail, userLoading } = useAppSelector((state) => state.account);
  const userLogin = userDetail;
  const shopOrders = useAppSelector(shopOrderSelectors.selectAll);
  const { shopOrderLoaded, shopOrderParams, metaData } = useAppSelector(
    (state) => state.shopOrder
  );

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  //Get params value from url
  const pageNum = searchParams.get("pageNumber");
  const searchQueryParam = searchParams.get("SearchQuery");
  useEffect(() => {
    if (!userLogin && !userLoading) {
      toast.error("You need to login to view your shop order!");
      navigate("/login");
    }
  }, [userLogin, userLoading]);
  useEffect(() => {
    if (!pageNum || pageNum === "1") {
      setSearchParams((prev) => {
        prev.delete("pageNumber");
        return prev;
      });
      dispatch(setShopOrdersParams({ pageNumber: 1 }));
    } else {
      dispatch(setShopOrdersParams({ pageNumber: +pageNum }));
    }
  }, [pageNum, dispatch]);
  //search
  useEffect(() => {
    if (searchQueryParam) {
      const querySearch = searchQueryParam.trim();
      setSearchQuery(querySearch);
      dispatch(setShopOrdersParams({ SearchQuery: querySearch }));
    } else {
      setSearchParams((prev) => {
        prev.delete("SearchQuery");
        return prev;
      });
      dispatch(setShopOrdersParams({ SearchQuery: undefined }));
    }
  }, [searchQueryParam, dispatch]);

  const handleSearch = () => {
    if (searchQuery) {
      setSearchParams((prev) => {
        prev.set("SearchQuery", searchQuery.trim());
        return prev;
      });
    } else {
      setSearchParams((prev) => {
        prev.delete("SearchQuery");
        return prev;
      });
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };
  useEffect(() => {
    if (!shopOrderLoaded && userLogin) {
      dispatch(getShopOrdersAsync(userLogin.id));
    }
  }, [dispatch, shopOrderParams, userLogin]);

  return !metaData ? (
    <Loading />
  ) : (
    <>
      <div className="bg-white p-8 rounded-md w-full max-w-7xl mx-auto min-h-screen">
        <div className=" flex items-center justify-center pb-6">
          <div>
            <h2 className="mb-4 text-4xl lg:text-6xl tracking-tight font-extrabold text-gradient">
              Shop Orders
            </h2>
          </div>
        </div>
        <div className="flex bg-gray-50 items-center p-2 w-fit rounded-xl">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
          <input
            type="text"
            name="text"
            className="inputSearch bg-white rounded-lg"
            id="inputSearch"
            placeholder="Search order tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ boxShadow: "none" }}
          />
        </div>
        <div>
          <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
            <div className="inline-block min-w-full shadow rounded-lg overflow-hidden">
              <table className="min-w-full leading-normal">
                <thead>
                  <tr>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">
                      Order Tag
                    </th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">
                      Customers
                    </th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-sm font-bold text-gray-600 uppercase tracking-wider text-center">
                      Number of <br /> Vehicles
                    </th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">
                      Rent date
                    </th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">
                      Order date
                    </th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">
                      Total price
                    </th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {shopOrders.length === 0 && !shopOrderLoaded ? (
                    <tr>
                      <td colSpan={7}>
                        <div className="flex justify-center items-center w-full h-20">
                          <p className="text-black dark:text-white">
                            You have no orders yet!
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : shopOrderLoaded ? (
                    <tr>
                      <td colSpan={7}>
                        <div className="flex justify-center items-center w-full h-96">
                          <LoaderButton />
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <>
                      {shopOrders.map((order) => (
                        <tr
                          className=" cursor-pointer hover:bg-gray-100"
                          onClick={() =>
                            navigate(`/shop-orders/${order.parentOrderId}`)
                          }
                        >
                          <td className="px-5 pr-2 py-5 border-b border-gray-200">
                            <p className="text-blue-500 font-medium text-base w-fit">
                              #{order.parentOrderId}
                            </p>
                          </td>
                          <td className="px-5 py-5 border-b border-gray-200">
                            <p className="text-black font-medium text-base">
                              {order.username}
                            </p>
                          </td>
                          <td className="px-5 py-5 border-b border-gray-200 text-base">
                            <p className="text-black font-medium text-base text-center">
                              {order.shops
                                .map((shop) => shop.vehicles.length)
                                .reduce((a, b) => a + b, 0)}
                            </p>
                          </td>
                          <td className="px-5 py-5 border-b border-gray-200 text-base">
                            <div className="flex flex-col items-center justify-center w-fit">
                              <p className="text-black font-medium text-base">
                                {new Date(order.dateRent.from).toLocaleString(
                                  [],
                                  {
                                    year: "numeric",
                                    month: "2-digit",
                                    day: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </p>
                              <span className="text-black font-medium text-sm">
                                to
                              </span>
                              <p className="text-black font-medium text-base">
                                {new Date(order.dateRent.to).toLocaleString(
                                  [],
                                  {
                                    year: "numeric",
                                    month: "2-digit",
                                    day: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </p>
                            </div>
                          </td>
                          <td className="px-5 py-5 border-b border-gray-200 text-base">
                            <p className="text-black font-medium text-base">
                              {new Date(order.createdAt).toLocaleString([], {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </td>
                          <td className="px-5 py-5 border-b border-gray-200">
                            <p className="text-green-600 font-semibold text-base">
                              {order.totalAmmount.toLocaleString()} VND
                            </p>
                          </td>
                          <td className="px-5 py-5 border-b border-gray-200">
                            <span className="relative inline-block px-2 py-1 font-bold text-blue-600 bg-blue-200 leading-tight rounded-full text-sm">
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex justify-center items-center">
            <Pagination
              metaData={metaData}
              onPageChange={(page: number) => {
                setSearchParams((prev) => {
                  prev.set("pageNumber", page.toString());
                  return prev;
                });
              }}
              loading={shopOrderLoaded}
            />
          </div>
        </div>
      </div>
    </>
  );
}
