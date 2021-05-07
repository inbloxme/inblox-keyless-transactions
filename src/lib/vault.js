const VaultSDK = require('@getsafle/vault-housekeeper').Vault;

const {
  _validatePassword,
} = require('../utils/helper');

const {
  RPC_URL_ROPSTEN,
  RPC_URL_RINKEBY,
  RPC_URL_KOVAN,
  RPC_URL_GOERLI,
  RPC_URL_MAINNET,
} = require('../config');

class Vault {
  constructor(network, env) {
    this.env = env;
    this.network = network;
    this.initializeVaultSDK();
  }

  initializeVaultSDK() {
    let vault;

    if (this.network === 'mainnet') {
      vault = new VaultSDK(RPC_URL_MAINNET);
    } else if (this.network === 'ropsten') {
      vault = new VaultSDK(RPC_URL_ROPSTEN);
    } else if (this.network === 'rinkeby') {
      vault = new VaultSDK(RPC_URL_RINKEBY);
    } else if (this.network === 'kovan') {
      vault = new VaultSDK(RPC_URL_KOVAN);
    } else {
      vault = new VaultSDK(RPC_URL_GOERLI);
    }

    this.vault = vault;
  }

  async validatePassword(password, authToken) {
    const { error, response } = await _validatePassword({ password, authToken, env: this.env });

    if (error) {
      return { error };
    }

    return { response };
  }

  async generateVault(password, authToken) {
    const { error } = await this.validatePassword(password, authToken);

    if (error) {
      return { error };
    }

    const { response: vault } = await this.vault.generateVault(password);

    return { response: vault };
  }

  async retrieveVault(password, persistLocation, authToken) {
    const { error } = await this.validatePassword(password, authToken);

    if (error) {
      return { error };
    }

    const { error: RETRIEVE_ERROR, response } = await this.vault.retrieveVault(password, this.env, this.authToken, persistLocation);

    if (RETRIEVE_ERROR) {
      return { error: RETRIEVE_ERROR };
    }

    return { response };
  }

  async addAccount(vault, password, authToken) {
    const { error } = await this.validatePassword(password, authToken);

    if (error) {
      return { error };
    }

    const { response: keyring } = await this.vault.extractKeyring(vault, password);

    const { response } = await this.vault.addAccount(keyring, password);

    return { response };
  }

  async persistVault(vault, password, persistType, persistLocation, authToken) {
    const { error: PERSIST_ERROR, response } = await this.vault.persistVault(vault, authToken, this.env, password, persistType, persistLocation);

    if (PERSIST_ERROR) {
      return { error: PERSIST_ERROR };
    }

    return { response };
  }

  async generateVaultAndPersist(password, persistLocation, authToken) {
    const { response: vault, error } = await this.generateVault(password, authToken);

    if (error) {
      return { error };
    }

    const { error: PERSIST_ERROR, response } = await this.persistVault(vault, password, 'POST', persistLocation, authToken);

    if (PERSIST_ERROR) {
      return { error: PERSIST_ERROR };
    }

    return { response };
  }

  async addAccountAndPersist(vault, password, persistLocation, authToken) {
    const { error, response: newVault } = await this.addAccount(vault, password, authToken);

    if (error) {
      return { error };
    }

    const { error: PERSIST_ERROR, response } = await this.persistVault(newVault, password, 'PATCH', persistLocation, authToken);

    if (PERSIST_ERROR) {
      return { error: PERSIST_ERROR };
    }

    return { response };
  }
}

module.exports = Vault;
