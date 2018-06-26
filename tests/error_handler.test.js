const { to } = require("await-to-js");
const HandleError = require("../errors/handler");

describe("ErrorHandler", () => {
  let res, sendSpy, statusMock;
  beforeEach(() => {
    sendSpy = jest.fn();
    statusMock = jest.fn().mockImplementation(code => res);
    res = {
      send: sendSpy,
      status: statusMock
    };
  });

  it("should handle ValidationError", async () => {
    const errObj = {
      errors: {
        message: "some message"
      },
      name: "ValidationError"
    };
    [errs, _] = await to(HandleError(errObj, res));
    expect(errs).toEqual({message: "some message"});
    expect(statusMock).toHaveBeenCalledWith(404);
    expect(sendSpy).toHaveBeenCalledWith({message: "some message"});
  });

  it("should handle INVALID_ID error type", async () => {
    const errObj = {
      message: "some message", 
      name: "INVALID_ID_ERR"
    };
    const [errs, _] = await to(HandleError(errObj, res));
    expect(errs).toEqual(errObj)
    expect(statusMock).toHaveBeenCalledWith(404);
    return expect(sendSpy).toHaveBeenCalledWith({message: errObj.message});
  });

  it("should handle UserNotFoundError type", async () => {
    const errObj = {
      message: "user not found.", 
      name: "UserNotFoundError"
    };
    const [errs, _] = await to(HandleError(errObj, res));
    expect(errs).toEqual(errObj)
    expect(statusMock).toHaveBeenCalledWith(404);
    return expect(sendSpy).toHaveBeenCalledWith({message: errObj.message});
  });

  it("should handle PollNotFoundError type", async () => {
    const errObj = {
      message: "some message", 
      name: "PollNotFoundError"
    };
    const [errs, _] = await to(HandleError(errObj, res));
    expect(errs).toEqual(errObj);
    expect(statusMock).toHaveBeenCalledWith(404);
    return expect(sendSpy).toHaveBeenCalledWith({message: errObj.message});
  });

  it("should hand LoginError type", async () => {
    const errObj = {
      message: "some message",
      name: "LoginError"
    };
    const [errs, _] = await to(HandleError(errObj, res));
    expect(errs).toEqual(errObj);
    expect(statusMock).toHaveBeenCalledWith(404);
    return expect(sendSpy).toHaveBeenCalledWith({message: errObj.message});
  });

  it("should send 500 status as default", async () => {
    const errObj = {
      errors: {
        message: "some message"
      },
      name: "SOME_ERROR"
    };
    [errs, _] = await to(HandleError(errObj, res));
    expect(errs).toEqual(errObj);
    expect(statusMock).toHaveBeenCalledWith(500);
    expect(sendSpy).toHaveBeenCalledWith(errObj);
  });

});