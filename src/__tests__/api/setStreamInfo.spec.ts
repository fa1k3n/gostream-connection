import { GoStream } from "../../index";
import { Streaming } from "../../state";
import crc16modbus from "crc/crc16modbus";

import * as Commands from "../../commands";
import { StreamOutputCommand } from "../../commands";
import { ReqType } from "../../enums";
import { ProtocolVersion } from "../../enums";

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

function jsonFromData(data: Buffer): any {
  return JSON.parse(data.subarray(5, data.length - 2).toString("utf8"));
}

describe("gostream", () => {
  let device: GoStream;
  beforeEach(() => {
    //;(Socket as any).mockClear()
    jest.clearAllMocks();
    device = new GoStream();
    device.connect("10.10.10.10");
  });

  test("streamInfo with no arguments will return state", async () => {
    const info = device.streamInfo(0) as Streaming.StreamInfo;
    expect(info.enable).toBeFalsy();
    expect(info.platform).toBe("");
  });

  test("GoStream streamInfo with enable set", async () => {
    const socket = (device as any)._socket;

    device.streamInfo(0, { enable: true });
    const data: Buffer = socket.write.mock.calls[0][0];
    let packet = jsonFromData(data);
    expect(packet.id).toBe("streamOutput");
    expect(packet.value).toStrictEqual([0, 1]);

    device.streamInfo(1, { enable: false });
    packet = jsonFromData(socket.write.mock.calls[1][0]);
    expect(packet.id).toBe("streamOutput");
    expect(packet.value as number[]).toEqual([1, 0]);
  });

  test("streamOutput PUS messages within limits", async () => {
    const socket = (device as any)._socket;
    socket.injectCommand(new StreamOutputCommand(0, true));
    let info = device.streamInfo(0) as Streaming.StreamInfo;
    expect(info.enable).toBeTruthy();

    socket.injectCommand(new StreamOutputCommand(2, true));
    info = device.streamInfo(2) as Streaming.StreamInfo;
    expect(info.enable).toBeTruthy();

    socket.injectCommand(new StreamOutputCommand(2, false));
    info = device.streamInfo(2) as Streaming.StreamInfo;
    expect(info.enable).toBeFalsy();
  });

  test("streamOutput PUS messages outside limits", async () => {
    const socket = (device as any)._socket;
    const spy = jest.fn();
    device.on("error", spy);
    socket.injectCommand(new StreamOutputCommand(4, true));
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(
      "Failed to deserialize command: DeserializationError: streamOutput received with value out of range: 4",
    );
  });

  test("streamOutput has been requested three times with correct index when a connection is established", async () => {
    const socket = (device as any)._socket;
    socket.emit("connect");
    const streamOutputPackages: Commands.IGetCommand[] = [];
    socket.write.mock.calls.forEach((call) => {
      const packet = jsonFromData(call[0]);
      if (packet.id === "streamOutput") streamOutputPackages.push(packet);
    });
    // the GoStream supports 3 streams , id 0, 1 & 2
    expect(streamOutputPackages.length).toBe(3);
    expect(streamOutputPackages[0]["value"]).toEqual([0]);
    expect(streamOutputPackages[1]["value"]).toEqual([1]);
    expect(streamOutputPackages[2]["value"]).toEqual([2]);
  });
});
