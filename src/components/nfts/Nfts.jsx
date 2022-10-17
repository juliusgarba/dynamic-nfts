import React from "react";
import "./nfts.css";
import { Link } from "react-router-dom";
import { GridLoader } from "react-spinners";

const Nfts = ({ nfts, title, loading }) => {
  return (
    <div className="nfts">
      <div className="nfts-container">
        <div className="nfts-container_text">
          <h1> {title}</h1>
        </div>
        <div className="nfts-container_cards">
          {!loading ? (
            nfts.map((nft) => (
              <Link to={`/nft/${nft.id}`}>
                <div className="nft-card">
                  <img src={nft.image} alt={nft.name} />
                </div>
              </Link>
            ))
          ) : (
            <GridLoader size={20} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Nfts;
