interface IBrokersWrapper {
  brokerName: Brokers;
}

enum Brokers {
  Tradestation
}

class BrokersWrapper {
  private readonly brokerName: Brokers;
  private broker: IBroker | undefined;

  constructor(options: IBrokersWrapper) {
    this.brokerName = options.brokerName;
    this.broker = this.getBroker(this.brokerName);
  }

  getBroker = (brokerName: Brokers): IBroker => {
    switch (brokerName) {
      case Brokers.Tradestation: {
        return new Tradestation();
      }
    }
  };

  loginRedirect() {
    if(this.broker !== undefined) {
      window.location.href = this.broker.getLoginRedirectUrl()
    }
  }
}

interface IBroker {
  getLoginRedirectUrl: () => string;
}

class Tradestation implements IBroker {
  private clientId: string = `vJehUJUnvo3soMzTVAQruwwdFXFtsDC1`;
  private redirectUri: string = `https://10.100.102.127:5173`

  getLoginRedirectUrl = (): string => {
    return `https://signin.tradestation.com/authorize?response_type=code&client_id=${this.clientId}&redirect_uri=${this.redirectUri}&audience=https://api.tradestation.com&state=STATE&scope=openid offline_access profile MarketData ReadAccount Trade Matrix OptionSpreads`;
  };
}