import {
  Account,
  JsonRpcProvider,
  type Provider,
  type PublicProvider
} from "@massalabs/massa-web3";
import { Reader } from "./reader.svelte";
import { shortenString } from "$lib/ts/utils";
import { getWallet, getWallets, WalletName, type Wallet } from "@massalabs/wallet-provider";

class PrivateKeyProvider {
  privateKey: string;
  constructor(privateKey: string) {
    this.privateKey = privateKey;
  }
}

class WalletProvider {
  walletName?: WalletName;
  accountNum?: number;
  constructor(walletName?: WalletName, accountNum?: number) {
    this.walletName = walletName;
    this.accountNum = accountNum;
  }
}

class Writer extends Reader {
  #wallet = $state<Wallet | undefined>();
  #connected = $state<boolean>(false);
  #type = $state<"PublicProvider" | "Provider" | "Wallet" | "PrivateKey">("PublicProvider");
  #accountNum = $state<number>(0); // Index of the active account within the connected wallet

  // Selection state
  availableWallets = $state<Wallet[]>([]);
  selectedWalletName = $state<WalletName | undefined>(undefined);
  availableAccounts = $state<Provider[]>([]); // Accounts available for the selected wallet
  selectedAccountNum = $state<number>(0); // Index selected in the UI, used for connection
  isLoadingWallets = $state<boolean>(true);
  isLoadingAccounts = $state<boolean>(false);
  isConnecting = $state<boolean>(false); // Added state for connection process

  get wallet() {
    return this.#wallet;
  }
  get noConnect() {
    return !this.#wallet?.connect;
  }

  get connected(): boolean {
    return this.#connected;
  }

