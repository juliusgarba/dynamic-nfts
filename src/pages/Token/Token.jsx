import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useContractKit } from "@celo-tools/use-contractkit";
import { useSuperContract } from "../../hooks/useSuperContract";
import "./Token.css";
import { truncateAddress } from "../../utils/helperFunctions";
import likeIcon from "../../assets/like_emoji.png";
import happyIcon from "../../assets/happy_emoji.webp";
import angryIcon from "../../assets/angry_emoji.jpg";
import { GridLoader } from "react-spinners";

const Token = () => {
  const [character, setCharacter] = useState({});
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);

  const { id } = useParams();
  const superContract = useSuperContract();
  const { performActions } = useContractKit();

  useEffect(() => {
    if (superContract) getCharacter();
  }, [superContract]);

  const getCharacter = async () => {
    setLoading(true);
    try {
      const _c = await superContract.methods.getToken(id).call();
      const _comments = await superContract.methods.getComment(id).call();
      const token_data = await fetch(_c._tokenURI);
      const token_meta = await token_data.json();

      const charObj = {
        name: token_meta.name,
        image: token_meta.image,
        description: token_meta.description,
        owner: _c.owner,
        likeCount: _c.likeCount,
        happyCount: _c.happyCount,
        angryCount: _c.angryCount,
        comments: _comments,
      };
      setCharacter(charObj);
      setLoading(false);
    } catch (e) {
      console.log({ e });
    } finally {
      setLoading(false);
    }
  };

  const sendReaction = async (reactionId) => {
    await performActions(async (kit) => {
      const { defaultAccount } = kit;
      try {
        await superContract.methods
          .addReaction(id, reactionId)
          .send({ from: defaultAccount });
        getCharacter();
      } catch (e) {
        console.log({ e });
      }
    });
  };

  const sendComment = async () => {
    await performActions(async (kit) => {
      const { defaultAccount } = kit;
      try {
        await superContract.methods
          .addComment(id, content)
          .send({ from: defaultAccount });
        setContent("");
        getCharacter();
      } catch (e) {
        console.log({ e });
      }
    });
  };

  return (
    <>
      {!loading ? (
        <div className="nft-info">
          <div className="nft-section">
            <div className="nft-img">
              <img src={character.image} />
            </div>
            <div className="nft-details">
              <div className="nft-d-owner">
                Minted by <span>{character.owner}</span>
              </div>
              <div className="nft-d-name">{character.name}</div>
              <div className="nft-d-description">{character.description}</div>
              <div className="reactions">
                <div className="r-div">
                  <div className="r-count">{character.likeCount}</div>
                  <img src={likeIcon} onClick={() => sendReaction(Number(1))} />
                </div>
                <div className="r-div">
                  <div className="r-count">{character.happyCount}</div>
                  <img
                    src={happyIcon}
                    onClick={() => sendReaction(Number(2))}
                  />
                </div>
                <div className="r-div">
                  <div className="r-count">{character.angryCount}</div>
                  <img
                    src={angryIcon}
                    onClick={() => sendReaction(Number(3))}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="comments-section">
            <div className="add-c-text">Add comment</div>
            <div className="add-comment-section">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <button onClick={() => sendComment()}>Add</button>
            </div>
            <hr />
            <div className="prev-comments-section">
              {character.comments?.map((c) => (
                <div className="comm">
                  <div className="comm-sender">
                    By <span>{truncateAddress(c.sender)}</span>
                  </div>
                  <div className="comm-content">{c.content}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <GridLoader />
      )}
    </>
  );
};

export default Token;
