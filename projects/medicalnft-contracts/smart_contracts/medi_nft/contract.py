from algopy import *

from algopy.arc4 import abimethod


class NFTContract(ARC4Contract):
    assetid: UInt64
    access_holder: Account
    access_expires_at: UInt64
    access_active: UInt64

    @abimethod(allow_actions=["NoOp"], create="require")
    def create_application(self, asset_id: Asset) -> None:
        self.assetid = asset_id.id
 # opt in to the asset into the smart contract
    @abimethod()
    def opt_in_to_asset(self, mbrpay: gtxn.PaymentTransaction) -> None:
        assert Txn.sender == Global.creator_address
        assert not Global.current_application_address.is_opted_in(Asset(self.assetid))

        assert mbrpay.receiver == Global.current_application_address

        assert mbrpay.amount == Global.min_balance + Global.asset_opt_in_min_balance

        itxn.AssetTransfer(
            xfer_asset= self.assetid,
            asset_receiver= Global.current_application_address,
            asset_amount= 0,
            fee=0,
        ).submit()
    @abimethod
    def asset_opt_in_sender(self, asset: Asset) -> None:

        itxn.AssetTransfer(
            asset_receiver=Txn.sender,
            xfer_asset=asset,
            asset_amount=0,
            fee=0,
        ).submit()
