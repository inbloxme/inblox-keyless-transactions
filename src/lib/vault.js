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
  constructor(network) {
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

  async validatePassword(password) {
    const { error, response } = await _validatePassword({ password, authToken: this.authToken, env: this.env });

    if (error) {
      return { error };
    }

    return { response };
  }

  async generateVault(password) {
    const { error } = await this.validatePassword(password);

    if (error) {
      return { error };
    }

    const { response: vault } = await this.vault.generateVault(password);

    return { response: vault };
  }
}

module.exports = Vault;
