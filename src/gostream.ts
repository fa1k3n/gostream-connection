import { EventEmitter } from 'eventemitter3'
import { Socket } from 'net'
import { IDeserializedCommand, VersionCommand } from './commands'
import * as Commands from './commands'
import crc16modbus from 'crc/crc16modbus'
import { ProtocolVersion, ReqType, TransitionStyle } from './enums'
import { CommandParser } from './lib/gostreamCommandParser'
import { GoStreamState, GoStreamStateUtil } from './state'

const HEAD1 = 0xeb
const HEAD2 = 0xa6
const PACKET_HEADER_SIZE = 5
const PACKET_HEAD = new Uint8Array([HEAD1, HEAD2])

export type GoStreamEvents = {
	error: [string]
	info: [string]
	debug: [string]
	connected: []
	disconnected: []
    stateChanged: [GoStreamState, string[]]
    receivedCommands: [IDeserializedCommand[]]
}

export class BasicGoStream extends EventEmitter<GoStreamEvents>  {
    private readonly _socket: Socket
    private partialPacketBuffer: Buffer
    private readonly _commandParser: CommandParser = new CommandParser()
    private _state: GoStreamState | undefined


    constructor() {
		super()
        this._socket = new Socket()
        this._socket.setKeepAlive(true)
		this._socket.setNoDelay(true)

        this._state = GoStreamStateUtil.Create()
        
        this._socket.on('connect', () => {
            this.emit('connected')
        })
        this._socket.on('error', (err) => {
            console.log("ERROR")
            this.emit('error', err.message)
        })
        this._socket.on('drain', () => {
            
        })
        this._socket.on('end', () => {
            this._socket?.destroy()
            this.emit('disconnected')
        })
        this._socket.on('data', (msg_data) => {
            let cmds = this.handleGoStreamPacket(msg_data)
            this.emit('receivedCommands', cmds)
            this.updateState(cmds);
        })
    }

    public connect(address: string, port?: number): void {
        this._socket.connect(port, address)
    }

	public async disconnect(): Promise<void> {
	}

    private updateState(cmds: IDeserializedCommand[]) {

        const allChangedPaths: string[] = []
		const state = this._state
        for (const command of cmds) {
            if(state) {
                try {
					const changePaths = command.applyToState(state)
					if (!Array.isArray(changePaths)) {
						allChangedPaths.push(changePaths)
					} else {
						allChangedPaths.push(...changePaths)
					}
				} catch (e) {
					console.log(command, "ERROR", e)
				}
            }
        }

        if (state && allChangedPaths.length > 0) {
			this.emit('stateChanged', state, allChangedPaths)
		}
    }

    private handleGoStreamPacket(msg_data: Buffer): IDeserializedCommand[] {
        const commands: IDeserializedCommand[] = []

        let index = msg_data.indexOf(PACKET_HEAD)
        // Take care of data before start of packet, i.e. if index > 0
        // OR packets that dont have a head i.e. index < 0
        // The data needs to be merged with hopefully saved data
        if (index !== 0) {
            if (this.partialPacketBuffer.length > 0) {
                // Either we have found a head sequence or this is plain data
                const offset = index > 0 ? index : msg_data.length
                // Merge with saved packet data
                const packet_data = Buffer.alloc(this.partialPacketBuffer.length + offset, this.partialPacketBuffer)
                const remaining_data = msg_data.subarray(0, offset)
                remaining_data.copy(packet_data, this.partialPacketBuffer.length)

                if (index > 0) {
                    // We did found a head somewhere later in data
                    // process packet to that index then resume with
                    // rest of package in while loop below
                    commands.push(this.unpackData(packet_data))
                    this.partialPacketBuffer = null
                } else if (index < 0) {
                    // All data in this msg_data belongs to same package
                    // as we did not find any head sequence
                    const expected_length = packet_data.readUInt16LE(3)
                    if (expected_length + 5 === packet_data.length) {
                        // This is a full packet received, process it
                        commands.push(this.unpackData(packet_data))
                        this.partialPacketBuffer = null
                    } else {
                        // Save packet_data as it is not complete yet
                        this.partialPacketBuffer = Buffer.from(packet_data)
                    }
                    return commands
                }
            } else {
                console.error('packet data out of order, dropping packet!')
                return []
            }
        }

        while (index >= 0) {
            const packet_size = msg_data.readUInt16LE(index + 3)
            const packet_data = msg_data.subarray(index, index + PACKET_HEADER_SIZE + packet_size)
            if (index + PACKET_HEADER_SIZE + packet_size > msg_data.length) {
                // Packet is not complete, save this in partial packet buffer
                this.partialPacketBuffer = Buffer.alloc(msg_data.length - index, msg_data.subarray(index))
                break
            }
            commands.push(this.unpackData(packet_data))
            index = msg_data.indexOf(PACKET_HEAD, index + PACKET_HEADER_SIZE + packet_size)
        }

        return commands
    }

