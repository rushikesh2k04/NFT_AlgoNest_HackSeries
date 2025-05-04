from algopy import *
from algopy.arc4 import abimethod


class NftTransfer(ARC4Contract):
    assetid: UInt64

    @abimethod(allow_actions=["NoOp"], create="require")
    def create_application(self, asset_id: Asset ) -> None:
        self.assetid = asset_id.id
    
    @abimethod
    def asset_opt_in(self, asset: Asset) -> None:
        assert asset.id == self.assetid

        itxn.AssetTransfer(
            asset_receiver=Global.current_application_address,
            xfer_asset=asset,
            asset_amount=0,
            fee=0,
        ).submit()

    @abimethod
    def asset_transfer(self, asset: Asset, receiver: Account, amount: UInt64) -> None:
        assert asset.id == self.assetid

        itxn.AssetTransfer(
            asset_receiver=receiver,
            xfer_asset=asset,
            asset_amount=amount
            ).submit()
