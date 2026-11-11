import raw from '@/generated/api/contract.json';
import { createContractRuntime, type ContractCatalog } from './schema-validator';
export type { Operation, Schema } from './schema-validator';
const runtime = createContractRuntime(raw as unknown as ContractCatalog);
export const { contract, resolve, validator, operationFor, operationKey } = runtime;
