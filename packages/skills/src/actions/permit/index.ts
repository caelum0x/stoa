import type { Action } from "../../types.js";
import { erc2612NoncesAction } from "./nonces.js";
import { erc2612DomainSeparatorAction } from "./domainSeparator.js";

export const permitActions: Action[] = [erc2612NoncesAction, erc2612DomainSeparatorAction];

export { erc2612NoncesAction, erc2612DomainSeparatorAction };
