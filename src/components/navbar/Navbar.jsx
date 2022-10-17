import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useContractKit } from "@celo-tools/use-contractkit";
import { truncateAddress } from "../../utils/helperFunctions";
import "./Navbar.css";

const Navbar = () => {
  const { address, destroy, connect } = useContractKit();

  return (
    <div className="navbar">
      <div className="navbar-links">
        <div className="navbar-links_logo">
          <Link to="/">
            <h1>SuperTokens</h1>
          </Link>
        </div>
        <div className="navbar-links_container">
          {address && (
            <Link to="/">
              <p onClick={destroy}>Disconnect</p>
            </Link>
          )}
          {!address ? (
            <>
              <button type="button" className="secondary-btn" onClick={connect}>
                Connect
              </button>
            </>
          ) : (
            <>
              <a
                href={`https://alfajores-blockscout.celo-testnet.org/address/${address}/transactions`}
              >
                <button type="button" className="secondary-btn">
                  {truncateAddress(address)}
                </button>
              </a>
              <Link to="/create">
                <button type="button" className="primary-btn">
                  Mint Character
                </button>
              </Link>
            </>
          )}
        </div>
      </div>

    </div>
  );
};

export default Navbar;
