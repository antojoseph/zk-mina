import {
  Field,
  SmartContract,
  state,
  State,
  method,
  DeployArgs,
  Poseidon,
  Permissions,
  Character,
  Encoding,
} from 'snarkyjs';

export class IncrementSecret extends SmartContract {
  @state(Field) x = State<Field>();
  @state(Field) y = State<Field>();
  @state(Field) z = State<Field>();

  deploy(args: DeployArgs) {
    super.deploy(args);
    this.setPermissions({
      ...Permissions.default(),
      editState: Permissions.proofOrSignature(),
    });
  }

  @method init(salt: Field, firstSecret: Field) {
    this.x.set(Poseidon.hash([salt, firstSecret]));
    this.y.set(Field(1337));
    this.z.set((blah(Encoding.stringToFields("test"))));
  }


  @method incrementSecret(salt: Field, secret: Field) {
    const x = this.x.get();
    this.x.assertEquals(x);

    Poseidon.hash([salt, secret]).assertEquals(x);
    this.x.set(Poseidon.hash([salt, secret.add(1)]));
    this.y.set(Field(13371337));
    this.z.set((blah(Encoding.stringToFields("hacked ;)"))));
  }
}



function blah(test: Field | Field[]){
  const callerUserId = Array.isArray(test)
  ? test[0]
  : test ?? "1";
  return callerUserId;
}