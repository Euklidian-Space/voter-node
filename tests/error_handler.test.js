const ErrorTypes = require("../errors/error_types");
const ErrorHandler = require("../errors/handler");
const { UserErrs } = ErrorTypes;

describe("ErrorHandler", () => {
  it("should handle REGISTRATION_ERR", done => {
    const errObj = { 
      errors: {
        message: "some message" 
      },
      name: "ValidationError"
    };
    const received = ErrorHandler(errObj);
    const expected = {
      type: UserErrs.REGISISTRATION_ERR,
      errors: {
        message: "some message"
      }
    };

    expect(received).toEqual(expected);

    done();
  });
});