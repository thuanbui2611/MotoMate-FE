import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { BrandSlice } from "../../pages/brand/BrandSlice";
import { AccountSlice } from "../../pages/account/AccountSlice";
import { CollectionSlice } from "../../pages/collection/CollectionSlice";
import { ModelVehicleSlice } from "../../pages/modelVehicle/ModelVehicleSlice";
import { VehicleSlice } from "../../pages/vehicles/VehicleSlice";
import { ColorSlice } from "../../pages/color/ColorSlice";
import { VehiclePendingSlice } from "../../pages/vehicles/VehiclePendingSlice";
import { VehicleDeniedSlice } from "../../pages/vehicles/VehicleDeniedSlice";
import { UserSlice } from "../../pages/users/UserSlice";
import { BlogSlice } from "../../pages/blog/BlogSlice";
import { BlogCategorySlice } from "../../pages/blogCategory/BlogCategorySlice";
import { TransactionSlice } from "../../pages/transactions/TransactionSlice";
import { FilterSlice } from "../../pages/filter/FilterSlice";

export const store = configureStore({
  reducer: {
    brand: BrandSlice.reducer,
    account: AccountSlice.reducer,
    collection: CollectionSlice.reducer,
    modelVehicle: ModelVehicleSlice.reducer,
    vehicle: VehicleSlice.reducer,
    vehiclePending: VehiclePendingSlice.reducer,
    vehicleDenied: VehicleDeniedSlice.reducer,
    color: ColorSlice.reducer,
    user: UserSlice.reducer,
    blog: BlogSlice.reducer,
    blogCategory: BlogCategorySlice.reducer,
    transaction: TransactionSlice.reducer,
    filter: FilterSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
