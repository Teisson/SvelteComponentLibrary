import { writable } from 'svelte/store';
import { getAccount, injected, type GetAccountReturnType } from '@wagmi/core'
import { 
    connect,
    reconnect,
    disconnect as disconnectWagmi,
    watchAccount 
} from '@wagmi/core'
import { config } from './config'

type Wallet = GetAccountReturnType;

const connectWallet = () => connect(config, { connector: injected() });
const disconnect = () => disconnectWagmi(config);

const createWalletStore = () => {
    const { set, subscribe, update } = writable<Wallet>(getAccount(config));
    
    return {
        subscribe,
        set,
        update,
        connect: connectWallet,
        disconnect: disconnect
    }
};

export const walletStore = createWalletStore();

// Watch account changes
watchAccount(config, { onChange: walletStore.set } );
// Reconnect wallet when reload
reconnect(config);