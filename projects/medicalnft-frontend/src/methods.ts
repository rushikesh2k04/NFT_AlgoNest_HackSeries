// src/components/methods.ts
import * as algokit from '@algorandfoundation/algokit-utils'

export async function create(
  algodClient: algokit.AlgorandClient,
  sender: string,
  quantity: bigint,
  dec: number,
  assetname: string,
  url: string,
): Promise<bigint> {
  const assetCreate = await algodClient.send.assetCreate({
    sender,
    total: quantity,
    decimals: dec,
    assetName: assetname,
    unitName: assetname.substring(0, 3),
    url: url,
  })

  const assetId = BigInt(assetCreate.confirmation.assetIndex!)
  console.log("Asset created with ID:", assetId)
  return assetId
}
