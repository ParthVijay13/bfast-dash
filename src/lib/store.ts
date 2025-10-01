import { configureStore } from '@reduxjs/toolkit';
import orderReducer from './slices/orderSlice';
import reverseOrderReducer from './slices/reverseOrderSlice';
import pickupReducer from './slices/pickupSlice';

export const store = configureStore({
  reducer: {
    orders: orderReducer,
    reverseOrders: reverseOrderReducer,
    pickup: pickupReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;