import React, { useEffect, useState } from "react";

import BuyActionWindow from "./BuyActionWindow";

const GeneralContext = React.createContext({
  openBuyWindow: (uid, orderType) => {},
  closeBuyWindow: () => {},
});

export const GeneralContextProvider = (props) => {
  const [isBuyWindowOpen, setIsBuyWindowOpen] = useState(false);
  const [selectedStockUID, setSelectedStockUID] = useState("");
  const [selectedOrderType, setSelectedOrderType] = useState("BUY");

  const handleOpenBuyWindow = (uid, orderType = "BUY") => {
    setIsBuyWindowOpen(true);
    setSelectedStockUID(uid);
    setSelectedOrderType(orderType);
  };

  const handleCloseBuyWindow = () => {
    setIsBuyWindowOpen(false);
    setSelectedStockUID("");
  };

  useEffect(() => {
    const handleOpenSellFromOrders = (e) => {
      const symbol = e?.detail?.symbol;
      if (symbol) {
        handleOpenBuyWindow(symbol, "SELL");
      }
    };
    window.addEventListener('openSellFromOrders', handleOpenSellFromOrders);
    return () => window.removeEventListener('openSellFromOrders', handleOpenSellFromOrders);
  }, []);

  return (
    <GeneralContext.Provider
      value={{
        openBuyWindow: handleOpenBuyWindow,
        closeBuyWindow: handleCloseBuyWindow,
      }}
    >
      {props.children}
      {isBuyWindowOpen && <BuyActionWindow uid={selectedStockUID} orderType={selectedOrderType} />}
    </GeneralContext.Provider>
  );
};

export default GeneralContext;
