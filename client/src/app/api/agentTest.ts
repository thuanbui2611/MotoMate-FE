import axios, { AxiosError, AxiosResponse } from "axios";
import { toast } from "react-toastify";
import { history } from "../..";
import { store } from "../store/ConfigureStore";

axios.defaults.baseURL = "https://motormate.azurewebsites.net/";
axios.defaults.headers.post["Content-Type"] = "application/json";
const responseBody = (response: AxiosResponse) => response.data;

axios.interceptors.request.use((config) => {
  const userToken = store.getState().account.userLoginToken?.token;
  if (userToken) config.headers.Authorization = `Bearer ${userToken}`;
  return config;
});

axios.interceptors.response.use(
  (response) => {
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
          toast.error((data as any).errors[0].description);
          throw modalStateErrors.flat();
        }
        break;
      case 401:
        toast.error((data as any).title);
        break;
      case 403:
        toast.error((data as any).title);
        break;
      case 404:
        toast.error((data as any).title);
        break;
      case 500:
        history.push("/server-error");
        break;
      default:
        break;
    }
    return Promise.reject(error.response);
  }
);

const requests = {
  get: (url: string) => axios.get(url).then(responseBody),
  post: (url: string, body: {}) => axios.post(url, body).then(responseBody),
  put: (url: string, body: {}) => axios.put(url, body).then(responseBody),
  delete: (url: string) => axios.delete(url).then(responseBody),
};

const Account = {
  login: (values: {}) => requests.post("api/auth/login", values),
  loginGoogle: (values: { tokenCredential: string }) =>
    requests.post("api/auth/sso/google", values),
  Register: (values: {}) => requests.post("api/auth/sign-up", values),
};

const agent = {
  Account,
};

export default agent;
