/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../common";
import type {
  UdexLibraryTest,
  UdexLibraryTestInterface,
} from "../../test/UdexLibraryTest";

const _abi = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amountIn",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "reserveIn",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "reserveOut",
        type: "uint256",
      },
    ],
    name: "getAmountOut",
    outputs: [
      {
        internalType: "uint256",
        name: "amountOut",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b50610488806100206000396000f3fe608060405234801561001057600080fd5b506004361061002b5760003560e01c8063054d50d414610030575b600080fd5b61004a6004803603810190610045919061019b565b610060565b60405161005791906101fd565b60405180910390f35b600061006d848484610076565b90509392505050565b60008084116100ba576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016100b19061029b565b60405180910390fd5b6000831180156100ca5750600082115b610109576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016101009061032d565b60405180910390fd5b60006103e585610119919061037c565b905060008382610129919061037c565b90506000826103e88761013c919061037c565b61014691906103be565b905080826101549190610421565b93505050509392505050565b600080fd5b6000819050919050565b61017881610165565b811461018357600080fd5b50565b6000813590506101958161016f565b92915050565b6000806000606084860312156101b4576101b3610160565b5b60006101c286828701610186565b93505060206101d386828701610186565b92505060406101e486828701610186565b9150509250925092565b6101f781610165565b82525050565b600060208201905061021260008301846101ee565b92915050565b600082825260208201905092915050565b7f556465784c6962726172793a20494e53554646494349454e545f494e5055545f60008201527f414d4f554e540000000000000000000000000000000000000000000000000000602082015250565b6000610285602683610218565b915061029082610229565b604082019050919050565b600060208201905081810360008301526102b481610278565b9050919050565b7f556465784c6962726172793a20494e53554646494349454e545f4c495155494460008201527f4954590000000000000000000000000000000000000000000000000000000000602082015250565b6000610317602383610218565b9150610322826102bb565b604082019050919050565b600060208201905081810360008301526103468161030a565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b600061038782610165565b915061039283610165565b92508282026103a081610165565b915082820484148315176103b7576103b661034d565b5b5092915050565b60006103c982610165565b91506103d483610165565b92508282019050808211156103ec576103eb61034d565b5b92915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b600061042c82610165565b915061043783610165565b925082610447576104466103f2565b5b82820490509291505056fea2646970667358221220247342c196f0a61ce2b25398615e6ee29745aea4dfaea7c84bea25aaf12f194164736f6c63430008110033";

type UdexLibraryTestConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: UdexLibraryTestConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class UdexLibraryTest__factory extends ContractFactory {
  constructor(...args: UdexLibraryTestConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<UdexLibraryTest> {
    return super.deploy(overrides || {}) as Promise<UdexLibraryTest>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): UdexLibraryTest {
    return super.attach(address) as UdexLibraryTest;
  }
  override connect(signer: Signer): UdexLibraryTest__factory {
    return super.connect(signer) as UdexLibraryTest__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): UdexLibraryTestInterface {
    return new utils.Interface(_abi) as UdexLibraryTestInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): UdexLibraryTest {
    return new Contract(address, _abi, signerOrProvider) as UdexLibraryTest;
  }
}
