import { createSlice } from '@reduxjs/toolkit';

const persistedUser = JSON.parse(localStorage.getItem('kerv_auth_user') || 'null');

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: persistedUser,
    isAuthenticated: Boolean(persistedUser),
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
      localStorage.setItem('kerv_auth_user', JSON.stringify(action.payload));
    },
    updateUserSuccess(state, action) {
      state.user = action.payload;
      state.error = null;
      localStorage.setItem('kerv_auth_user', JSON.stringify(action.payload));
    },
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('kerv_auth_user');
    },
    setError(state, action) {
      state.error = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
  },
});

export const { registerSuccess, loginSuccess, updateUserSuccess, logout, setError, clearError } = authSlice.actions;
export default authSlice.reducer;
