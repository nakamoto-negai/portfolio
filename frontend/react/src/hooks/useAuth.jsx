import { createContext, useContext, useEffect, useState } from "react";
import { checkLoginStatus } from "../api/auth";

const AuthCtx = createContext({ user: null, loading: true });

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // ログイン状態をチェックしてユーザー情報を取得
  useEffect(() => {
    checkLoginStatus().then((res) => {
      if (res.data.logged_in){
        setUser(res.data.user);
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false)
    });
  }, []);

  return (
    <AuthCtx.Provider value={{ user, loading, setUser }}>
      {children}
    </AuthCtx.Provider>
  );
};

export const useAuth = () => useContext(AuthCtx);