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
