import { configureStore } from '@reduxjs/toolkit';
import orderReducer from './slices/orderSlice';
import reverseOrderReducer from './slices/reverseOrderSlice';

export const store = configureStore({
  reducer: {
    orders: orderReducer,
    reverseOrders: reverseOrderReducer,
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