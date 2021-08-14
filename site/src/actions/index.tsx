import { CompilerApi, Node } from "../compiler";
import { actions as constants } from "../constants";
import { ApiLoadingState, OptionsState } from "../types";

export interface SetCode {
    type: constants.SET_CODE;
    code: string;
}

export function setCode(code: string): SetCode {
    return {
        type: constants.SET_CODE,
        code,
    };
}
export interface SetQuery {
    type: constants.SET_QUERY;
    query: string;
}

export function setQuery(query: string): SetQuery {
    return {
        type: constants.SET_QUERY,
        query,
    };
}

export interface SetApiLoadingState {
    type: constants.SET_API_LOADING_STATE;
    loadingState: ApiLoadingState;
}

export function setApiLoadingState(loadingState: ApiLoadingState): SetApiLoadingState {
    return {
        type: constants.SET_API_LOADING_STATE,
        loadingState,
    };
}

export interface RefreshSourceFile {
    type: constants.REFRESH_SOURCEFILE;
    api: CompilerApi;
}

export function refreshSourceFile(api: CompilerApi): RefreshSourceFile {
    return {
        type: constants.REFRESH_SOURCEFILE,
        api,
    };
}

export interface SetSelectedNode {
    type: constants.SET_SELECTED_NODE;
    node: Node;
}

export function setSelectedNode(node: Node): SetSelectedNode {
    return {
        type: constants.SET_SELECTED_NODE,
        node,
    };
}

export interface SetOptions {
    type: constants.SET_OPTIONS;
    options: Partial<OptionsState>;
}

export function setOptions(options: Partial<OptionsState>): SetOptions {
    return {
        type: constants.SET_OPTIONS,
        options,
    };
}

export interface SetGenerator {
    type: constants.SET_GENERATOR;
    code: string;
}
export interface CreateGenerator {
    type: constants.CREATE_GENERATOR;
    name: string;
}

export interface SelectGenerator {
    type: constants.SELECT_GENERATOR;
    name: string;
}
export type AllActions =
    | SetCode
    | SetApiLoadingState
    | RefreshSourceFile
    | SetSelectedNode
    | SetOptions
    | SetQuery
    | SetGenerator
    | SelectGenerator
    | CreateGenerator;
