// dprint-ignore-file
/* Automatically maintained from package.json. Do not edit! */

import { CompilerPackageNames, CompilerVersions } from "../shared";
import { Node, CompilerApi } from "./CompilerApi";
import { assertNever } from "../utils";

export async function importCompilerApi(packageName: CompilerPackageNames) {
    // these explicit import statements are required to get webpack to include these modules
    switch (packageName) {
        case "typescript-4.3.2":
            return await import("typescript-4.3.2");
        default:
            return assertNever(packageName, `Not implemented version: ${packageName}`);
    }
}

export async function importLibFiles(packageName: CompilerPackageNames) {
    // these explicit import statements are required to get webpack to include these modules
    switch (packageName) {
        case "typescript-4.3.2":
            return await import("../resources/libFiles/typescript-4.3.2/index");
        default:
            return assertNever(packageName, `Not implemented version: ${packageName}`);
    }
}

export type FactoryCodeGenerator = (ts: CompilerApi, node: Node) => string;

export async function getGenerateFactoryCodeFunction(packageName: CompilerPackageNames): Promise<FactoryCodeGenerator> {
    // these explicit import statements are required to get webpack to include these modules
    switch (packageName) {
        case "typescript-4.3.2":
            return (await import("../resources/factoryCode/typescript-4.3.2")).generateFactoryCode as any;
        default:
            return assertNever(packageName, `Not implemented version: ${packageName}`);
    }
}

export interface PublicApiInfo {
    nodePropertiesBySyntaxKind: Map<string, Set<string>>;
    symbolProperties: Set<string>;
    typeProperties: Set<string>;
    signatureProperties: Set<string>;
}

export async function getPublicApiInfo(packageName: CompilerPackageNames): Promise<PublicApiInfo> {
    // these explicit import statements are required to get webpack to include these modules
    switch (packageName) {
        case "typescript-4.3.2":
            return (await import("../resources/publicApiInfo/typescript-4.3.2"));
        default:
            return assertNever(packageName, `Not implemented version: ${packageName}`);
    }
}