  // ACCOUNT
  get name(): string {
    if (!("providerName" in this.provider && this.provider.providerName)) return "";

    if (this.#type === "PrivateKey") return "Burner Wallet";
    if (this.provider.accountName === this.provider.address) {
      return this.provider.providerName + " #" + (this.#accountNum + 1);
    } else {
      return this.provider.accountName;
    }
  }
  #balance = $state<bigint | undefined>();
  get address() {
    if (!("address" in this.provider)) return;
    return this.provider.address || "???";
  }
  get addressToDisplay() {
    if (!("address" in this.provider)) return;
    return shortenString(this.provider.address || "???");
  }
  get balance() {
    return this.#balance;
  }
  get balanceToDisplay() {
    return this.#balance ? `${(Number(this.#balance) / 1e9).toFixed(2)} MAS` : "0.00 MAS";
  }

  async refresh(): Promise<boolean> {
    if (!this.ready) return false;
    if (!("balance" in this.provider)) return true;

    try {
      this.#balance = await this.provider.balance(true);
    } catch (error) {
      console.error("Error while refreshing balance:", error);
      return false;
    }

    return true;
  }

  // CONNECT
  async connect(): Promise<boolean> {
    if (this.#connected) return true;

    try {
      this.#connected = this.noConnect || (await this.#wallet!.connect());
      await this.refresh();
    } catch (error) {
      console.info("Error while connecting:", error);
      return false;
    }

    return this.#connected;
  }

  // DISCONNECT
  async disconnect(): Promise<boolean> {
    if (!this.ready) return false;
    if (!this.#connected) return true;

    this.#connected = false;
    this.#balance = undefined;

    return true;
  }

  async initProviderWithType(provider: Provider) {
    this.#type = "Provider";
    await this.initialize(provider);
  }

  async initProviderJsonRpcPublic(provider: PublicProvider) {
    this.#type = "PublicProvider";
    await this.initialize(provider);
  }

  async initProviderWallet(walletProvider: WalletProvider = {}): Promise<void> {
    let wallet: Wallet | undefined;

    if (!walletProvider.walletName) {
      const wallets = await getWallets();
      if (wallets.length > 0) wallet = wallets[0];
    } else {
      wallet = await getWallet(walletProvider.walletName);
    }
    if (!wallet) {
      console.info(`No Wallet found`);
      return;
    }

    this.#wallet = wallet;
    await this.connect();

    const accountNum = walletProvider.accountNum ?? 0;
    const accounts = await wallet.accounts();

    const provider = accounts[accountNum];
    if (!provider) {
      throw new Error(`Wallet ${wallet.name()} Account #${accountNum} not found`);
    }

    this.#accountNum = accountNum;
    this.#type = "Wallet";
    await this.initialize(provider);
  }

  // ONLY for testnet address
  // DO NOT use with address with real value on mainnet !!!
  async initProviderPrivateKey(privateKeyProvider: PrivateKeyProvider): Promise<void> {
    const account = await Account.fromPrivateKey(privateKeyProvider.privateKey);

    this.#type = "PrivateKey";
    await this.initialize(JsonRpcProvider.buildnet(account));

    await this.connect();
  }

  // Method to load available wallets
  async loadAvailableWallets(): Promise<void> {
    this.isLoadingWallets = true;
    try {
      this.availableWallets = await getWallets();
      console.log("Writer: Available wallets loaded:", this.availableWallets);
      // If only one wallet, pre-select it if nothing else is selected
      if (this.availableWallets.length === 1 && !this.selectedWalletName) {
        this.selectedWalletName = this.availableWallets[0].name();
      }
      // If the previously selected wallet is no longer available, reset selection
      if (
        this.selectedWalletName &&
        !this.availableWallets.some((w) => w.name() === this.selectedWalletName)
      ) {
        this.selectedWalletName = undefined;
        this.selectedAccountNum = 0;
      }
    } catch (error) {
      console.error("Writer: Error loading available wallets:", error);
      this.availableWallets = [];
      this.selectedWalletName = undefined;
      this.selectedAccountNum = 0;
    } finally {
      this.isLoadingWallets = false;
    }
  }

  // Method to load accounts for the currently selected wallet
  async loadAccountsForSelectedWallet(): Promise<void> {
    if (!this.selectedWalletName) {
      this.availableAccounts = [];
      this.selectedAccountNum = 0;
      this.isLoadingAccounts = false;
      return;
    }
    const selectedWalletInstance = this.availableWallets.find(
      (w) => w.name() === this.selectedWalletName
    );

    if (!selectedWalletInstance) {
      console.warn(
        `Writer: Selected wallet '${this.selectedWalletName}' not found in available list during account load. Maybe still loading?`
      );
      this.availableAccounts = [];
      this.selectedAccountNum = 0;
      this.isLoadingAccounts = false;
      return;
    }

    this.isLoadingAccounts = true;
    try {
      // Request MetaMask Snap permissions if this is MetaMask
      if (this.selectedWalletName === WalletName.Metamask) {
        await this.#requestMetaMaskSnapPermissions();
      }
      
      const accounts = await selectedWalletInstance.accounts();
      this.availableAccounts = accounts;
      console.log(`Writer: Accounts loaded for ${this.selectedWalletName}:`, accounts);
      // Reset account selection if current index is invalid or no accounts
      if (this.selectedAccountNum >= accounts.length || accounts.length === 0) {
        this.selectedAccountNum = accounts.length > 0 ? 0 : -1; // -1 indicates no selection possible
      }
    } catch (error) {
      console.error(`Writer: Error loading accounts for ${this.selectedWalletName}:`, error);
      this.availableAccounts = [];
      this.selectedAccountNum = -1;
    } finally {
      this.isLoadingAccounts = false;
    }
  }

  // Method to connect using the UI selection
  async connectUsingSelection(): Promise<boolean> {
    if (this.#connected) {
      console.log("Writer: Already connected.");
      return true;
    }
    if (!this.selectedWalletName) {
      console.error("Writer: No wallet selected to connect.");
      return false;
    }
    if (this.selectedAccountNum < 0) {
      console.error("Writer: No account selected or available.");
      return false;
    }

    this.isConnecting = true;
    let selectedWalletInstance: Wallet | undefined;
    try {
      // For MetaMask Snap, explicitly request permissions first
      // This is especially important for remote domains (non-localhost)
      if (this.selectedWalletName === WalletName.Metamask) { // Use proper enum value
        await this.#requestMetaMaskSnapPermissions();
      }
      
      // Find the selected wallet instance from the loaded list
      selectedWalletInstance = this.availableWallets.find(
        (w) => w.name() === this.selectedWalletName
      );
      if (!selectedWalletInstance) {
        // Attempt to get it directly if not found (e.g., list update race condition)
        console.warn(`Wallet ${this.selectedWalletName} not in available list, trying getWallet.`);
        selectedWalletInstance = await getWallet(this.selectedWalletName);
      }
      if (!selectedWalletInstance) {
        throw new Error(`Could not get wallet instance for ${this.selectedWalletName}`);
      }
      this.#wallet = selectedWalletInstance;

      // Connect the wallet itself (might prompt user)
      const walletConnected = this.noConnect || (await this.#wallet.connect());
      if (!walletConnected) {
        throw new Error("Wallet connection rejected or failed.");
      }

      // Ensure accounts are loaded (might have been loaded by effect, but double-check)
      if (this.isLoadingAccounts) {
        await this.loadAccountsForSelectedWallet(); // Wait if still loading
      }
      if (
        this.availableAccounts.length === 0 ||
        this.selectedAccountNum >= this.availableAccounts.length
      ) {
        throw new Error(
          `Selected account index ${this.selectedAccountNum} is invalid for ${this.selectedWalletName}.`
        );
      }

      // Get the specific provider instance for the selected account
      const providerAccount = this.availableAccounts[this.selectedAccountNum];

      // Initialize the Reader/Writer state with this provider
      this.#accountNum = this.selectedAccountNum; // Set the active internal account index
      this.#type = "Wallet";
      await this.initialize(providerAccount); // Initialize Reader with the selected account's provider

      // Now set the connected state and refresh balance etc.
      this.#connected = true;
      await this.refresh();
      console.log(
        `Writer: Connected to ${this.name} (Wallet: ${this.selectedWalletName}, Account: ${this.selectedAccountNum})`
      );
      return true;
    } catch (error: unknown) {
      console.error("Writer: Connection using selection failed:", error);
      // Reset state on failure
      this.#connected = false;
      this.#wallet = undefined;
      this.#accountNum = 0;
      this.#type = "PublicProvider";
      // Optionally reset UI selections?
      // this.selectedWalletName = undefined;
      // this.selectedAccountNum = 0;
      // this.availableAccounts = [];
      return false;
    } finally {
      this.isConnecting = false;
    }
  }

  // Private method to request MetaMask Snap permissions
  async #requestMetaMaskSnapPermissions(): Promise<void> {
    try {
      // Check if window.ethereum exists (MetaMask is installed)
      if (typeof window !== 'undefined' && 'ethereum' in window) {
        // Define type for ethereum provider
        interface EthereumProvider {
          request: (args: {method: string; params?: Record<string, unknown>}) => Promise<unknown>;
        }
        
        // Type-safe access to ethereum
        const ethereum = (window as Window & { ethereum?: EthereumProvider }).ethereum;
        if (ethereum && typeof ethereum.request === 'function') {
          console.log("Requesting MetaMask Snap permissions...");
          // Request permissions for the Massa Snap
          await ethereum.request({
            method: 'wallet_requestSnaps',
            params: {
              'npm:@massalabs/metamask-snap': {}
            }
          });
          console.log("MetaMask Snap permissions granted");
        }
      }
    } catch (snapError) {
      console.error("Error requesting MetaMask Snap permissions:", snapError);
      // Continue anyway - the wallet-provider library will handle further errors
    }
  }

  constructor(param?: Provider | PublicProvider | WalletProvider | PrivateKeyProvider) {
    super();

    // Determine the provider type first
    let providerType:
      | "defaultWallet"
      | "specificWallet"
      | "privateKey"
      | "provider"
      | "publicProvider"
      | "invalid";
    if (!param) {
      providerType = "defaultWallet";
    } else if ("privateKey" in param) {
      providerType = "privateKey";
    } else if ("providerName" in param) {
      providerType = "provider";
    } else if ("networkInfos" in param) {
      providerType = "publicProvider";
    } else if ("walletName" in param) {
      providerType = param.walletName ? "specificWallet" : "defaultWallet";
    } else if (typeof param === "object" && Object.keys(param).length === 0) {
      providerType = "defaultWallet";
    } else {
      providerType = "invalid";
    }

    // Initialize based on provider type
    if (providerType === "defaultWallet") {
      this.loadAvailableWallets().then(() => {
        if (typeof param === "object" && "walletName" in param && param.walletName) {
          this.selectedWalletName = param.walletName;
          this.selectedAccountNum = param.accountNum ?? 0;
        } else if (!this.selectedWalletName && this.availableWallets.length > 0) {
          this.selectedWalletName = this.availableWallets[0].name();
        }
        this.loadAccountsForSelectedWallet();
      });
    } else if (providerType === "specificWallet") {
      this.initProviderWallet(param as WalletProvider);
    } else if (providerType === "privateKey") {
      this.initProviderPrivateKey(param as PrivateKeyProvider);
    } else if (providerType === "provider") {
      this.initProviderWithType(param as Provider);
    } else if (providerType === "publicProvider") {
      this.initProviderJsonRpcPublic(param as PublicProvider);
    } else {
      console.error("Invalid Writer constructor parameter:", param);
      throw new Error("Invalid Writer constructor parameter");
    }

    // Effect to load accounts when selected wallet changes
    $effect(() => {
      console.log("Writer: $effect triggered for selectedWalletName:", this.selectedWalletName);
      this.loadAccountsForSelectedWallet();
    });
  }
}

export { Writer, PrivateKeyProvider, WalletProvider };
