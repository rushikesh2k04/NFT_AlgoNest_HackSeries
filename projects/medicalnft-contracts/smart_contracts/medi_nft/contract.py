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
