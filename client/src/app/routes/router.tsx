import { Navigate, createBrowserRouter } from "react-router-dom";
import App from "../../App";
import DefaultLayout from "../layouts/DefaultLayout";
import HomePage from "../../pages/home";
import About from "../../pages/about";
import Products from "../../pages/products";
import ProductDetails from "../../pages/products/ProductDetails";
import Checkout from "../../pages/checkout/Checkout";
import Bill from "../../pages/checkout/Bill";
import SettingProfile from "../../pages/profile/SettingProfile";
import Cart from "../../pages/cart";
import Login from "../../pages/account/Login";
import ServerErrors from "../errors/ServerErrors";
import Contact from "../../pages/contact";
import SignUpPage from "../../pages/account/SignUpPage";
import Orders from "../../pages/my-order";
import ForgotPassword from "../../pages/account/ForgotPassword";
import ChangePassword from "../../pages/account/ChangePassword";
import NotFound from "../errors/NotFound";
import Profile from "../../pages/profile";
import BlogPage from "../../pages/blog";
import BlogDetails from "../../pages/blog/BlogDetails";
import MyProducts from "../../pages/profile/MyProducts";
import ProfileDetails from "../components/ProfileDetails";
import OrderDetail from "../../pages/my-order/OrderDetail";
import ShopOrderDetail from "../../pages/shop-order/ShopOrderDetail";
import ShopOrders from "../../pages/shop-order";
import Payment from "../../pages/checkout/Payment";
import RequireAuth from "./RequireAuth";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      // Public routes
      {
        element: <DefaultLayout />,
        children: [
          { path: "", element: <HomePage /> },
          { path: "about", element: <About /> },
          { path: "contact", element: <Contact /> },
          { path: "blog", element: <BlogPage /> },
          { path: "blog/:id", element: <BlogDetails /> },
          { path: "products", element: <Products /> },
          { path: "product-detail/:id", element: <ProductDetails /> },
        ],
      },
      // Auth routes
      {
        element: <RequireAuth />,
        children: [
          {
            element: <DefaultLayout />,
            children: [
              { path: "check-out", element: <Checkout /> },
              { path: "payment", element: <Payment /> },
              { path: "bill", element: <Bill /> },
              { path: "my-orders", element: <Orders /> },
              { path: "my-orders/:parentOrderId", element: <OrderDetail /> },
              { path: "my-cart", element: <Cart /> },
            ],
          },
        ],
      },
      {
        element: <DefaultLayout />,
        children: [
          {
            path: "profile/:username/",
            element: <Profile />,
            children: [
              { path: "", element: <ProfileDetails /> },
              {
                element: <RequireAuth />,
                children: [
                  { path: "settings", element: <SettingProfile /> },
                  { path: "my-vehicles", element: <MyProducts /> },
                ],
              },
            ],
          },
        ],
      },
      // Auth routes with roles
      {
        element: <RequireAuth roles={["Admin", "Staff", "Lessor"]} />,
        children: [
          {
            element: <DefaultLayout />,
            children: [
              { path: "shop-orders", element: <ShopOrders /> },
              {
                path: "shop-orders/:parentOrderId",
                element: <ShopOrderDetail />,
              },
            ],
          },
        ],
      },
      // Public routes
      { path: "login", element: <Login /> },
      { path: "sign-up", element: <SignUpPage /> },
      { path: "forgot-password", element: <ForgotPassword /> },
      { path: "forgot-password/:resetCode", element: <ChangePassword /> },
      { path: "not-found", element: <NotFound /> },
      { path: "*", element: <Navigate replace to="/not-found" /> },
      { path: "server-error", element: <ServerErrors /> },
    ],
  },
]);
