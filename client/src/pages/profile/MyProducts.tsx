import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Vehicle } from "../../app/models/Vehicle";
import { useAppDispatch, useAppSelector } from "../../app/store/ConfigureStore";
import {
  deleteProductAsync,
  getProductsOfUserAsync,
  profileSelectors,
  setProductOfUserParams,
} from "./ProfileSlice";
import { toast } from "react-toastify";
import VehicleForm from "./VehicleForm";
import ConfirmDeleteDialog from "../../app/components/ConfirmDeleteDialog";
import { deleteImages } from "../../app/utils/Cloudinary";
import LoaderButton from "../../app/components/LoaderButton";
import { ConvertToDateStr } from "../../app/utils/ConvertDatetimeToStr";
import Loading from "../../app/components/Loading";
import Pagination from "../../app/components/Pagination";

export default function MyProducts() {
  const [searchParams, setSearchParams] = useSearchParams({});
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [actionName, setActionName] = useState(String);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [openEditForm, setOpenEditForm] = useState(false);
  const [isOpenConfirmDeleteDialog, setIsOpenConfirmDeleteDialog] =
    useState(false);
  const [vehicleDeleted, setVehicleDeleted] = useState<Vehicle>({} as Vehicle);
  const [openDetails, setOpenDetails] = useState(false);
  const { productOfUserLoaded, metaData, productOfUserParams } = useAppSelector(
    (state) => state.profile
  );
  const productOfUser = useAppSelector(profileSelectors.selectAll);
  const { userDetail, userLoading } = useAppSelector((state) => state.account);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  //Get params value from url
  const pageNum = searchParams.get("pageNumber");
  const searchQueryParam = searchParams.get("Search");

  useEffect(() => {
    if (!pageNum || pageNum === "1") {
      setSearchParams((prev) => {
        prev.delete("pageNumber");
        return prev;
      });
      dispatch(setProductOfUserParams({ pageNumber: 1 }));
    } else {
      dispatch(setProductOfUserParams({ pageNumber: +pageNum }));
    }
  }, [pageNum, dispatch]);
  //search
  useEffect(() => {
    if (searchQueryParam) {
      const querySearch = searchQueryParam.trim();
      setSearchQuery(querySearch);
      dispatch(setProductOfUserParams({ Search: querySearch }));
    } else {
      setSearchParams((prev) => {
        prev.delete("Search");
        return prev;
      });
      dispatch(setProductOfUserParams({ Search: undefined }));
    }
  }, [searchQueryParam, dispatch]);

  const handleSearch = () => {
    if (searchQuery) {
      setSearchParams((prev) => {
        prev.set("Search", searchQuery.trim());
        return prev;
      });
    } else {
      setSearchParams((prev) => {
        prev.delete("Search");
        return prev;
      });
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };
  //end search
  //Fetch data
  useEffect(() => {
    if (!userDetail && !userLoading) {
      toast.error("Please login to continue");
      navigate("/login");
    } else if (!productOfUserLoaded && userDetail) {
      dispatch(getProductsOfUserAsync(userDetail.id));
    }
  }, [dispatch, productOfUserParams, userDetail]);

  //end of fetch data
  const handleSelectVehicle = (actionName: string, vehicle?: Vehicle) => {
    setOpenEditForm(true);
    if (vehicle) {
      setSelectedVehicle(vehicle);
    }
    setActionName(actionName);
  };

  const handleOpenDetails = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setOpenDetails((cur) => !cur);
  };
  async function handleDeleteVehicle(vehicleDeleted: Vehicle) {
    const response = await dispatch(deleteProductAsync(vehicleDeleted.id));
    if (response.meta.requestStatus === "fulfilled" && vehicleDeleted.images) {
      await deleteImages(vehicleDeleted.images);
    }
    setIsOpenConfirmDeleteDialog(false);
  }
  const openConfirmDeleteDiaglog = (vehicle: Vehicle) => {
    setIsOpenConfirmDeleteDialog((cur) => !cur);
    setVehicleDeleted(vehicle);
  };
  const cancelEditForm = () => {
    setOpenEditForm((cur) => !cur);
    setSelectedVehicle(null);
  };
  const cancelDetailsDialog = () => {
    setSelectedVehicle(null);
    setOpenDetails((cur) => !cur);
  };

  const cancelConfirmDeleteDialog = () => setIsOpenConfirmDeleteDialog(false);

  return !metaData ? (
    <Loading />
  ) : (
    <>
      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default sm:px-7.5 xl:pb-1 min-h-screen">
        <div className="flex flex-col sm:flex-row justify-start items-start sm:justify-between sm:items-center">
          <div className="flex bg-gray-50 items-center p-2 w-fit rounded-xl shadow-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7 text-gray-600 cursor-pointer hover:text-gray-900 hover:bg-gray-300 rounded-full p-1"
              viewBox="0 0 20 20"
              fill="currentColor"
              onClick={() => handleSearch()}
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
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{ boxShadow: "none" }}
            />
          </div>
          <div className="flex items-end justify-end w-full sm:w-fit mt-4 sm:mt-0">
            <button
              onClick={() => handleSelectVehicle("Add new Vehicle")}
              type="button"
              className="flex items-center text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-2 py-1 md:px-3 md:py-2.5  focus:outline-none "
            >
              <svg
                className="h-5 w-5 mr-2"
                viewBox="0 0 21.00 21.00"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                fill="#ffffff"
                stroke="#ffffff"
              >
                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g
                  id="SVGRepo_tracerCarrier"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></g>
                <g id="SVGRepo_iconCarrier">
                  <g
                    id="Page-1"
                    strokeWidth="0.00021000000000000004"
                    fill="none"
                    fillRule="evenodd"
                  >
                    <g
                      id="Dribbble-Light-Preview"
                      transform="translate(-419.000000, -520.000000)"
                      fill="#ffffff"
                    >
                      <g
                        id="icons"
                        transform="translate(56.000000, 160.000000)"
                      >
                        <path
                          d="M374.55,369 L377.7,369 L377.7,371 L374.55,371 L374.55,374 L372.45,374 L372.45,371 L369.3,371 L369.3,369 L372.45,369 L372.45,366 L374.55,366 L374.55,369 Z M373.5,378 C368.86845,378 365.1,374.411 365.1,370 C365.1,365.589 368.86845,362 373.5,362 C378.13155,362 381.9,365.589 381.9,370 C381.9,374.411 378.13155,378 373.5,378 L373.5,378 Z M373.5,360 C367.70085,360 363,364.477 363,370 C363,375.523 367.70085,380 373.5,380 C379.29915,380 384,375.523 384,370 C384,364.477 379.29915,360 373.5,360 L373.5,360 Z"
                          id="plus_circle-[#ffffff]"
                        ></path>
                      </g>
                    </g>
                  </g>
                </g>
              </svg>
              <span className="text-xs sm:text-sm">Add Vehicle</span>
            </button>
          </div>
        </div>

        <div className="max-w-full overflow-x-auto scrollbar rounded-lg border-gray-300 border shadow-md my-5">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-100 text-left font-bold">
                <th className="min-w-[220px] py-4 px-4 text-black xl:pl-11 border-b-2 border-gray-200">
                  Vehicle Name
                </th>
                <th className="min-w-[120px] py-4 px-4 text-black border-b-2 border-gray-200">
                  License Plate
                </th>
                <th className="min-w-[120px] py-4 px-4 text-black border-b-2 border-gray-200">
                  Insurance Expiry
                </th>
                <th className="min-w-[120px] py-4 px-4 text-black border-b-2 border-gray-200">
                  Location
                </th>
                <th className="min-w-[120px] py-4 px-4 text-black border-b-2 border-gray-200">
                  Price (VND)
                </th>

                <th className="min-w-[120px] py-4 px-4 text-black border-b-2 border-gray-200">
                  Status
                </th>
                <th className="py-4 px-4  border-b-2 border-gray-200">
                  {/* <SelectPageSize onSelectPageSize={handleSelectPageSize} /> */}
                </th>
              </tr>
            </thead>
            <tbody>
              {productOfUserLoaded ? (
                <tr>
                  <td colSpan={8}>
                    <div className="flex justify-center items-center w-full h-60">
                      <LoaderButton />
                    </div>
                  </td>
                </tr>
              ) : (
                <>
                  {!productOfUserLoaded && productOfUser.length === 0 ? (
                    <tr>
                      <td colSpan={8}>
                        <div className="flex justify-center items-center w-full h-60">
                          <p className="text-black dark:text-white">
                            No Items Found.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    productOfUser &&
                    productOfUser.map((vehicle) => (
                      <tr
                        key={vehicle.id}
                        className="dark:border-strokedark border-[#eee] border-b"
                      >
                        <td className="py-5 px-4 pl-9 xl:pl-11">
                          <div className="flex items-center h-full ">
                            <div className="h-12 w-12 rounded-md">
                              <img
                                className="h-full w-full rounded-md object-cover"
                                src={vehicle.images[0].image || undefined}
                                alt="Vehicle image"
                              />
                            </div>
                            <div className="ml-3 flex flex-1 flex-col">
                              <h5 className="font-medium text-black">
                                {vehicle.specifications.modelName}
                              </h5>
                              <p className="text-sm font-medium text-gray-600">
                                {vehicle.specifications.color}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 px-4">
                          <p className="text-black font-normal">
                            {vehicle.licensePlate}
                          </p>
                        </td>
                        <td className="py-5 px-4">
                          <p className="text-black font-normal">
                            {ConvertToDateStr(vehicle.insuranceExpiry)}
                          </p>
                        </td>
                        <td className="py-5 px-4">
                          <p className="text-black font-normal">
                            {vehicle.city.replace(/Thành Phố |Tỉnh /g, "")}
                          </p>
                        </td>
                        <td className="py-5 px-4">
                          <p className="text-green-500 font-semibold">
                            {vehicle.price.toLocaleString()}
                          </p>
                        </td>

                        <td className="py-5 px-4">
                          <p
                            className={`inline-flex rounded-full bg-opacity-10 py-1 px-3 text-sm font-bold ${
                              vehicle.status.toLowerCase() === "approved"
                                ? " text-green-600 bg-green-600"
                                : vehicle.status.toLowerCase() === "pending"
                                ? " text-blue-600 bg-blue-600 "
                                : vehicle.status.toLowerCase() === "denied"
                                ? " text-red-600 bg-red-600"
                                : ""
                            } `}
                          >
                            {vehicle.status}
                          </p>
                        </td>
                        {/* <td className="py-5 px-4">
                      <p className="inline-flex rounded-full bg-red-600 bg-opacity-10 py-1 px-3 text-sm font-bold text-red-600">
                        Renting
                      </p>
                    </td> */}
                        <td className="py-5 px-4">
                          <div className="flex items-center space-x-3.5">
                            {vehicle.status.toLowerCase() === "approved" && (
                              <Link
                                to={"/product-detail/" + vehicle.id}
                                className="hover:text-primary"
                              >
                                <svg
                                  className="fill-current"
                                  width="18"
                                  height="18"
                                  viewBox="0 0 18 18"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M8.99981 14.8219C3.43106 14.8219 0.674805 9.50624 0.562305 9.28124C0.47793 9.11249 0.47793 8.88749 0.562305 8.71874C0.674805 8.49374 3.43106 3.20624 8.99981 3.20624C14.5686 3.20624 17.3248 8.49374 17.4373 8.71874C17.5217 8.88749 17.5217 9.11249 17.4373 9.28124C17.3248 9.50624 14.5686 14.8219 8.99981 14.8219ZM1.85605 8.99999C2.4748 10.0406 4.89356 13.5562 8.99981 13.5562C13.1061 13.5562 15.5248 10.0406 16.1436 8.99999C15.5248 7.95936 13.1061 4.44374 8.99981 4.44374C4.89356 4.44374 2.4748 7.95936 1.85605 8.99999Z"
                                    fill=""
                                  />
                                  <path
                                    d="M9 11.3906C7.67812 11.3906 6.60938 10.3219 6.60938 9C6.60938 7.67813 7.67812 6.60938 9 6.60938C10.3219 6.60938 11.3906 7.67813 11.3906 9C11.3906 10.3219 10.3219 11.3906 9 11.3906ZM9 7.875C8.38125 7.875 7.875 8.38125 7.875 9C7.875 9.61875 8.38125 10.125 9 10.125C9.61875 10.125 10.125 9.61875 10.125 9C10.125 8.38125 9.61875 7.875 9 7.875Z"
                                    fill=""
                                  />
                                </svg>
                              </Link>
                            )}
                            <button
                              className="  hover:text-primary hover:bg-primary/30 rounded-full "
                              onClick={() =>
                                handleSelectVehicle("Edit Vehicle", vehicle)
                              }
                            >
                              <svg
                                className="fill-current"
                                width="18px"
                                height="18px"
                                viewBox="0 -0.5 21 21"
                                version="1.1"
                                xmlns="http://www.w3.org/2000/svg"
                                xmlnsXlink="http://www.w3.org/1999/xlink"
                                fill="none"
                              >
                                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                                <g
                                  id="SVGRepo_tracerCarrier"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                ></g>
                                <g id="SVGRepo_iconCarrier">
                                  <defs> </defs>
                                  <g id="Page-1" fill="none" fillRule="evenodd">
                                    <g
                                      id="Dribbble-Light-Preview"
                                      transform="translate(-339.000000, -360.000000)"
                                      fill="#000000"
                                    >
                                      <g
                                        id="icons"
                                        transform="translate(56.000000, 160.000000)"
                                      >
                                        <path
                                          d="M283,220 L303.616532,220 L303.616532,218.042095 L283,218.042095 L283,220 Z M290.215786,213.147332 L290.215786,210.51395 L296.094591,205.344102 L298.146966,207.493882 L292.903151,213.147332 L290.215786,213.147332 Z M299.244797,202.64513 L301.059052,204.363191 L299.645788,205.787567 L297.756283,203.993147 L299.244797,202.64513 Z M304,204.64513 L299.132437,200 L288.154133,209.687714 L288.154133,215.105237 L293.78657,215.105237 L304,204.64513 Z"
                                          className="fill-current"
                                        ></path>
                                      </g>
                                    </g>
                                  </g>
                                </g>
                              </svg>
                            </button>
                            <button
                              className="hover:text-red-600 hover:bg-red-600/30 rounded-full p-1"
                              onClick={() => openConfirmDeleteDiaglog(vehicle)}
                            >
                              <svg
                                className="fill-current"
                                width="18"
                                height="18"
                                viewBox="0 0 18 18"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M13.7535 2.47502H11.5879V1.9969C11.5879 1.15315 10.9129 0.478149 10.0691 0.478149H7.90352C7.05977 0.478149 6.38477 1.15315 6.38477 1.9969V2.47502H4.21914C3.40352 2.47502 2.72852 3.15002 2.72852 3.96565V4.8094C2.72852 5.42815 3.09414 5.9344 3.62852 6.1594L4.07852 15.4688C4.13477 16.6219 5.09102 17.5219 6.24414 17.5219H11.7004C12.8535 17.5219 13.8098 16.6219 13.866 15.4688L14.3441 6.13127C14.8785 5.90627 15.2441 5.3719 15.2441 4.78127V3.93752C15.2441 3.15002 14.5691 2.47502 13.7535 2.47502ZM7.67852 1.9969C7.67852 1.85627 7.79102 1.74377 7.93164 1.74377H10.0973C10.2379 1.74377 10.3504 1.85627 10.3504 1.9969V2.47502H7.70664V1.9969H7.67852ZM4.02227 3.96565C4.02227 3.85315 4.10664 3.74065 4.24727 3.74065H13.7535C13.866 3.74065 13.9785 3.82502 13.9785 3.96565V4.8094C13.9785 4.9219 13.8941 5.0344 13.7535 5.0344H4.24727C4.13477 5.0344 4.02227 4.95002 4.02227 4.8094V3.96565ZM11.7285 16.2563H6.27227C5.79414 16.2563 5.40039 15.8906 5.37227 15.3844L4.95039 6.2719H13.0785L12.6566 15.3844C12.6004 15.8625 12.2066 16.2563 11.7285 16.2563Z"
                                  fill=""
                                />
                                <path
                                  d="M9.00039 9.11255C8.66289 9.11255 8.35352 9.3938 8.35352 9.75942V13.3313C8.35352 13.6688 8.63477 13.9782 9.00039 13.9782C9.33789 13.9782 9.64727 13.6969 9.64727 13.3313V9.75942C9.64727 9.3938 9.33789 9.11255 9.00039 9.11255Z"
                                  fill=""
                                />
                                <path
                                  d="M11.2502 9.67504C10.8846 9.64692 10.6033 9.90004 10.5752 10.2657L10.4064 12.7407C10.3783 13.0782 10.6314 13.3875 10.9971 13.4157C11.0252 13.4157 11.0252 13.4157 11.0533 13.4157C11.3908 13.4157 11.6721 13.1625 11.6721 12.825L11.8408 10.35C11.8408 9.98442 11.5877 9.70317 11.2502 9.67504Z"
                                  fill=""
                                />
                                <path
                                  d="M6.72245 9.67504C6.38495 9.70317 6.1037 10.0125 6.13182 10.35L6.3287 12.825C6.35683 13.1625 6.63808 13.4157 6.94745 13.4157C6.97558 13.4157 6.97558 13.4157 7.0037 13.4157C7.3412 13.3875 7.62245 13.0782 7.59433 12.7407L7.39745 10.2657C7.39745 9.90004 7.08808 9.64692 6.72245 9.67504Z"
                                  fill=""
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </>
              )}
            </tbody>
          </table>
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
            loading={productOfUserLoaded}
          />
        </div>
      </div>
      {/* {openDetails && (
          <VehicleDetails
            vehicle={selectedVehicle}
            onClose={cancelDetailsDialog}
          />
        )} */}
      {openEditForm && (
        <VehicleForm
          vehicle={selectedVehicle}
          cancelForm={cancelEditForm}
          actionName={actionName}
          userLoggedIn={userDetail}
        />
      )}

      {isOpenConfirmDeleteDialog && (
        <ConfirmDeleteDialog
          objectName={vehicleDeleted.licensePlate}
          actionDelete={() => handleDeleteVehicle(vehicleDeleted)}
          onClose={cancelConfirmDeleteDialog}
          color="red"
        />
      )}
    </>
  );
}
