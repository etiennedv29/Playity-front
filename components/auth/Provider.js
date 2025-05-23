// components/auth/AuthProvider.jsx
import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginGuest } from "../../reducers/users";

export default function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.users.value?.token);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (!token) {
          const res = await axios.post(
            "http://localhost:3000/users/register-guest"
          );

          dispatch(loginGuest(res.data));
        }
      } catch (err) {}
    };

    initializeAuth();
  }, []);

  return children;
}
