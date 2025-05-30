// src/components/methods.ts
import * as algokit from '@algorandfoundation/algokit-utils';
import { NftContractClient, NftContractFactory } from './contracts/NFTContract';

import { TransactionSigner } from 'algosdk';


export async function create(
  algorand: algokit.AlgorandClient,
  sender: string,
  assetname: string,
  url: string,
  patient: string,
  unitName: string,
): Promise<bigint> {

    const assetCreate = await algorand.send.assetCreate({
      sender,
      total: BigInt(100),
      decimals: 2,
      assetName: assetname,
      unitName: unitName,
      url: url,
      manager: patient,
      clawback: patient,
    })

    const assetId = BigInt(assetCreate.confirmation.assetIndex!)
    if (!assetId) throw new Error("Asset creation failed, no ID returned")

  console.log("✅ Asset created with ID:", assetId)
    return assetId
  }

export function createApplication(
  algorand: algokit.AlgorandClient,
  nftclient: NftContractClient,
  nftfactory: NftContractFactory,
  signer: TransactionSigner,
  sender: string,
  assetId: bigint,
  setAppId: (id: bigint) => void,
): () => Promise<bigint> {

  return async () => {
    const result = await nftfactory.send.create.createApplication({ args: [assetId], sender });

    const newClient = new NftContractClient({ appId: result.appClient.appId, algorand, defaultSigner: signer });

    const mbrpay = await algorand.createTransaction.payment({
      sender,
      receiver: result.appClient.appAddress,
      amount: algokit.algos(0.2),
      extraFee: algokit.algos(0.001),
    });

    await newClient.send.optInToAsset({ args: [mbrpay], sender, assetReferences: [assetId] });

    await algorand.send.assetTransfer({
      sender,
      assetId,
      receiver: result.appClient.appAddress,
      amount: BigInt(1),
    });

    const appId = BigInt(result.appClient.appId);
    setAppId(appId);

    return appId;
  };
}

export function optIn(
  algorand: algokit.AlgorandClient,
  signer: TransactionSigner,
  sender: string,
  assetID: bigint,
) {
  return async () => {
    try{
      await algorand.send.assetOptIn({ sender: sender, assetId: assetID , signer});
      console.log("The Asste is opted into:",sender," Address:", assetID)
      console.log(signer)
    }
    catch(error)
    {
      console.log("Error occured in opt into asset")
    }
  }
}

export function assetFromApp(
  algorand: algokit.AlgorandClient,
  nftclient: NftContractClient,
  signer: TransactionSigner,
  sender: string,
  assetID: bigint
) {
  return async () => {
    try {
      try {
        console.log(sender)
        const accountInfo = await algorand.asset.getAccountInformation(sender, assetID);
        if (accountInfo && accountInfo.balance > 0n) {
          alert("You Already Own this asset. You cannot purchase it again.");
          return;
        }
      } catch (error) {
        console.log("User does not own the asset. Proceeding with purchase....");
      }
      await algorand.send.assetOptIn({ sender: sender, assetId: assetID , signer});
      const result = await nftclient.send.assetTransferFromApp({ args: [assetID, sender], sender: sender, assetReferences:[assetID]});
      console.log("Transfered the asset:",result);
    } catch (error) {
      console.log(error)
    }
  }
}
