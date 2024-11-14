import {
  createSlice,
  createAsyncThunk
} from '@reduxjs/toolkit';
import {
  authApi
} from '../../services/api/authApi';
import {  useNavigate } from 'react-router-dom';
import useTranslation from '@/hooks/useTranslation';

// Helper function to store auth data
const storeAuthData = (response, rememberMe = false) => {
  if (rememberMe) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('refreshToken', response.user.refreshToken);

  } else {
      sessionStorage.setItem('token', response.token);
      sessionStorage.setItem('user', JSON.stringify(response.user));
      sessionStorage.setItem('refreshToken', response.user.refreshToken);

  }
  localStorage.setItem('rm',rememberMe );
};
let rMe;

// Helper function to clear auth data
const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('rm');

  sessionStorage.removeItem('refreshToken');
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');

};


export const login = createAsyncThunk(
  'auth/login',
  async ({
      email,
      password,
      rememberMe
  }, {
      rejectWithValue
  }) => {
      try {
          const response = await authApi.login(email, password);
          storeAuthData(response, rememberMe);
          return {
              user: response.user,
              token: response.token
          };
      } catch (error) {
          return rejectWithValue(error.response.data);
      }
  }
);
export const refreshToken = createAsyncThunk(
    'auth/refreshToken',
    async (_, { rejectWithValue }) => {
      try {
        let refreshToken;
        const rm=localStorage.getItem('rm');
        if(rm){
            refreshToken = localStorage.getItem('refreshToken');
        }else {
            refreshToken =  sessionStorage.getItem('refreshToken');
        }
        console.log(rm,refreshToken);
        const response = await authApi.refreshToken(refreshToken)
        localStorage.setItem('token', response.data.token);
        return response;
      } catch (error) {
        return rejectWithValue(error.response.data);
      }
    }
  );

export const googleLogin = createAsyncThunk(
  'auth/googleLogin',
  async (response, {
      rejectWithValue
  }) => {
      try {
          storeAuthData(response, true); // Always remember Google logins
          return {
              user: response.user,
              token: response.token
          };
      } catch (error) {
          return rejectWithValue(error.response.data);
      }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async ({username, email, password}, {
      rejectWithValue
  }) => {
      try {
          const response = await authApi.register(username, email, password);
          storeAuthData(response, true); // Remember newly registered users
          return {
              user: response.user,
              token: response.token
          };
      } catch (error) {
          return rejectWithValue(error.response.data);
      }
  }
);

export const fetchUserProfile = createAsyncThunk(
  'auth/fetchUserProfile',
  async (_, {
      rejectWithValue
  }) => {
      try {
          const response = await authApi.fetchUserProfile();
          storeAuthData(response.token, response.user, true); // Remember newly registered users
          return response;
      } catch (error) {
          return rejectWithValue(error.response.data);
      }
  }
);
export const storeUserProfile = createAsyncThunk(
  'auth/storeUserProfile',
  async ({ response, rememberMe }, {
      rejectWithValue
  }) => {
      try {
        console.log(response,rememberMe);
          storeAuthData(response, rememberMe); // Remember newly registered users
          return {
              user: response.user,
              token: response.token,
              refreshToken: response.user.refreshToken
          };
      } catch (error) {
          return rejectWithValue(error.response.data);
      }
  }
);
export const logout = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
      try {
        
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const response = await authApi.logout(token);
        clearAuthData();
        return null;
      } catch (error) {
        clearAuthData();
        return rejectWithValue(error.response.data);
      }
    }
  );

  export const checkAuthStatus = createAsyncThunk(
    'auth/checkAuthStatus',
    async (_, { rejectWithValue }) => {
      try {
        const response = await authApi.checkAuthStatus();
        return response.data;
      } catch (error) {
        if (error.response && error.response.status === 401) {
          return rejectWithValue(error.response.data);
        }
        throw error;
      }
    }
  );


const authSlice = createSlice({
  name: 'auth',
  initialState: {
      user: JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || 'null'),
      token: localStorage.getItem('token') || sessionStorage.getItem('token') || null,
      refreshToken: localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken') || null,
      isAuthenticated: !!(localStorage.getItem('token') || sessionStorage.getItem('token')),
      loading: false,
      error: null,
  },
  reducers: {
      setCredentials: (state, action) => {
          const {
              token,
              user
          } = action.payload;
          state.token = token;
          state.user = user;
          state.isAuthenticated = !!token;
      },
  },
  extraReducers: (builder) => {
      builder
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.token = action.payload.token;
        }).addCase(checkAuthStatus.rejected, (state, action) => {
            if (action.payload && action.payload.code === 'TOKEN_EXPIRED') {
              state.isAuthenticated = false;
              state.user = null;
              state.token = null;
            }})
          .addCase(login.pending, (state) => {
              state.loading = true;
              state.error = null;
          })
          .addCase(login.fulfilled, (state, action) => {
              state.user = action.payload.user;
              state.token = action.payload.token;
              state.refreshToken = action.payload.refreshToken;
              state.isAuthenticated = true;
              state.loading = false;
          })
          .addCase(login.rejected, (state, action) => {
              state.loading = false;
              state.error = action.payload;
          })
          .addCase(googleLogin.pending, (state) => {
              state.loading = true;
              state.error = null;
          })
          .addCase(googleLogin.fulfilled, (state, action) => {
              state.user = action.payload.user;
              state.token = action.payload.token;
              state.isAuthenticated = true;
              state.loading = false;
          })
          .addCase(googleLogin.rejected, (state, action) => {
              state.loading = false;
              state.error = action.payload;
          })
          .addCase(register.pending, (state) => {
              state.loading = true;
              state.error = null;
          })
          .addCase(register.fulfilled, (state, action) => {
              state.user = action.payload.user;
              state.token = action.payload.token;
              state.isAuthenticated = false;
              state.loading = false;
          })
          .addCase(register.rejected, (state, action) => {
              state.loading = false;
              state.error = action.payload;
          })
          .addCase(logout.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(logout.fulfilled, (state, action) => {
            state.user = null;
            state.token = null;
            state.refreshToken = null;
            state.isAuthenticated = false;
            clearAuthData();
            state.loading = false;
        })
        .addCase(logout.rejected, (state, action) => {
            state.user = null;
            state.token = null;
            state.refreshToken = null;
            state.isAuthenticated = false;
            clearAuthData();
            state.loading = false;
            state.error = action.payload;
        })
          .addCase(storeUserProfile.pending, (state) => {
              state.loading = true;
              state.error = null;
          })
          .addCase(storeUserProfile.fulfilled, (state, action) => {
              state.user = action.payload.user;
              state.isAuthenticated = true;
              state.token = action.payload.token;
              state.refreshToken = action.payload.refreshToken;
              state.loading = false;
          })
          .addCase(storeUserProfile.rejected, (state, action) => {
              state.loading = false;
              state.error = action.payload;
          });
  },
});

export const {
  setCredentials
} = authSlice.actions;
export const selectAuth = (state) => state.auth;
export default authSlice.reducer;