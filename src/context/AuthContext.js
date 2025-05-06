// src/context/AuthContext.js
import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [receptionistData, setReceptionistData] = useState(null);

  return (
    <AuthContext.Provider value={{ receptionistData, setReceptionistData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
