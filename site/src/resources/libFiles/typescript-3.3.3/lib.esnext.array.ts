const fileData = {
    fileName: `/lib.esnext.array.d.ts`,
    // File text is copyright Microsoft Corporation and is distributed under the Apache License, Version 2.0 (http://www.apache.org/licenses/LICENSE-2.0)
    text:
        `/// <reference no-default-lib="true"/>\ninterface ReadonlyArray<T>{flatMap<U,This=undefined>(callback:(this:This,value:T,index:number,array:T[])=>U|ReadonlyArray<U>,thisArg?:This):U[]\nflat<U>(this:ReadonlyArray<U[][][][]>|\nReadonlyArray<ReadonlyArray<U[][][]>>|\nReadonlyArray<ReadonlyArray<U[][]>[]>|\nReadonlyArray<ReadonlyArray<U[]>[][]>|\nReadonlyArray<ReadonlyArray<U>[][][]>|\nReadonlyArray<ReadonlyArray<ReadonlyArray<U[][]>>>|\nReadonlyArray<ReadonlyArray<ReadonlyArray<U>[][]>>|\nReadonlyArray<ReadonlyArray<ReadonlyArray<U>>[][]>|\nReadonlyArray<ReadonlyArray<ReadonlyArray<U>[]>[]>|\nReadonlyArray<ReadonlyArray<ReadonlyArray<U[]>>[]>|\nReadonlyArray<ReadonlyArray<ReadonlyArray<U[]>[]>>|\nReadonlyArray<ReadonlyArray<ReadonlyArray<ReadonlyArray<U[]>>>>|\nReadonlyArray<ReadonlyArray<ReadonlyArray<ReadonlyArray<U>[]>>>|\nReadonlyArray<ReadonlyArray<ReadonlyArray<ReadonlyArray<U>>[]>>|\nReadonlyArray<ReadonlyArray<ReadonlyArray<ReadonlyArray<U>>>[]>|\nReadonlyArray<ReadonlyArray<ReadonlyArray<ReadonlyArray<ReadonlyArray<U>>>>>,depth:4):U[];flat<U>(this:ReadonlyArray<U[][][]>|\nReadonlyArray<ReadonlyArray<U>[][]>|\nReadonlyArray<ReadonlyArray<U[]>[]>|\nReadonlyArray<ReadonlyArray<U[][]>>|\nReadonlyArray<ReadonlyArray<ReadonlyArray<U[]>>>|\nReadonlyArray<ReadonlyArray<ReadonlyArray<U>[]>>|\nReadonlyArray<ReadonlyArray<ReadonlyArray<U>>[]>|\nReadonlyArray<ReadonlyArray<ReadonlyArray<ReadonlyArray<U>>>>,depth:3):U[];flat<U>(this:ReadonlyArray<U[][]>|\nReadonlyArray<ReadonlyArray<U[]>>|\nReadonlyArray<ReadonlyArray<U>[]>|\nReadonlyArray<ReadonlyArray<ReadonlyArray<U>>>,depth:2):U[];flat<U>(this:ReadonlyArray<U[]>|\nReadonlyArray<ReadonlyArray<U>>,depth?:1):U[];flat<U>(this:ReadonlyArray<U>,depth:0):U[];flat<U>(depth?:number):any[];}interface Array<T>{flatMap<U,This=undefined>(callback:(this:This,value:T,index:number,array:T[])=>U|ReadonlyArray<U>,thisArg?:This):U[]\nflat<U>(this:U[][][][][][][][],depth:7):U[];flat<U>(this:U[][][][][][][],depth:6):U[];flat<U>(this:U[][][][][][],depth:5):U[];flat<U>(this:U[][][][][],depth:4):U[];flat<U>(this:U[][][][],depth:3):U[];flat<U>(this:U[][][],depth:2):U[];flat<U>(this:U[][],depth?:1):U[];flat<U>(this:U[],depth:0):U[];flat<U>(depth?:number):any[];}`,
};

export default fileData;
