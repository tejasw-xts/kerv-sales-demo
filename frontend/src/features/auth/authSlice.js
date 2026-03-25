import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    error: null,
  },
  reducers: {
    registerSuccess(state, action) {
      state.error = null;
    },
    loginSuccess(state, action) {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
    },
    setError(state, action) {
      state.error = action.payload;
    },
  },
});

export const { registerSuccess, loginSuccess, logout, setError } = authSlice.actions;
export default authSlice.reducer;
