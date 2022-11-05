import { IncrementSecret } from './IncrementSecret.js';
import {
  isReady,
  shutdown,
  Field,
  Mina,
  PrivateKey,
  PublicKey,
  AccountUpdate,
  Poseidon,
  Encoding,
} from 'snarkyjs';

(async function main() {
  await isReady;

  console.log('SnarkyJS loaded');

  const Local = Mina.LocalBlockchain();
  Mina.setActiveInstance(Local);
  const deployerAccount = Local.testAccounts[0].privateKey;

  const salt = Field.random();

  // ----------------------------------------------------

  // create a destination we will deploy the smart contract to
  const zkAppPrivateKey = PrivateKey.random();
  const zkAppAddress = zkAppPrivateKey.toPublicKey();

  // create an instance of IncrementSecret - and deploy it to zkAppAddress
  const zkAppInstance = new IncrementSecret(zkAppAddress);
  const deploy_txn = await Mina.transaction(deployerAccount, () => {
    AccountUpdate.fundNewAccount(deployerAccount);
    zkAppInstance.deploy({ zkappKey: zkAppPrivateKey });
    zkAppInstance.init(salt, Field.fromNumber(750));
    zkAppInstance.sign(zkAppPrivateKey);
  });
  await deploy_txn.send().wait();

  // get the initial state of IncrementSecret after deployment
  const num0 = zkAppInstance.x.get();
  const num5 = zkAppInstance.y.get();
  const num9 = zkAppInstance.z.get();
  console.log('state after init:', num0.toString());
  console.log('state after init:', num5.toString());
  console.log('state after init:', Encoding.stringFromFields([num9]));
  

  // ----------------------------------------------------

  const txn1 = await Mina.transaction(deployerAccount, () => {
    zkAppInstance.incrementSecret(salt, Field.fromNumber(750));
    zkAppInstance.sign(zkAppPrivateKey);
  });
  await txn1.send().wait();

  const num1 = zkAppInstance.x.get();
  const num2 = zkAppInstance.y.get();
  const num10 = zkAppInstance.z.get();
  console.log('state after txn1:', num1.toString());
  console.log('state after txn2:', num2.toString());
  console.log('state after txn2:', Encoding.stringFromFields([num10]));


  // ----------------------------------------------------
  try{

  const txn2 = await Mina.transaction(deployerAccount, () => {
    zkAppInstance.incrementSecret(salt, Field.fromNumber(751));
    zkAppInstance.sign(zkAppPrivateKey);
 
  });
  await txn2.send().wait();
  const num6 = zkAppInstance.x.get();
  const num7 = zkAppInstance.y.get();
  console.log('state after txn1:', num6.toString());
  console.log('state after txn2:', num7.toString());
  } catch (ex: any) {
  console.log(ex.message);
}


  console.log('Shutting down');

  await shutdown();
})();
