import { useContract } from "./useContract";
import SuperToken from "../contracts/SuperTokens.json";
import address from "../contracts/SuperTokens-address.json";

export const useSuperContract = () => {
  return useContract(SuperToken.abi, address.SuperTokens);
};
