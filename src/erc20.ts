import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  Transfer as TransferEvent,
} from "../generated/ERC20/ERC20"
import {
  Transfer, User
} from "../generated/schema"

function getUser(id: Bytes): User {
  let user = User.load(id)
  if (user != null) {
    return user as User
  }

  let newUser = new User(id)
  newUser.balance = BigInt.fromI64(0)
  return newUser
}

export function handleTransfer(event: TransferEvent): void {
  let entity = new Transfer(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )

  let from = event.params.from
  let to = event.params.to
  let value = event.params.value

  entity.from = from
  entity.to = to
  entity.value = value

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.save()

  let fromUser = getUser(from)
  let toUser = getUser(to)
  fromUser.balance.minus(value)
  toUser.balance.plus(value)

  fromUser.save()
  toUser.save()
}
