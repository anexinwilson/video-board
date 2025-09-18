import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import backendApi from "../../api/backendApi";
import { toast } from "sonner";
import type { NavigateFunction } from "react-router-dom";

interface User {
  _id: string;
  email: string;
  username: string;
  token: string;
  uploadCount: number;
  downloadCount: number;
}

export interface AuthState {
  loggedInUser: User | null;
  loading: boolean;
}

interface SignInPayload {
  email: string;
  password: string;
  navigate: NavigateFunction;
}

interface SignUpPayload {
  email: string;
  password: string;
  username: string;
  navigate: NavigateFunction;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
}

const initialState: AuthState = {
  loggedInUser: null,
  loading: false,
};

export const signUpUser = createAsyncThunk<
  void,
  SignUpPayload,
  { rejectValue: string }
>("auth/sign-up-user", async (payload, thunkApi) => {
  try {
    const { email, password, username, navigate } = payload;
    const signUpRes = await backendApi.post<AuthResponse>(
      "/api/v1/auth/sign-up",
      { email, password, username }
    );
    if (!signUpRes.data.success) {
      toast.warning(signUpRes.data.message);
      return;
    }
    toast.success(signUpRes.data.message);
    const signInRes = await backendApi.post<AuthResponse>("/api/v1/auth/sign-in", { email, password });
    if (signInRes.data.success && signInRes.data.user?.token) {
      localStorage.setItem("token", signInRes.data.user.token);
      toast.success("Signed in");
      navigate("/user/dashboard");
    } else {
      toast.warning(signInRes.data.message || "Sign in failed");
    }
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Something went wrong";
    toast.error(errorMessage);
    throw errorMessage;
  }
});

export const signInUser = createAsyncThunk<
  string | null,
  SignInPayload,
  { rejectValue: string }
>("auth/sign-in-user", async (payload, thunkApi) => {
  try {
    const { email, password, navigate } = payload;
    const { data } = await backendApi.post<AuthResponse>(
      "/api/v1/auth/sign-in",
      { email, password }
    );
    if (data.success && data.user?.token) {
      localStorage.setItem("token", data.user.token);
      toast.success(data.message);
      navigate("/user/dashboard");
      return data.user.token || null;
    } else {
      toast.warning(data.message);
      return thunkApi.rejectWithValue(data.message);
    }
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Invalid email or password";
    toast.error(errorMessage);
    return thunkApi.rejectWithValue(errorMessage);
  }
});

export const fetchUserDetails = createAsyncThunk<
  User | null,
  void,
  { rejectValue: string }
>("auth/fetch-user-details", async (_, thunkApi) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      return thunkApi.rejectWithValue("No authorization token found");
    }
    const { data } = await backendApi.get<AuthResponse>(
      "/api/v1/user/profile",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (data.success && data.user) {
      return data.user as any;
    } else {
      return thunkApi.rejectWithValue(data.message);
    }
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || error?.message || "Something went wrong";
    return thunkApi.rejectWithValue(errorMessage);
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logOutUser: (state) => {
      localStorage.removeItem("token");
      state.loggedInUser = null;
      toast.info("We will miss you");
    },
    updateUser: (state, action) => {
      const { username, email } = action.payload as { username: string; email: string };
      if (state.loggedInUser) {
        state.loggedInUser.username = username;
        state.loggedInUser.email = email;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signInUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(signInUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(signInUser.rejected, (state) => {
        state.loading = false;
      })
      .addCase(fetchUserDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserDetails.fulfilled, (state, action) => {
        state.loggedInUser = action.payload;
        state.loading = false;
      })
      .addCase(fetchUserDetails.rejected, (state) => {
        state.loading = false;
      })
      .addCase(signUpUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(signUpUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(signUpUser.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const authReducer = authSlice.reducer;
export const { logOutUser, updateUser } = authSlice.actions;
export const selectLoggedInUser = (state: RootState) => state.auth.loggedInUser;
export const selectLoading = (state: RootState) => state.auth.loading;
