const cron = require("node-cron");
const Web3 = require("web3");

class Worker {
  constructor(contractAddress, rpcs, blockNumber) {
    this.contractAddress = contractAddress;
    this.rpcs = rpcs;
    this.blockNumber = blockNumber;
  }
  contracts = [];
  // run worker here
  async run() {
    this.contracts.push(this.contractAddress);
    let isRunning = false;
    /**
     * suggest get current block number from database to continue from block
     * if there is no block number from db then flagBlock = this.blockNumber
     */
    let flagBlock = this.blockNumber;

    cron.schedule("*/2 * * * * *", async () => {
      if (isRunning) return;
      console.log(`worker start at block ${flagBlock}`);
      isRunning = true;

      for (let i = 0; i < this.rpcs.length; i++) {
        if (isRunning) {
          this.web3 = new Web3(this.rpcs[i]);
          // get latest block
          const currentBlock = await this.web3.eth.getBlockNumber();

          try {
            for (let block = flagBlock; block <= currentBlock; block++) {
              try {
                // get block data from rpc
                const blockData = await this.web3.eth.getBlock(block);
                console.log(blockData);

                // detect tx and write data into mongo here
              } catch (err) {
                console.log(
                  `failed to get block data at block ${block} - error ${err}`
                );
                flagBlock = block;
              }
            }

            isRunning = false;
            flagBlock = currentBlock;
          } catch (error) {
            console.log(
              `failed to run worker with rpc ${this.rpcs[i]} - error ${err}`
            );
          }
        }
      }
    });
  }
}

module.exports = Worker;
