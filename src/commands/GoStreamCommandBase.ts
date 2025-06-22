import { ProtocolVersion, ReqType } from '../enums'
import { GoStreamState } from '../state'


export interface GoStreamCmd {
	id: string
	type: ReqType
	value?: (string | number)[]
}

export interface IDeserializedCommand {
	properties: any

	applyToState(state: GoStreamState): string | string[]
}

/** Base type for a receivable command */
export abstract class DeserializedCommand<T> implements IDeserializedCommand {
	public static readonly rawName?: string
	public static readonly minimumVersion?: ProtocolVersion

	public readonly properties: Readonly<T>

	constructor(properties: T) {
		this.properties = properties
	}

	public abstract applyToState(state: GoStreamState): string | string[]
}

export class UnknownCommand<T> extends DeserializedCommand<T> {
	public applyToState(state: GoStreamState): string | string[] {
		return ""
	}
} 

export interface ISerializableCommand {
	serialize(version: ProtocolVersion): Buffer
}

export abstract class BasicWritableCommand<T> implements ISerializableCommand {
	public static readonly rawName?: string
	public static readonly minimumVersion?: ProtocolVersion

	protected _properties: T

	public get properties(): Readonly<T> {
		return this._properties
	}

	constructor(properties: T) {
		this._properties = properties
	}

	public abstract serialize(version: ProtocolVersion): Buffer
}

export abstract class SymmetricalCommand<T> extends DeserializedCommand<T> implements ISerializableCommand {
	public abstract serialize(version: ProtocolVersion): Buffer
}