    private unpackData(msg_data: Buffer): IDeserializedCommand {
        try {
            const jsonContent = this.UnpackDatas(msg_data)
            const jsonStr = jsonContent.toString('utf8')
            const json = JSON.parse(jsonStr)

            const cmdConstructor = this._commandParser.commandFromRawName(json.id)
            if (cmdConstructor && typeof cmdConstructor.deserialize === 'function') {
				try {
					const cmd: IDeserializedCommand = cmdConstructor.deserialize(
						json.value,
						this._commandParser.version
					)

					if (cmd instanceof VersionCommand) {
						// init started
						this._commandParser.version = cmd.properties.version
					}
                    return cmd
				} catch (e) {
					this.emit('error', `Failed to deserialize command: ${cmdConstructor.constructor.name}: ${e}`)
				}
                
            } else {
                console.log("Unknown command", json.id)
                return new Commands.UnknownCommand(ProtocolVersion.V1)
            }
        } catch (err) {
            console.log("Error", err);
        }

        return 
        
    }

    private PackData(data: Buffer): Buffer {
        const packetLen = data.length + 7
        const packet = Buffer.alloc(packetLen)

        packet[0] = HEAD1
        packet[1] = HEAD2
        packet[2] = 0
        packet.writeUInt16LE(packetLen - 5, 3)

        if (data != undefined) data.copy(packet, 5, 0, data.length)
            packet.writeUInt16LE(crc16modbus(packet.subarray(0, packetLen - 2)), packet.length - 2)
        return packet
    }

    private UnpackDatas(resp: Buffer): Buffer {
        if (resp.length == 0) {
            throw new Error('recv null')
        }
        if (resp[0] != HEAD1 || resp[1] != HEAD2) {
            throw new Error('recv head error')
        }
        const resp_len = resp.readInt16LE(3)
        if (resp_len != resp.length - 5) {
            console.log(
                'Recv Error:' +
                    resp
                        .toString('hex')
                        .match(/.{1,2}/g)
                        ?.join(' '),
            )
            throw new Error('recv data length error')
        }
        if (!this.IsCrcOK(resp)) {
            throw new Error('recv data crc error')
        }
        return resp.subarray(5, resp.length - 2)
    }

    private IsCrcOK(datas: Buffer): boolean {
        const length = datas.length - 2
        const recvCrc = datas.readUInt16LE(length)
        const calcCrc = crc16modbus(datas.subarray(0, length))
        return recvCrc === calcCrc
    }

    protected sendCommand(cmd: Commands.ISerializableCommand, cmdType: ReqType = ReqType.Set): boolean {
        if (this._socket !== null) {
            const json = JSON.stringify({id: (cmd.constructor as any).rawName, type: cmdType, value: cmd.serialize(ProtocolVersion.V1) })
            const data = Buffer.from(json)
            const send_data = this.PackData(data)
            this._socket.write(send_data)
            return true
        }
        return false
    }
}

export class GoStream extends BasicGoStream {
    constructor() {
        super()
	}

    public async init(): Promise<boolean> {
        this.sendCommand(new Commands.VersionCommand(), ReqType.Get)
        this.sendCommand(new Commands.TransitionStyleCommand(), ReqType.Get)
        this.sendCommand(new Commands.PgmIndexCommand(), ReqType.Get)
        this.sendCommand(new Commands.PvwIndexCommand(), ReqType.Get)
        return true
    }

    public async cut(): Promise<boolean> {
		const command = new Commands.CutCommand()
		return this.sendCommand(command)
	}

    public async setTransitionStyle(style: TransitionStyle): Promise<boolean> {
        const command = new Commands.TransitionStyleCommand(style)
        return this.sendCommand(command)
    }

    public async previewTransition(on: boolean): Promise<boolean> {
		const command = new Commands.PreviewTransitionCommand(on)
		return this.sendCommand(command)
	}
}