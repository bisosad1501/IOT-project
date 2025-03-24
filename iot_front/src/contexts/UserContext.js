// UserContext.js

import { createContext, useContext, useState } from "react";

const UserContext = createContext(); 

const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);  // Initialize user state
    const [air, setAir] = useState(null);
    const [light, setLight] = useState(null);
    const [deviceId, setDeviceId] = useState(null);
    const [Switch, setSwitch] = useState(null);
    const [led, setLed] = useState(null);
    const [toggle, setToggle] = useState(null);
    const [loading, setLoading] = useState(null);
    const [devices, setDevices] = useState({});

    return (
        <UserContext.Provider value={{ 
            user, setUser,
            air, setAir,
            light, setLight,
            deviceId, setDeviceId,
            Switch, setSwitch,
            led, setLed,
            toggle, setToggle,
            loading, setLoading,
            devices, setDevices
            }}>
            {children}  {/* Wrap the children so they have access to the context */}
        </UserContext.Provider>
    );
};

// Custom hook to access the UserContext
export const UserState = () => {
    const context = useContext(UserContext);  
    if (!context) {
        throw new Error("UserState must be used within a UserProvider");
    }
    return context;  
};

export default UserProvider;
