import React, { useEffect, useState } from "react";
import Nfts from "../../components/nfts/Nfts";
import { useSuperContract } from "../../hooks/useSuperContract";

const Home = () => {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(false);
  const superContract = useSuperContract();
  useEffect(() => {
    if (superContract) {
      getCharacters();
    }
  }, [superContract]);

  // get character metadata using its URI
  const getMetadata = async (ipfsUrl) => {
    try {
      if (!ipfsUrl) return null;
      const raw_data = await fetch(ipfsUrl);
      const meta = await raw_data.json();
      return meta;
    } catch (e) {
      console.log({ e });
    }
  };

  // get all characters minted from contract
  const getCharacters = async () => {
    setLoading(true);
    try {
      const _characters = [];
      const total = await superContract.methods.totalSupply().call();
      for (let i = 0; i < Number(total); i++) {
        const _character = new Promise(async (resolve) => {
          const c = await superContract.methods.getToken(i).call();
          const tokenData = await getMetadata(c._tokenURI);
          resolve({
            id: i,
            owner: c.owner,
            likesCount: c.likesCount,
            happyCount: c.happyCount,
            angryCount: c.angryCount,
            name: tokenData.name,
            image: tokenData.image,
            description: tokenData.description,
          });
        });
        _characters.push(_character);
      }
      const _chars = await Promise.all(_characters);
      setCharacters(_chars);
    } catch (e) {
      console.log({ e });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile">
      <Nfts
        nfts={characters}
        loading={loading}
        title="All Super hero characters"
      />
    </div>
  );
};

export default Home;
