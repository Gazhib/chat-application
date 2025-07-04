import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
const initialState = {
  email: "",
  login: "",
  role: "",
  id: "",
};

type userTypes = {
  email: string;
  login: string;
  role: string;
  id: string;
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    getInfo: (state, action: PayloadAction<userTypes>) => {
      state.email = action.payload.email
      state.login = action.payload.login
      state.role = action.payload.role
      state.id = action.payload.id
    },
  },
});

export const { getInfo } = userSlice.actions;
export default userSlice.reducer;
