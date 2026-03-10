import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import riderReducer from './slices/riderSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    rider: riderReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
