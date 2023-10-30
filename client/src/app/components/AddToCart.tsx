import { toast } from "react-toastify";
import {
  addToCartAsync,
  deleteItemInCartAsync,
} from "../../pages/cart/CartSlice";
import { useAppDispatch, useAppSelector } from "../store/ConfigureStore";
import { useEffect, useState } from "react";

interface Props {
  userId: string | undefined;
  vehicleId: string;
  className: string;
}

export default function AddToCart({ userId, vehicleId, className }: Props) {
  const [itemAddedToCart, setItemAddedToCart] = useState(false);
  const { cart } = useAppSelector((state) => state.cart);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (
      cart &&
      cart.shops.some((shop) =>
        shop.vehicles.some((vehicle) => vehicle.vehicleId === vehicleId)
      )
    ) {
      setItemAddedToCart(true);
    } else {
      setItemAddedToCart(false);
    }
  }, [cart]);

  const handleAddVehicleToCart = async (
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    event.stopPropagation();
    event.preventDefault();
    if (!userId) return toast.error("Please login to add to cart");
    if (itemAddedToCart) {
      //remove item from cart
      setItemAddedToCart(false);
      toast.success("Remove vehicle from cart successfully!");
      const result = await dispatch(
        deleteItemInCartAsync({ userId, vehicleId })
      );
      if (result.meta.requestStatus === "rejected") {
        toast.error("Something wrong, remove vehicle from cart failed!");
      }
    } else {
      //add item to cart
      setItemAddedToCart(true);
      toast.success("Add to cart successfully");
      const result = await dispatch(addToCartAsync({ userId, vehicleId }));
      if (result.meta.requestStatus === "rejected") {
        toast.error("Something wrong, add to cart failed!");
      }
    }
  };

  return (
    <>
      <div
        className={className}
        onClick={(event) => handleAddVehicleToCart(event)}
      >
        <svg
          className={`hover:text-red-600 w-full h-full ${
            itemAddedToCart && "text-red-600"
          }`}
          viewBox="0 0 15 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
          <g
            id="SVGRepo_tracerCarrier"
            stroke-linecap="round"
            stroke-linejoin="round"
          ></g>
          <g id="SVGRepo_iconCarrier">
            <path
              d="M4.03553 1C1.80677 1 0 2.80677 0 5.03553C0 6.10582 0.42517 7.13228 1.18198 7.88909L7.14645 13.8536C7.34171 14.0488 7.65829 14.0488 7.85355 13.8536L13.818 7.88909C14.5748 7.13228 15 6.10582 15 5.03553C15 2.80677 13.1932 1 10.9645 1C9.89418 1 8.86772 1.42517 8.11091 2.18198L7.5 2.79289L6.88909 2.18198C6.13228 1.42517 5.10582 1 4.03553 1Z"
              fill="currentColor"
            ></path>
          </g>
        </svg>
      </div>
    </>
  );
}
