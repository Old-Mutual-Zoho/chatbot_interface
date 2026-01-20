import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomeScreen from "./components/screens/home";

import BusinessUnitScreen from "./components/screens/BusinessUnitScreen";


function App() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <Router>
      
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route
            path="/home"
            element={chatOpen ? <HomeScreen /> : null}
          />
          <Route
            path="/businessUnits"
            element={chatOpen ? <BusinessUnitScreen onClose={function (): void {
              throw new Error("Function not implemented.");
            } } /> : null}
          />
          {/* ...other routes if needed... */}
        </Routes>
        
      
    </Router>
  );
}

export default App;
