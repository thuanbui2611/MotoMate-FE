import { useEffect, useRef, useState } from "react";
import { User } from "../models/User";
import { useAppDispatch, useAppSelector } from "../store/ConfigureStore";
import { signOut } from "../../pages/account/AccountSlice";
import { Link } from "react-router-dom";
import LoaderButton from "./LoaderButton";

interface Props {
  user: User;
}

export default function MenuItemUser({ user }: Props) {
  const [countItemCart, setCountItemCart] = useState(0);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const triggerUserMenu = useRef<any>(null);
  const dropdownUserMenu = useRef<any>(null);

  const { cart, cartLoading } = useAppSelector((state) => state.cart);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (cart) {
      let count = 0;
      cart.shops.forEach((shop) => {
        count += shop.vehicles.length;
      });
      setCountItemCart(count);
    }
  }, [cart]);

  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!dropdownUserMenu.current) return;
      if (
        !isUserMenuOpen ||
        dropdownUserMenu.current.contains(target) ||
        triggerUserMenu.current.contains(target)
      )
        return;
      setIsUserMenuOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!isUserMenuOpen || keyCode !== 27) return;
      setIsUserMenuOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });
  return (
    <>
      <li className="font-sans block lg:inline-block mr-4 pt-1 lg:mt-0 lg:ml-6 text-black hover:text-gray-700">
        <Link to="/my-cart" role="button" className="relative flex">
          <svg
            className="flex-1 w-8 h-8 fill-current text-white"
            viewBox="0 0 24 24"
          >
            <path d="M17,18C15.89,18 15,18.89 15,20A2,2 0 0,0 17,22A2,2 0 0,0 19,20C19,18.89 18.1,18 17,18M1,2V4H3L6.6,11.59L5.24,14.04C5.09,14.32 5,14.65 5,15A2,2 0 0,0 7,17H19V15H7.42A0.25,0.25 0 0,1 7.17,14.75C7.17,14.7 7.18,14.66 7.2,14.63L8.1,13H15.55C16.3,13 16.96,12.58 17.3,11.97L20.88,5.5C20.95,5.34 21,5.17 21,5A1,1 0 0,0 20,4H5.21L4.27,2M7,18C5.89,18 5,18.89 5,20A2,2 0 0,0 7,22A2,2 0 0,0 9,20C9,18.89 8.1,18 7,18Z" />
          </svg>
          <span
            className={`absolute right-0 top-0 rounded-full w-4 h-4 top right p-0 m-0 text-white font-mono text-sm  leading-tight text-center 
          ${cartLoading ? "bg-transparent" : "bg-red-600 "}`}
          >
            {cartLoading ? <LoaderButton /> : countItemCart}
          </span>
        </Link>
      </li>
      <button
        ref={triggerUserMenu}
        onClick={() => {
          setIsUserMenuOpen(!isUserMenuOpen);
        }}
        type="button"
        className={` ${
          isUserMenuOpen ? "focus:ring-2 focus:ring-orange-based" : ""
        } flex w-8 h-8 mr-3 text-sm bg-gray-800 rounded-full md:mr-0`}
        // id="user-menu-button"
        // aria-expanded={isUserMenuOpen ? "true" : "false"}
        // data-dropdown-toggle="user-dropdown"
        // data-toggle="dropdown"
        // data-dropdown-placement="bottom"
      >
        <img
          className="w-full h-full rounded-full"
          src={
            user.avatar
              ? user.avatar
              : require("../../app/assets/images/icon/user.png")
          }
          alt="user photo"
        />
      </button>
      <div
        className={`${
          isUserMenuOpen ? "" : "hidden"
        } absolute z-50 my-4 top-10 right-14 md:right-auto text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow`}
        ref={dropdownUserMenu}
      >
        <div className="px-4 py-3">
          <span className="block text-sm text-gray-900 font-bold">
            {user?.name}
          </span>
          <span className="block text-sm  text-gray-500 truncate">
            {user?.role}
          </span>
        </div>
        <ul className="py-2" aria-labelledby="user-menu-button">
          <li>
            <Link
              to={"/profile/" + user.username}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 "
            >
              Profile
            </Link>
          </li>
          <li>
            <Link
              to="/my-orders"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Orders
            </Link>
          </li>
          {user.role !== "User" && (
            <li>
              <Link
                to="/shop-orders"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Shop Orders
              </Link>
            </li>
          )}
          <li>
            <Link
              to={"/profile/" + user.username + "/my-vehicles"}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              My vehicles
            </Link>
          </li>
          <li>
            <Link
              to={"/profile/" + user.username + "/settings"}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Settings
            </Link>
          </li>
          <li>
            <div
              onClick={() => dispatch(signOut())}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
            >
              Sign out
            </div>
          </li>
        </ul>
      </div>
    </>
  );
}
