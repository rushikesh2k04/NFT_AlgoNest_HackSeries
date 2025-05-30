import * as algokit from '@algorandfoundation/algokit-utils';
import { NftRevokeClient, NftRevokeFactory } from './contracts/NFTRevoke';
import { TransactionSigner, CommonTransactionParams } from 'algosdk';
import algosdk from 'algosdk'

export function createApplication(
  algorand: algokit.AlgorandClient,
  revokeclient: NftRevokeClient,
  revokefactory: NftRevokeFactory,
  signer: TransactionSigner,
  sender: string,
  assetId: bigint,
  setAppId: (id: bigint) => void,
): () => Promise<bigint> {

  return async () => {
    const result = await revokefactory.send.create.createApplication({ args: [assetId], sender });

    const newClient = new NftRevokeClient({ appId: result.appClient.appId, algorand, defaultSigner: signer });

    const mbrpay = await algorand.createTransaction.payment({
      sender,
      receiver: result.appClient.appAddress,
      amount: algokit.algos(0.2),
      extraFee: algokit.algos(0.001),
    });

    await newClient.send.optInToAsset({ args: [mbrpay], sender, assetReferences: [assetId] });
    console.log("Asset id opted to application")

    await algorand.send.assetTransfer({
      sender,
      assetId,
      receiver: result.appClient.appAddress,
      amount: BigInt(1),
    });

    const appId = BigInt(result.appClient.appId);
    setAppId(appId);

    console.log("the asset is transfered to application"+String(appId))
   return appId;
  };
}

