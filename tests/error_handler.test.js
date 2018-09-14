const HandleError = require("src/errors/handler");

describe("ErrorHandler", () => {
  let res, req, sendSpy, statusMock, next;
  beforeEach(() => {
    sendSpy = jest.fn();
    statusMock = jest.fn().mockImplementation(code => res);
    res = {
      send: sendSpy,
      status: statusMock
    };
    next = jest.fn();
  });

  it("should handle ValidationError", async () => {
    const errObj = {
      errors: {
        some_path: {
          message: "Path `some_path` is required",
          name: "ValidationError",
          properties: {
            message: "Path `some_path` is required",
            path: "some_path"
          }
        }
      },
      name: "ValidationError"
    };
    const errs = await HandleError(errObj, req, res);
    expect(errs).toEqual({message: "`some_path` is required"});
    /**
     * let's change how message looks for this error handler
     */
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(sendSpy).toHaveBeenCalledWith({message: "`some_path` is required"});
  });

  it("should handle INVALID_ID error type", async () => {
    const errObj = {
      message: "some message", 
      name: "INVALID_ID_ERR"
    };
    const errs = await HandleError(errObj, req, res);
    expect(errs).toEqual(errObj)
    expect(statusMock).toHaveBeenCalledWith(404);
    return expect(sendSpy).toHaveBeenCalledWith({message: errObj.message});
  });

  it("should handle UserNotFoundError type", async () => {
    const errObj = {
      message: "user not found.", 
      name: "UserNotFoundError"
    };
    const errs = await HandleError(errObj, req, res);
    expect(errs).toEqual(errObj)
    expect(statusMock).toHaveBeenCalledWith(404);
    return expect(sendSpy).toHaveBeenCalledWith({message: errObj.message});
  });

  it("should handle PollNotFoundError type", async () => {
    const errObj = {
      message: "some message", 
      name: "PollNotFoundError"
    };
    const errs = await HandleError(errObj, req, res);
    expect(errs).toEqual(errObj);
    expect(statusMock).toHaveBeenCalledWith(404);
    return expect(sendSpy).toHaveBeenCalledWith({message: errObj.message});
  });

  it("should hand LoginError type", async () => {
    const errObj = {
      message: "some message",
      name: "LoginError"
    };
    const errs = await HandleError(errObj, req, res);
    expect(errs).toEqual(errObj);
    expect(statusMock).toHaveBeenCalledWith(401);
    return expect(sendSpy).toHaveBeenCalledWith({message: errObj.message});
  });

  it("should send 500 status as default", async () => {
    const errObj = {
      errors: {
        message: "some message"
      },
      name: "SOME_ERROR"
    };
    const errs = await HandleError(errObj, req, res);
    expect(errs).toEqual(errObj);
    expect(statusMock).toHaveBeenCalledWith(500);
    expect(sendSpy).toHaveBeenCalledWith(errObj);
  });

  it("should handle Auth_Error", async () => {
    const errObj = {
      message: "some message",
      name: "Auth_Error"
    };
    const errs = await HandleError(errObj, req, res);
    expect(errs).toEqual(errObj);
    expect(statusMock).toHaveBeenCalledWith(401);
    return expect(sendSpy).toHaveBeenCalledWith({message: errObj.message});
  });

});