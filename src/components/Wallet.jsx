import { money } from '../game/economy.js'

export default function Wallet({ balance, onTopUp }) {
  return (
    <button className="wallet" onClick={onTopUp} title="Add more play credits (free)">
      <span className="wallet-k">CREDITS</span>
      <span className="wallet-v">{money(balance)}</span>
    </button>
  )
}
