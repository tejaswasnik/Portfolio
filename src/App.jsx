import React from "react";
import DotGrid from "./components/Background/components/DotGrid";
import "./main.scss";

const App = () => {
  return (
    <div className="app">
      <div className="background">
        <DotGrid
          dotSize={5}
          gap={15}
          baseColor="#2F293A"
          activeColor="#A855F7"
          proximity={120}
          shockRadius={250}
          shockStrength={5}
          resistance={750}
          returnDuration={1.5}
        />
      </div>

      <div className="content">
        
      </div>
    </div>
  );
};

export default App;