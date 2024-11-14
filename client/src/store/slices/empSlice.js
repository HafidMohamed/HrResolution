import {
    createSlice,
    createAsyncThunk
  } from '@reduxjs/toolkit';
export const storeSetUpData = createAsyncThunk(
    'init/storeSetUpData',
    async ( response , {
        rejectWithValue
    }) => {
        try {
            return {
                companies: response.companies,
                positions: response.positions,
                roles: response.roles
            };
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
  );
  const empSlice = createSlice({
    name: 'init',
    initialState: {
        companies:null,
        positions:null,
        roles:null,
        loading : false,
        error : null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(storeSetUpData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(storeSetUpData.fulfilled, (state, action) => {
                state.companies = action.payload.companies;
                state.positions = action.payload.positions;
                state.roles = action.payload.roles;
                state.loading = false;
            })
            .addCase(storeSetUpData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
  });

  export const selectInit = (state) => state.init;
  export default empSlice.reducer;