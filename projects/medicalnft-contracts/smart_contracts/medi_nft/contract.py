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
 # example: ASSET_TRANSFER
    @abimethod
    def asset_transfer_from_app(self, asset: Asset, receiver: Account ) -> None:
        itxn.AssetTransfer(
            sender = Global.current_application_address,
            asset_receiver = receiver,
            xfer_asset = asset,
            asset_amount = 1,
            fee=0,
        ).submit()


class NFTRevoke(ARC4Contract):
    assetid: UInt64
    access_holder: Account
    access_expires_at: UInt64
    access_active: UInt64  # 1 if active, 0 if not

    @abimethod(allow_actions=["NoOp"], create="require")
    def create_application(self, asset_id: Asset) -> None:
        self.assetid = asset_id.id
        self.access_holder = Global.zero_address
        self.access_expires_at = UInt64(0)
        self.access_active = UInt64(0)
    @abimethod
    def asset_config_clawback(self, asset: Asset) -> None:
        assert asset.manager == Txn.sender
        itxn.AssetConfig(
            config_asset=asset,
            manager= Txn.sender,
            clawback=Global.current_application_address, # Set clawback to app address
            fee=0,
        ).submit()
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
    @abimethod()
    def grant_access(self, holder: Account, duration_secs: UInt64) -> None:
        assert self.access_active == 0, "Access already active"

        self.access_holder = holder
        self.access_expires_at = Global.latest_timestamp + duration_secs
        self.access_active = UInt64(1)

        # Send the NFT to the holder
        itxn.AssetTransfer(
            asset_receiver=holder,
            xfer_asset=self.assetid,
            asset_amount=1,
            fee=0
        ).submit()
    @abimethod()
    def revoke_access(self) -> None:
        assert self.access_active == 1, "No active access"
        assert Global.latest_timestamp > self.access_expires_at, "Access not yet expired"

        # Clawback the NFT from the holder
        itxn.AssetTransfer(
            asset_receiver=Global.current_application_address,
            xfer_asset=self.assetid,
            asset_sender=self.access_holder,
            asset_amount=1,
            fee=0
        ).submit()

        self.access_active = UInt64(0)
        self.access_holder = Global.zero_address
        self.access_expires_at = UInt64(0)
