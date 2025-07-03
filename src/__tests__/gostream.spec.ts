import { Socket } from "net";
import { GoStream } from "../index";
import crc16modbus from "crc/crc16modbus";
import * as Commands from "../commands";
import { ReqType, ProtocolVersion } from "../enums";

jest.mock("net", () => {
  return {
    Socket: jest.fn().mockImplementation(() => {
      const EventEmitter = require("events"); // eslint-disable-line @typescript-eslint/no-require-imports
      const emitter = new EventEmitter();
      emitter.setKeepAlive = jest.fn();
      emitter.setNoDelay = jest.fn();
      emitter.connect = jest.fn();
      emitter.write = jest.fn();

      emitter.injectCommand = (
        cmd: Commands.ISetCommand,
        cmdType: ReqType = ReqType.Push,
        protoversion: ProtocolVersion = ProtocolVersion.V1,
      ) => {
        const json = JSON.stringify({
          id: (cmd.constructor as any).rawName,
          type: cmdType,
          value: cmd.serialize(protoversion),
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

  test("Handle correct packets received", async() => {
      const device = new GoStream();
      device.connect("10.10.10.10");
      const socket = (device as any)._socket;
      const spy = jest.fn() 
      device.on('receivedCommands', spy)
      socket.injectCommand(new Commands.StreamOutputCommand(0, true));
      socket.injectCommand(new Commands.StreamOutputCommand(0, true));
      expect(spy).toHaveBeenCalledTimes(2)
  })


});
