import axios, { AxiosError, AxiosResponse } from "axios";
import { toast } from "react-toastify";
import { store } from "../store/ConfigureStore";
import { PaginatedResponse } from "../models/Pagination";
import { router } from "../routes/router";

axios.defaults.baseURL = process.env.REACT_APP_MOTORMATE_API_URL;
axios.defaults.headers.post["Content-Type"] = "application/json";
const responseBody = (response: AxiosResponse) => response.data;
axios.interceptors.request.use((config) => {
  const userToken = store.getState().account.user?.token;
  if (userToken) config.headers.Authorization = `Bearer ${userToken}`;
  return config;
});

axios.interceptors.response.use(
  async (response) => {
    const pagination = response.headers["x-pagination"];
    if (pagination) {
      response.data = new PaginatedResponse(
        response.data,
        JSON.parse(pagination)
      );
      return response;
    }
    return response;
  },
  (error: AxiosError) => {
    const { data, status } = error.response!;
    switch (status) {
      case 400:
        if ((data as any).errors) {
          const modalStateErrors: string[] = [];
          for (const key in (data as any).errors) {
            if ((data as any).errors[key]) {
              modalStateErrors.push((data as any).errors[key]);
            }
          }

          toast.error(modalStateErrors.toString());
          // throw modalStateErrors.flat();
        }
        console.log(data);
        toast.error((data as any).message);
        break;
      case 401:
        toast.error((data as any).title);
        break;
      case 403:
        toast.error((data as any).message);
        break;
      case 404:
        toast.error((data as any).message);
        break;
      case 409:
        toast.error((data as any).message);
        break;
      case 500:
        console.log("Catch 500");
        toast.error((data as any).message);
        router.navigate("/server-error");
        break;
      default:
        break;
    }
    return Promise.reject(error.response);
  }
);

const requests = {
  get: (url: string, params?: URLSearchParams) =>
    axios.get(url, { params }).then(responseBody),
  post: (url: string, body: {}) => axios.post(url, body).then(responseBody),
  put: (url: string, body: {}) => axios.put(url, body).then(responseBody),
  patch: (url: string, body: {}) => axios.patch(url, body).then(responseBody),
  delete: (url: string) => axios.delete(url).then(responseBody),
};

const Account = {
  userDetail: () => requests.get("api/user/details"),
  login: (values: {}) => requests.post("api/auth/login", values),
  loginGoogle: (values: { tokenCredential: string }) =>
    requests.post("api/auth/sso/google", values),
  Register: (values: {}) => requests.post("api/auth/sign-up", values),
  updateIsLockUser: (values: {}, userId: string) =>
    requests.post(`api/auth/${userId}/lock`, values),
};

const Brand = {
  all: () => requests.get("api/brand/all"),
  list: (params: URLSearchParams) => requests.get("api/brand", params),
  details: (id: string) => requests.get(`api/brand/${id}`),
  create: (values: {}) => requests.post("api/brand", values),
  update: (id: string, values: {}) => requests.put(`api/brand/${id}`, values),
  delete: (id: string) => requests.delete(`api/brand/${id}`),
};

const Collection = {
  all: () => requests.get("api/collection/all"),
  list: (params: URLSearchParams) => requests.get("api/collection", params),
  details: (id: string) => requests.get(`api/collection/${id}`),
  create: (values: {}) => requests.post("api/collection", values),
  update: (id: string, values: {}) =>
    requests.put(`api/collection/${id}`, values),
  delete: (id: string) => requests.delete(`api/collection/${id}`),
};

const ModelVehicle = {
  all: () => requests.get("api/model/all"),
  list: (params: URLSearchParams) => requests.get("api/model", params),
  details: (id: string) => requests.get(`api/model/${id}`),
  getByCollection: (collectionId: string) =>
    requests.get(`api/model/collection/${collectionId}`),
  create: (values: {}) => requests.post("api/model", values),
  update: (id: string, values: {}) => requests.put(`api/model/${id}`, values),
  delete: (id: string) => requests.delete(`api/model/${id}`),
};

const Color = {
  all: () => requests.get("api/color/all"),
  details: (id: string) => requests.get(`api/color/${id}`),
  create: (values: {}) => requests.post("api/color", values),
  bulkCreate: (values: {}) => requests.post("api/color/bulk", values),
  update: (id: string, values: {}) => requests.put(`api/color/${id}`, values),
  delete: (id: string) => requests.delete(`api/color/${id}`),
};

const Vehicle = {
  list: (params: URLSearchParams) => requests.get("api/vehicle", params),
  listVehicleByStatus: (params: URLSearchParams, statusRoute: string) =>
    requests.get(`api/vehicle/status/${statusRoute}`, params),
  details: (id: string) => requests.get(`api/vehicle/${id}`),
  create: (values: {}) => requests.post("api/vehicle", values),
  lock: (vehicleId: string) =>
    requests.post(`api/vehicle/${vehicleId}/lock`, {}),
  update: (id: string, values: {}) => requests.put(`api/vehicle/${id}`, values),
  updateStatusVehicle: (vehicleId: string, statusNumber: number) =>
    requests.post(`api/vehicle/${vehicleId}/status/${statusNumber}`, {}),
  delete: (id: string) => requests.delete(`api/vehicle/${id}`),
};

const User = {
  all: () => requests.get("api/user/all"),
  list: (params: URLSearchParams) => requests.get("api/user", params),
  details: (username: string) => requests.get(`api/user/${username}/details`),
  getAllRole: () => requests.get("api/user/role/all"),
  update: (username: string, values: {}) =>
    requests.put(`api/user/${username}`, values),
  updateRole: (values: {}) => requests.put(`api/user/role`, values),
  delete: (username: string) => requests.delete(`api/user/${username}`),
};

const Blog = {
  list: (params: URLSearchParams) => requests.get("api/blog", params),
  details: (id: string) => requests.get(`api/blog/${id}`),
  create: (values: {}) => requests.post("api/blog", values),
  update: (id: string, values: {}) => requests.put(`api/blog/${id}`, values),
  delete: (id: string) => requests.delete(`api/blog/${id}`),
};

const Category = {
  all: () => requests.get("api/blog/category"),
  details: (id: string) => requests.get(`api/blog/category/${id}`),
  create: (values: {}) => requests.post("api/blog/category", values),
  update: (id: string, values: {}) =>
    requests.put(`api/blog/category/${id}`, values),
  delete: (id: string) => requests.delete(`api/blog/category/${id}`),
};

const TripRequest = {
  list: (params: URLSearchParams) => requests.get("api/order", params),
  parentOrder: (parentOrderId: string) =>
    requests.get(`api/order/parent/${parentOrderId}`),
};
const Chart = {
  totalVehicles: () => requests.get("api/chart/total/vehicles"),
  totalViews: () => requests.get("api/chart/total/views"),
  totalUsers: () => requests.get("api/chart/total/users"),
  totalProfit: () => requests.get("api/chart/total/profits"),
  topLessees: () => requests.get("api/chart/top/lessees"),
  topLessors: () => requests.get("api/chart/top/lessors"),
  revenueInYear: (year: string) => requests.get(`api/chart/revenue/${year}`),
  totalViewsOfMonth: (year: number, month: number) =>
    requests.get(`api/chart/total/views/${year}/${month}`),
};
const agent = {
  Account,
  Brand,
  Collection,
  ModelVehicle,
  Color,
  Vehicle,
  User,
  Blog,
  Category,
  TripRequest,
  Chart,
};

export default agent;
