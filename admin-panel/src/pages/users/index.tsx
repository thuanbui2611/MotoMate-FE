import { useEffect, useState } from "react";
import Breadcrumb from "../../app/components/Breadcrumb";
import { Collection } from "../../app/models/Collection";
import Pagination from "../../app/components/Pagination";
import ConfirmDeleteDialog from "../../app/components/ConfirmDeleteDialog";
import { useAppDispatch, useAppSelector } from "../../app/store/ConfigureStore";
import Loader from "../../app/components/Loader";
import { useSearchParams } from "react-router-dom";
import {
  deleteUserAsync,
  getUsersAsync,
  setStatusUser,
  setUserParams,
  updateIsLockOfUserAsync,
  userSelectors,
} from "./UserSlice";
import { Role, UserDetail } from "../../app/models/User";
import UserDetails from "./UserDetails";
import UserForm from "./UserForm";
import { deleteImage } from "../../app/utils/Cloudinary";
import Autocomplete from "@mui/material/Autocomplete";
import agent from "../../app/api/agent";
import { TextField } from "@mui/material";

export default function UsersPage() {
  const [pageNumber, setPageNumber] = useSearchParams({ pageNumber: "" });
  const [actionName, setActionName] = useState(String);
  const [openEditForm, setOpenEditForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [confirmDeleteDiaglog, setConfirmDeleteDiaglog] = useState(false);
  const [userDeleted, setUserDeleted] = useState<UserDetail>({} as UserDetail);
  const [openDetails, setOpenDetails] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams({});
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);
  const [isStartFilter, setIsStartFilter] = useState(false);
  const users = useAppSelector(userSelectors.selectAll);
  const { userLoaded, metaData, userParams } = useAppSelector(
    (state) => state.user
  );
  const userLogin = useAppSelector((state) => state.account.user);
  const dispatch = useAppDispatch();

  //Get params value from url
  const pageNum = pageNumber.get("pageNumber");
  const searchQueryParam = searchParams.get("Query");
  const rolesParam = searchParams.get("Roles");

  //fetch role for select and filter
  useEffect(() => {
    try {
      agent.User.getAllRole().then((response) => {
        setRoles(response);
      });
    } catch (error) {
      console.log(error);
    }
  }, []);

  //Roles filter
  useEffect(() => {
    if (roles.length > 0) {
      if (rolesParam !== "") {
        let rolesFiltered: string[] = [];
        if (rolesParam) {
          rolesFiltered = rolesParam.split("%2C");
        } else if (userParams.Roles && userParams.Roles.length > 0) {
          rolesFiltered = userParams.Roles;
        }
        const rolesSelected = roles.filter((role) =>
          rolesFiltered.includes(role.name)
        );
        setSelectedRoles(rolesSelected);

        dispatch(setUserParams({ Roles: rolesFiltered }));
      } else {
        setSearchParams((prev) => {
          prev.delete("Roles");
          return prev;
        });
      }
    } else
      switch (true) {
        case roles === null || typeof roles === "undefined":
          console.log("roles is null or undefined");
          break;
        default:
      }
  }, [roles, rolesParam]);
  //Pagination

  useEffect(() => {
    if (!pageNum || pageNum === "1") {
      setPageNumber((prev) => {
        prev.delete("pageNumber");
        return prev;
      });
      dispatch(setUserParams({ pageNumber: 1 }));
    } else {
      dispatch(setUserParams({ pageNumber: +pageNum }));
    }
  }, [pageNum, dispatch]);
  //
  //search
  useEffect(() => {
    if (searchQueryParam) {
      const querySearch = searchQueryParam.trim();
      setSearchQuery(querySearch);
      dispatch(setUserParams({ Query: querySearch }));
    } else {
      if (userParams.Query) {
        setSearchQuery(userParams.Query);
      } else {
        dispatch(setUserParams({ Query: undefined }));
      }
    }
  }, [searchQueryParam, dispatch]);
  //Starting filter
  useEffect(() => {
    if (!isStartFilter) {
      if (pageNum || searchQueryParam || rolesParam) {
        setIsStartFilter(true);
      }
    }
  }, [userParams, pageNum]);

  const handleSelectUser = (actionName: string, user?: UserDetail) => {
    setOpenEditForm((cur) => !cur);
    if (user) {
      setSelectedUser(user);
    }
    setActionName(actionName);
  };

  const handleOpenDetails = (user: UserDetail) => {
    setSelectedUser(user);
    setOpenDetails((cur) => !cur);
  };

  const cancelEditForm = () => {
    setOpenEditForm((cur) => !cur);
    setSelectedUser(null);
  };

  async function handleDeleteUser(userDeleted: UserDetail) {
    const response = await dispatch(deleteUserAsync(userDeleted.username));
    if (
      response.meta.requestStatus === "fulfilled" &&
      userDeleted.image.publicId
    ) {
      await deleteImage(userDeleted.image.publicId);
    }
  }
  const openConfirmDeleteDiaglog = (user: UserDetail) => {
    setConfirmDeleteDiaglog((cur) => !cur);
    setUserDeleted(user);
  };

  const cancelDetailsDialog = () => {
    setSelectedUser(null);
    setOpenDetails((cur) => !cur);
  };

  const cancelConfirmDeleteDiaglog = () => setConfirmDeleteDiaglog(false);

  const handleChangeRolesFilter = (
    event: React.SyntheticEvent<Element, Event>,
    newValue: Role[]
  ) => {
    if (newValue.length > 0) {
      const rolesFiltered = newValue?.map((role) => role.name);
      if (searchParams.get("Roles")) {
        setSearchParams((prev) => {
          prev.set("Roles", rolesFiltered?.join("%2C") || "");
          return prev;
        });
      } else {
        setSearchParams((prev) => {
          prev.append("Roles", rolesFiltered?.join("%2C") || "");
          return prev;
        });
      }
    } else {
      setSearchParams((prev) => {
        prev.delete("Roles");
        return prev;
      });
      dispatch(setUserParams({ Roles: [] }));
      setSelectedRoles([]);
    }
    setIsStartFilter(true);
    setSearchParams((prev) => {
      prev.set("pageNumber", "1");
      return prev;
    });
  };

  useEffect(() => {
    if (!userLoaded && roles.length > 0) {
      if (isStartFilter) {
        if (
          (userParams.Roles && userParams.Roles.length > 0) ||
          userParams.Query ||
          userParams.pageSize
        ) {
          dispatch(getUsersAsync());
        }
      } else if (searchParams.size === 0 && users.length === 0) {
        dispatch(getUsersAsync());
      }
    }
  }, [dispatch, userParams, isStartFilter]);

  const handleSearch = () => {
    if (searchQuery) {
      setSearchParams((prev) => {
        prev.set("Query", searchQuery.trim());
        return prev;
      });
      setSearchParams((prev) => {
        prev.set("pageNumber", "1");
        return prev;
      });
    } else {
      setSearchParams((prev) => {
        prev.delete("Query");
        return prev;
      });
      dispatch(setUserParams({ Query: undefined }));
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handleLockUser = async (user: UserDetail) => {
    dispatch(setStatusUser(user.id));
    await dispatch(updateIsLockOfUserAsync(user.id));
  };
  const handleEditRole = (actionName: string, user?: UserDetail) => {
    setOpenEditForm((cur) => !cur);
    if (user) {
      setSelectedUser(user);
    }
    setActionName(actionName);
  };
  if (!metaData) {
    return <Loader />;
  } else
    return (
      <>
        <Breadcrumb pageName="User" />
        <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
          <div className="flex justify-start mb-3">
            {/* <button
              onClick={() => handleSelectUser("Add a new user")}
              type="button"
              className="flex items-center text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-3 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
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
              <span>Add new User</span>
            </button> */}
            <div className="flex items-center ml-2 order-2 md:order-1">
              <label htmlFor="simple-search" className="sr-only">
                Search
              </label>
              <div className="w-full">
                <input
                  type="text"
                  className="bg-gray-50 border border-gray-300 text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400  dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <button
                onClick={handleSearch}
                className="p-2.5 ml-2 text-sm font-medium text-white bg-blue-700 rounded-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                <svg
                  className="w-4 h-4"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                  />
                </svg>
                <span className="sr-only">Search</span>
              </button>
            </div>
          </div>
          <div className="flex overflow-auto scrollbar max-h-[333px] justify-center items-center">
            <div className="flex flex-wrap space-x-2 space-y-2 justify-start items-center mb-2 w-full">
              <div className="max-w-[20%] min-w-[200px] flex-1 ml-2 mt-2">
                {/* Filter Roles */}
                <Autocomplete
                  className="bg-white rounded-md"
                  fullWidth={true}
                  size="small"
                  multiple={true}
                  disablePortal
                  value={selectedRoles}
                  options={roles}
                  getOptionLabel={(option) => option.name}
                  onChange={(event, newValue) =>
                    handleChangeRolesFilter(event, newValue)
                  }
                  renderInput={(params) => (
                    <TextField {...params} placeholder="Filter by Roles" />
                  )}
                />
              </div>
            </div>
          </div>
          <div className="max-w-full overflow-x-auto scrollbar">
            <table className="w-full table-auto">
              <thead>
                <tr className=" bg-gray-2 text-left dark:bg-meta-4  font-bold">
                  <th className="min-w-[300px] text-left py-4 px-4 text-black dark:text-white xl:pl-11">
                    Full Name
                  </th>
                  <th className="min-w-[120px] py-4 px-4 text-black dark:text-white">
                    Username
                  </th>

                  <th className="min-w-[120px] py-4 px-4 text-black dark:text-white">
                    Email
                  </th>
                  <th className="min-w-[120px] py-4 px-4 text-black dark:text-white">
                    PhoneNumber
                  </th>

                  <th className="min-w-[120px] py-4 px-4 text-black dark:text-white">
                    Status
                  </th>
                  <th className="py-4 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {userLoaded ? (
                  <tr>
                    <td colSpan={8} className="text-center">
                      <Loader className="h-70" />
                    </td>
                  </tr>
                ) : (
                  <>
                    {users.map((user) => (
                      <tr
                        className="dark:border-strokedark border-[#eee] border-b"
                        key={user.id}
                      >
                        <td className="py-5 px-4 pl-9 xl:pl-11">
                          <div className="flex items-center h-full ">
                            <div className="h-12 w-12 rounded-md">
                              <img
                                className="h-full w-full rounded-md object-cover"
                                src={user.image.imageUrl}
                                alt="User image"
                              />
                            </div>
                            <div className="ml-3 flex flex-col flex-1">
                              <h5 className="font-semibold text-black dark:text-white line-clamp-2">
                                {user.fullName}
                              </h5>
                              <div className="flex items-center justify-start gap-1">
                                <p
                                  className={`text-sm font-semibold ${
                                    user.roles[0].toLowerCase() === "admin"
                                      ? "text-gradient"
                                      : user.roles[0].toLowerCase() === "staff"
                                      ? "text-blue-500"
                                      : user.roles[0].toLowerCase() === "lessor"
                                      ? "text-green-500"
                                      : " text-blue-gray-800"
                                  } `}
                                >
                                  {user.roles[0]}
                                </p>
                                {userLogin?.role === "Staff" ? (
                                  <></>
                                ) : (
                                  <div
                                    className=" cursor-pointer hover:text-primary hover:bg-primary/30 rounded-full "
                                    onClick={() =>
                                      handleEditRole(`Update User`, user)
                                    }
                                  >
                                    <svg
                                      className="fill-current"
                                      width="14px"
                                      height="14px"
                                      viewBox="0 -0.5 21 21"
                                      version="1.1"
                                      xmlns="http://www.w3.org/2000/svg"
                                      xmlnsXlink="http://www.w3.org/1999/xlink"
                                      fill="none"
                                    >
                                      <g
                                        id="SVGRepo_bgCarrier"
                                        strokeWidth="0"
                                      ></g>
                                      <g
                                        id="SVGRepo_tracerCarrier"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      ></g>
                                      <g id="SVGRepo_iconCarrier">
                                        <defs> </defs>
                                        <g
                                          id="Page-1"
                                          fill="none"
                                          fillRule="evenodd"
                                        >
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
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-5">
                          <h5 className="font-medium text-black dark:text-white">
                            {user.username}
                          </h5>
                        </td>

                        <td className="px-4 py-5">
                          <h5 className="font-medium text-blue-600">
                            {user.email}
                          </h5>
                        </td>
                        <td className="px-4 py-5">
                          <h5 className="font-medium text-black dark:text-white">
                            {user.phoneNumber}
                          </h5>
                        </td>

                        <td className="px-4 py-5">
                          {userLogin?.role === "Staff" ? (
                            <span
                              className={`ml-1 text-sm rounded-full px-2 py-1 font-semibold bg-opacity-10 text-black 
                                  ${
                                    user.islocked
                                      ? "bg-danger text-meta-1"
                                      : "bg-success text-meta-3"
                                  }`}
                            >
                              {user.islocked ? "Locked" : "Active"}
                            </span>
                          ) : (
                            <div className="flex">
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="sr-only peer"
                                  checked={user.islocked}
                                  onChange={() => handleLockUser(user)}
                                />
                                <div className="w-11 h-6 bg-success rounded-full   dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-blue-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-blue-gray-600 peer-checked:bg-danger"></div>
                                <>
                                  <span
                                    className={`ml-1 text-sm rounded-full px-1 font-semibold bg-opacity-10 text-black 
                                  ${
                                    user.islocked
                                      ? "bg-danger text-meta-1"
                                      : "bg-success text-meta-3"
                                  }`}
                                  >
                                    {user.islocked ? "Locked" : "Active"}
                                  </span>
                                </>
                              </label>
                            </div>
                          )}
                        </td>
                        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                          <div className="flex items-center space-x-3.5">
                            <button
                              className="hover:text-primary"
                              onClick={() => handleOpenDetails(user)}
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
                            </button>
                            {userLogin?.role === "Staff" ? (
                              <></>
                            ) : (
                              <button
                                className="hover:text-red-600 hover:bg-red-600/30 rounded-full p-1"
                                onClick={() => openConfirmDeleteDiaglog(user)}
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
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-center">
            <Pagination
              metaData={metaData}
              onPageChange={(page: number) => {
                setPageNumber((prev) => {
                  prev.set("pageNumber", page.toString());
                  return prev;
                });
              }}
              loading={userLoaded}
            />
          </div>
        </div>
        {openDetails && (
          <UserDetails user={selectedUser} onClose={cancelDetailsDialog} />
        )}
        {openEditForm && (
          <UserForm
            user={selectedUser}
            cancelEdit={cancelEditForm}
            actionName={actionName}
          />
        )}

        {confirmDeleteDiaglog && (
          <ConfirmDeleteDialog
            objectName={userDeleted.username}
            actionDelete={() => handleDeleteUser(userDeleted)}
            cancelDelete={cancelConfirmDeleteDiaglog}
          />
        )}
      </>
    );
}
