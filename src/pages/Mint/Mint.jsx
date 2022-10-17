import { useEffect, useState } from "react"
import { useSuperContract } from "../../hooks/useSuperContract";
import { useContractKit } from "@celo-tools/use-contractkit";
import { useNavigate } from "react-router-dom";
import { Web3Storage } from "web3.storage/dist/bundle.esm.min.js";
import "./Mint.css";

const Mint = () => {
  const [name, setName] = useState(null);
  const [description, setDescription] = useState(null);
  const [image, setImage] = useState(null);
  const superContract = useSuperContract();
  const { address, connect, performActions } = useContractKit();  
  const navigate = useNavigate();

  useEffect(() => {
    if (!address) {
      (async () => {
        await connect();
      })();
    }
  }, [address, connect]);

  const isFormFiled = () => {
    if (name === null || image === null || description === null) {
      return false;
    } else {
      return true;
    }
  };

  const handleMintButton = async () => {
    await mintNft();
    navigate("/");
  };

  const client = new Web3Storage({ token: process.env.REACT_APP_API_TOKEN });

  const formattedName = (name) => {
    let file_name;
    const trim_name = name.trim();
    if (trim_name.includes(" ")) {
      file_name = trim_name.replaceAll(" ", "%20");
      return file_name;
    } else return trim_name;
  };

  const makeFileObjects = (file) => {
    const blob = new Blob([JSON.stringify(file)], { type: "application/json" });
    const files = [new File([blob], `${file.name}.json`)];
    return files;
  };

  const uploadToIPFS = async (file) => {
    if (!file) return;
    try {
      const file_name = file[0].name;
      const image_name = formattedName(file_name);
      const image_cid = await client.put(file);
      const image_url = `https://${image_cid}.ipfs.w3s.link/${image_name}`;
      return image_url;
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  };

  // mint an NFT
  const mintNft = async () => {
    await performActions(async (kit) => {
      if (!name || !description || !image) return;
      const { defaultAccount } = kit;

      // trim any extra whitespaces from the name and
      // replace the whitespace between the name with %20
      const file_name = formattedName(name);
      // convert NFT metadata to JSON format
      const data = {
        name,
        image,
        description,
        owner: defaultAccount,
      };

      try {
        // save NFT metadata to IPFS
        const files = makeFileObjects(data);
        const file_cid = await client.put(files);
        const URI = `https://${file_cid}.ipfs.w3s.link/${file_name}.json`;        

        // upload the NFT, mint the NFT and save the IPFS url to the blockchain
        let transaction = await superContract.methods
          .mintCharacter(URI)
          .send({ from: defaultAccount });
        return transaction;
      } catch (error) {
        console.log("Error minting character: ", error);
      }
    });
  };

  return (
    <div className="create">
      <div className="create_head">Create New NFT</div>
      <div className="create_form">
        <div className="field_label">Superhero name</div>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="field_label">Superhero description</div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="field_label">Superhero headshot</div>
        <input
          type="file"
          onChange={async (e) => {
            console.log(e.target.files);
            const image_file = e.target.files;
            console.log(image_file);
            const imageUrl = await uploadToIPFS(image_file);
            if (!imageUrl) {
              alert("Failed to upload image");
              return;
            }
            setImage(imageUrl);
          }}
        />
        <button disabled={!isFormFiled()} onClick={handleMintButton}>
          Mint
        </button>
      </div>
    </div>
  );
};

export default Mint;
