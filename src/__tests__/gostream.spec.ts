
import { Socket } from 'net'
import { GoStream } from '../index'

jest.mock('net')

describe('gostream', () => {
	beforeEach(() => {
		;(Socket as any).mockClear()
	})

    test('GoStream connect with a port argument', async () => {
        const device = new GoStream()
        device.connect("10.10.10.10", 19010)
        const socket = (device as any)._socket
        expect(socket).toBeTruthy()
        expect(socket.connect).toHaveBeenCalledTimes(1)
        expect(socket.connect).toHaveBeenCalledWith(19010, '10.10.10.10')

    })

    test('GoStream connect without a port argument', async () => {
        const device = new GoStream()
        device.connect("10.10.10.10")
        const socket = (device as any)._socket
        expect(socket).toBeTruthy()
        expect(socket.connect).toHaveBeenCalledTimes(1)
        expect(socket.connect).toHaveBeenCalledWith(19010, '10.10.10.10')

    })
})