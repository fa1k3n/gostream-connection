import { Socket } from "net";
import { GoStream } from "../index";
import crc16modbus from "crc/crc16modbus";
import { ReqType } from "../enums";

function buildPacket(
  cmdId: string,
  cmdType: ReqType,
  value: (number | string)[],
): Buffer {
  const json = JSON.stringify({
    id: cmdId,
    type: cmdType,
    value: value,
  });
  const data = Buffer.from(json);
  const packetLen = data.length + 7;
  const packet = Buffer.alloc(packetLen);
  packet[0] = 0xeb;
  packet[1] = 0xa6;
  packet[2] = 0;
  packet.writeUInt16LE(packetLen - 5, 3);

  if (data != undefined) data.copy(packet, 5, 0, data.length);
  packet.writeUInt16LE(
    crc16modbus(packet.subarray(0, packetLen - 2)),
    packet.length - 2,
  );
  return packet;
}

jest.mock("net", () => {
  return {
    Socket: jest.fn().mockImplementation(() => {
      const EventEmitter = require("events"); // eslint-disable-line @typescript-eslint/no-require-imports
      const emitter = new EventEmitter();
      emitter.setKeepAlive = jest.fn();
      emitter.setNoDelay = jest.fn();
      emitter.connect = jest.fn();
      emitter.write = jest.fn();
      emitter.injectData = (packet: Buffer) => {
        emitter.emit("data", packet);
      };

      return emitter;
    }),
  };
});

describe("gostream", () => {
  beforeEach(() => {
    (Socket as any).mockClear();
  });

  test("GoStream connect with a port argument", async () => {
    const device = new GoStream();
    device.connect("10.10.10.10", 19010);
    const socket = (device as any)._socket;
    expect(socket).toBeTruthy();
    expect(socket.connect).toHaveBeenCalledTimes(1);
    expect(socket.connect).toHaveBeenCalledWith(19010, "10.10.10.10");
  });

  test("GoStream connect without a port argument", async () => {
    const device = new GoStream();
    device.connect("10.10.10.10");
    const socket = (device as any)._socket;
    expect(socket).toBeTruthy();
    expect(socket.connect).toHaveBeenCalledTimes(1);
    expect(socket.connect).toHaveBeenCalledWith(19010, "10.10.10.10");
  });

  test("Handle correct packets received", async () => {
    const device = new GoStream();
    device.connect("10.10.10.10");
    const socket = (device as any)._socket;
    const receivedCommandsSpy = jest.fn();
    device.on("receivedCommands", receivedCommandsSpy);
    const packet = buildPacket("streamOutput", ReqType.Get, [0, 1]);
    socket.injectData(packet);
    socket.injectData(packet);
    expect(receivedCommandsSpy).toHaveBeenCalledTimes(2);
  });

  test("Handle unknown commands received", async () => {
    const device = new GoStream();
    device.connect("10.10.10.10");
    const socket = (device as any)._socket;
    const receivedCommandsSpy = jest.fn();
    const errorSpy = jest.fn();
    device.on("receivedCommands", receivedCommandsSpy);
    device.on("error", errorSpy);
    const packet = buildPacket("Foo", ReqType.Get, [0, 1]);
    socket.injectData(packet);
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy.mock.calls[0][0]).toBe("Unknown command: Foo");
    expect(receivedCommandsSpy).toHaveBeenCalledTimes(0);
  });

  test("Handle bad CRC checksum", async () => {
    const device = new GoStream();
    device.connect("10.10.10.10");
    const socket = (device as any)._socket;
    const receivedCommandsSpy = jest.fn();
    const errorSpy = jest.fn();
    device.on("receivedCommands", receivedCommandsSpy);
    device.on("error", errorSpy);
    const packet = buildPacket("receivedCommands", ReqType.Get, [0, 1]);
    packet[packet.length - 1] = 0x0;
    socket.injectData(packet);
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy.mock.calls[0][0]).toBe(
      "Failed to unpack data: Error: recv data crc error",
    );
    expect(receivedCommandsSpy).toHaveBeenCalledTimes(0);
  });
});
