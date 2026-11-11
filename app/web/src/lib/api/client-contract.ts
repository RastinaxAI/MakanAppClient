import raw from '@/generated/api/browser-contract.json';
import { createContractRuntime, type ContractCatalog } from './schema-validator';
// A generated closure of browser consumers; the BFF retains the full allowed contract.
const runtime = createContractRuntime(raw as unknown as ContractCatalog);
export const clientContract = runtime.contract;
export const clientValidator = runtime.validator;
export const clientOperationFor = runtime.operationFor;
