import { ProtocolVersion, ReqType } from '../enums'
import { GoStreamState } from '../state'


export interface GoStreamCmd {
	id: string
	type: ReqType
	value?: (string | number)[]
}

export interface IGetCommand {
	properties: any

	applyToState(state: GoStreamState): string | string[]
}

/** Base type for a receivable command */
export abstract class GetCommand<T> implements IGetCommand {
	public static readonly rawName?: string
	public static readonly minimumVersion?: ProtocolVersion

	public readonly properties: Readonly<T>

	constructor(properties: T) {
		this.properties = properties
	}

	public abstract applyToState(state: GoStreamState): string | string[]
}

export class UnknownCommand<T> extends GetCommand<T> {
	public applyToState(_state: GoStreamState): string | string[] {
		return ""
	}
} 

export interface ISetCommand {
	serialize(version: ProtocolVersion): (string | number)[]
}

export abstract class BasicSetCommand<T> implements ISetCommand {
	public static readonly rawName?: string
	public static readonly minimumVersion?: ProtocolVersion

	protected _properties: T

	public get properties(): Readonly<T> {
		return this._properties
	}

	constructor(properties: T) {
		this._properties = properties
	}

	public abstract serialize(version: ProtocolVersion): (string | number)[]
}

export abstract class GoStreamCommand<T> extends GetCommand<T> implements ISetCommand {
	public static readonly rawName?: string
	public static readonly minimumVersion?: ProtocolVersion
	public abstract serialize(version: ProtocolVersion): (string | number)[]
}