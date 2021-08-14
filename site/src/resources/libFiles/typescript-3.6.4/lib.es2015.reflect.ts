const fileData = {
    fileName: `/lib.es2015.reflect.d.ts`,
    // File text is copyright Microsoft Corporation and is distributed under the Apache License, Version 2.0 (http://www.apache.org/licenses/LICENSE-2.0)
    text:
        `/// <reference no-default-lib="true"/>\ndeclare namespace Reflect{function apply(target:Function,thisArgument:any,argumentsList:ArrayLike<any>):any;function construct(target:Function,argumentsList:ArrayLike<any>,newTarget?:any):any;function defineProperty(target:object,propertyKey:PropertyKey,attributes:PropertyDescriptor):boolean;function deleteProperty(target:object,propertyKey:PropertyKey):boolean;function get(target:object,propertyKey:PropertyKey,receiver?:any):any;function getOwnPropertyDescriptor(target:object,propertyKey:PropertyKey):PropertyDescriptor|undefined;function getPrototypeOf(target:object):object;function has(target:object,propertyKey:PropertyKey):boolean;function isExtensible(target:object):boolean;function ownKeys(target:object):PropertyKey[];function preventExtensions(target:object):boolean;function set(target:object,propertyKey:PropertyKey,value:any,receiver?:any):boolean;function setPrototypeOf(target:object,proto:any):boolean;}`,
};

export default fileData;
