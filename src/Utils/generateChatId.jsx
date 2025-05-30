import React from "react";


const generateChatId = (uid1, uid2) => {
    return [uid1, uid2].sort().join("_");
  };
  
  export default generateChatId;
  