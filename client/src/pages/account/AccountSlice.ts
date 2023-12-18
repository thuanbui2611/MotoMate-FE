import { createAsyncThunk, createSlice, isAnyOf } from "@reduxjs/toolkit";
import { User, UserDetail } from "../../app/models/User";
import { FieldValues } from "react-hook-form";
import jwt_decode from "jwt-decode";
import { toast } from "react-toastify";
import agent from "../../app/api/agent";

interface AccountState {
  user: User | null;
  userDetail: UserDetail | null;
  userLoading: boolean;
}

const initialState: AccountState = {
  user: null,
  userDetail: null,
  userLoading: false,
};

export const signInUser = createAsyncThunk<User, FieldValues>(
  "account/signInUser",
  async (data, thunkAPI) => {
    try {
      const userLogin = await agent.Account.login(data);
      localStorage.setItem("user", JSON.stringify(userLogin));
      return userLogin.token;
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: (error as any).data });
    }
  }
);

export const signInByGoogle = createAsyncThunk<User, string>(
  "account/signInByGoogle",
  async (tokenCredential, thunkAPI) => {
    try {
      const userLogin = await agent.Account.loginGoogle({
        tokenCredential,
      });
      localStorage.setItem("user", JSON.stringify(userLogin));
      return userLogin.token;
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: (error as any).data });
    }
  }
);

export const fetchUserFromToken = createAsyncThunk<User>(
  "account/fetchUserFromToken",
  async (_, thunkAPI) => {
    thunkAPI.dispatch(setUser(JSON.parse(localStorage.getItem("user")!)));
    try {
      const userLogin = localStorage.getItem("user");
      const user = JSON.parse(userLogin!);
      localStorage.setItem("user", JSON.stringify(user));
      return user.token;
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  },
  {
    condition: () => {
      if (!localStorage.getItem("user")) return false;
    },
  }
);

export const getUserDetails = createAsyncThunk<UserDetail>(
  "account/getUserDetails",
  async (_, thunkAPI) => {
    try {
      const user = await agent.Account.userDetail();
      return user;
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: (error as any).data });
    }
  },
  {
    condition: () => {
      if (!localStorage.getItem("user")) return false;
    },
  }
);

export const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    signOut: (state) => {
      state.user = null;
      state.userDetail = null;
      localStorage.removeItem("user");
      toast.success("Log out success!");
    },
    setUser: (state, action) => {
      try {
        const userToken = action.payload.token.toString();
        const decodedToken = jwt_decode(userToken) as any;
        if (decodedToken.exp * 1000 < Date.now()) {
          localStorage.removeItem("user");
          throw new Error("Token expired!");
        }
        state.user = setDataUserFromToken(decodedToken, userToken);
      } catch (error) {
        throw new Error("No valid token found, please login again!");
      }
    },
    updateUser: (state, action) => {
      const userUpdated: UserDetail = action.payload;
      state.userDetail = action.payload;

      const dataUpdate: User = {
        username: userUpdated.username,
        name: userUpdated.fullName,
        email: userUpdated.email,
        role: userUpdated.roles[0],
        avatar: userUpdated.image.imageUrl,
        token: state.user?.token,
      };

      state.user = dataUpdate;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchUserFromToken.rejected, (state, action) => {
      state.user = null;
      localStorage.removeItem("user");
      toast.error(action.error.message);
    });

    builder
      .addCase(getUserDetails.pending, (state, action) => {
        state.userLoading = true;
      })
      .addCase(getUserDetails.fulfilled, (state, action) => {
        state.userLoading = false;
        state.userDetail = action.payload;
      })
      .addCase(getUserDetails.rejected, (state, action) => {
        console.log("Auth user fail");
      });

    builder.addMatcher(
      isAnyOf(
        signInUser.fulfilled,
        signInByGoogle.fulfilled,
        fetchUserFromToken.fulfilled
      ),
      (state, action) => {
        let userToken = action.payload.toString();
        const decodedToken = jwt_decode(userToken) as any;
        state.user = setDataUserFromToken(decodedToken, userToken);
      }
    );
    builder.addMatcher(
      isAnyOf(signInUser.rejected, signInByGoogle.rejected),
      (state, action) => {
        console.log("SignIn rejected, the payload:");
        console.log(action.payload);
      }
    );
  },
});

function setDataUserFromToken(decodedToken: any, userToken: string) {
  const user = {
    username:
      decodedToken[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
      ],
    name: decodedToken[
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
    ],
    email:
      decodedToken[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
      ],
    role: decodedToken[
      "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
    ],
    avatar: decodedToken["Avatar"],
    token: userToken,
  };
  return user;
}

export const { signOut, setUser, updateUser } = accountSlice.actions;
