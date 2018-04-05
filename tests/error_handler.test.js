const { to } = require("await-to-js");
const ErrorTypes = require("../errors/error_types");
const HandleError = require("../errors/handler");
const { UserErrs, INTERNAL_ERR } = ErrorTypes;

describe("ErrorHandler", () => {
  let req, res, sendSpy, statusMock;
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