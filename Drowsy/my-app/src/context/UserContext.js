import React, { createContext, useState, useContext } from 'react';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [companies, setCompanies] = useState([]); 

  return (
    <UserContext.Provider value={{ user, setUser, workers, setWorkers, companies, setCompanies }}>
      {children}
    </UserContext.Provider>
  );
};
