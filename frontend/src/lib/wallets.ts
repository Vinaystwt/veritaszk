export type WalletType = 'puzzle' | 'leo'

export interface ConnectedWallet {
  address: string
  walletType: WalletType
}

export async function connectPuzzle(): Promise<ConnectedWallet> {
  const puzzle = (window as any).puzzle?.puzzleWalletClient
  if (!puzzle) throw new Error('Puzzle Wallet not detected')

  const response = await puzzle.connect({
    dAppInfo: {
      name: 'VeritasZK',
      description: 'Zero-knowledge solvency proofs on Aleo',
      iconURL: '/logo.svg',
    },
  })

  const address = response?.account?.address
  if (!address) throw new Error('No address returned from Puzzle Wallet')
  return { address, walletType: 'puzzle' }
}

export async function disconnectPuzzle(): Promise<void> {
  const puzzle = (window as any).puzzle?.puzzleWalletClient
  if (puzzle?.disconnect) await puzzle.disconnect()
}

export function isPuzzleAvailable(): boolean {
  return !!(window as any).puzzle?.puzzleWalletClient
}

export async function connectLeo(): Promise<ConnectedWallet> {
  const leo = (window as any).leoWallet ?? (window as any).leo
  if (!leo) throw new Error('Leo Wallet not detected')
  await leo.connect('testnet3')
  const account = await leo.getAccount()
  const address = account?.address
  if (!address) throw new Error('No address returned from Leo Wallet')
  return { address, walletType: 'leo' }
}

export function isLeoAvailable(): boolean {
  return !!(window as any).leoWallet || !!(window as any).leo
}

export async function detectWallets(): Promise<{ puzzle: boolean; leo: boolean }> {
  await new Promise(resolve => setTimeout(resolve, 800))
  return {
    puzzle: isPuzzleAvailable(),
    leo: isLeoAvailable(),
  }
}
